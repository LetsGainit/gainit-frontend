import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { RefreshCw, Calendar, CheckCircle, BarChart3, GitPullRequest, ClipboardCheck, MessageSquare, Code, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getProjectById } from "../../services/projectsService";
import { getMyTasks, getBoardData } from "../../services/tasksService";
import { getProjectGitHubStats, getOpenPRsCount } from "../../services/github-stats.api";
import WorkAreaLayout from "../../components/layout/WorkAreaLayout";
import Footer from "../../components/Footer";
import MyTasks from "./ProjectWork/MyTasks";
import Forum from "./ProjectWork/Forum";
import CodeTab from "../Project/CodeTab";
import MilestonesTab from "../Project/MilestonesTab";
import "./ProjectWork.css";

const ProjectWork = () => {
  const { projectId } = useParams();
  const { userInfo, isAuthenticated, loading: authLoading } = useAuth();
  
  // Debug logging
  console.log('[ProjectWork] Component mounted with:', {
    projectId,
    userInfo,
    isAuthenticated,
    authLoading
  });
  
  // State management - initialize all arrays as empty arrays, objects as empty objects
  const [project, setProject] = useState({});
  const [myTasks, setMyTasks] = useState([]);
  const [board, setBoard] = useState([]);
  const [githubStats, setGithubStats] = useState({});
  const [activeTab, setActiveTab] = useState("My Tasks");
  const [activeView, setActiveView] = useState("my-projects");
  
  // Individual KPI states
  const [kpiStates, setKpiStates] = useState({
    progress: { loading: false, error: null, data: null },
    daysLeft: { loading: false, error: null, data: null },
    myOpenTasks: { loading: false, error: null, data: null },
    openPRs: { loading: false, error: null, data: null }
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Generate correlation ID
  const generateCorrelationId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Helper function to update KPI state
  const updateKpiState = (kpiName, updates) => {
    setKpiStates(prev => ({
      ...prev,
      [kpiName]: { ...prev[kpiName], ...updates }
    }));
  };

  // Fetch project details
  const fetchProject = useCallback(async () => {
    if (!projectId) {
      console.log('[PROJECT-WORK] No projectId provided');
      return;
    }

    const correlationId = generateCorrelationId();
    console.log(`[PROJECT-WORK] Fetching project ${projectId} with correlation ID: ${correlationId}`);

    try {
      updateKpiState('daysLeft', { loading: true, error: null });
      setError(null);

      const projectData = await getProjectById(projectId, correlationId);

      if (projectData) {
        console.log(`[PROJECT-WORK] Successfully fetched project:`, projectData);
        setProject(projectData || {});
        updateKpiState('daysLeft', { loading: false, data: projectData });
      } else {
        console.error("[PROJECT-WORK] Project data is null/undefined");
        setError("Project not found");
        setProject({});
        updateKpiState('daysLeft', { loading: false, error: "Project not found" });
      }
    } catch (err) {
      console.error("[PROJECT-WORK] Failed to fetch project:", err);
      setError(`Failed to load project details: ${err.message || 'Unknown error'}`);
      updateKpiState('daysLeft', { loading: false, error: err.message || "Failed to load project" });
    }
  }, [projectId]);

  // Fetch my tasks
  const fetchMyTasks = useCallback(async () => {
    if (!projectId || !userInfo?.userId) return;

    const correlationId = generateCorrelationId();
    console.log(`[PROJECT-WORK] Fetching my tasks for project ${projectId} with correlation ID: ${correlationId}`);

    try {
      updateKpiState('myOpenTasks', { loading: true, error: null });

      const tasksData = await getMyTasks(projectId, { includeCompleted: false, sortBy: 'CreatedAtUtc' }, correlationId);

      const safeTasksData = Array.isArray(tasksData) ? tasksData : [];
      console.log(`[PROJECT-WORK] Successfully fetched ${safeTasksData.length} tasks`);
      setMyTasks(safeTasksData);
      updateKpiState('myOpenTasks', { loading: false, data: safeTasksData });
    } catch (err) {
      console.error("[PROJECT-WORK] Failed to fetch my tasks:", err);
      updateKpiState('myOpenTasks', { loading: false, error: err.message || "Failed to load tasks" });
    }
  }, [projectId, userInfo?.userId]);

  // Fetch board data
  const fetchBoard = useCallback(async () => {
    if (!projectId) return;

    const correlationId = generateCorrelationId();
    console.log(`[PROJECT-WORK] Fetching board data for project ${projectId} with correlation ID: ${correlationId}`);

    try {
      updateKpiState('progress', { loading: true, error: null });

      const boardData = await getBoardData(projectId, { includeCompleted: true }, correlationId);

      const safeBoardData = Array.isArray(boardData) ? boardData : [];
      console.log(`[PROJECT-WORK] Successfully fetched ${safeBoardData.length} board items`);
      setBoard(safeBoardData);
      updateKpiState('progress', { loading: false, data: safeBoardData });
    } catch (err) {
      console.error("[PROJECT-WORK] Failed to fetch board data:", err);
      updateKpiState('progress', { loading: false, error: err.message || "Failed to load board data" });
    }
  }, [projectId]);

  // Fetch GitHub stats
  const fetchGitHubStats = useCallback(async () => {
    if (!projectId) return;

    const correlationId = generateCorrelationId();
    console.log(`[PROJECT-WORK] Fetching GitHub stats for project ${projectId} with correlation ID: ${correlationId}`);

    try {
      updateKpiState('openPRs', { loading: true, error: null });

      const statsData = await getProjectGitHubStats(projectId);
      
      const safeStatsData = statsData || {};
      console.log(`[PROJECT-WORK] Successfully fetched GitHub stats:`, safeStatsData);
      setGithubStats(safeStatsData);
      updateKpiState('openPRs', { loading: false, data: safeStatsData });
    } catch (err) {
      console.error("[PROJECT-WORK] Failed to fetch GitHub stats:", err);
      updateKpiState('openPRs', { loading: false, error: err.message || "Failed to load GitHub stats" });
    }
  }, [projectId]);

  // Fetch all data
  const fetchAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      // Fetch all data in parallel
      await Promise.all([
        fetchProject(),
        fetchMyTasks(),
        fetchBoard(),
        fetchGitHubStats()
      ]);
    } catch (err) {
      console.error("[PROJECT-WORK] Failed to fetch data:", err);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, [fetchProject, fetchMyTasks, fetchBoard, fetchGitHubStats]);

  // Load data on mount
  useEffect(() => {
    if (projectId && userInfo?.userId) {
      console.log('[ProjectWork] Fetching data for project:', projectId);
      fetchAllData();
    } else {
      console.log('[ProjectWork] Not fetching data - missing projectId or userInfo:', { projectId, userInfo });
    }
  }, [projectId, userInfo?.userId, fetchAllData]);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="work-area-content">
        <div className="project-work-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="work-area-content">
        <div className="project-work-page">
          <div className="error-container">
            <h2>Authentication Required</h2>
            <p>Please sign in to view this project.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no projectId
  if (!projectId) {
    return (
      <div className="work-area-content">
        <div className="project-work-page">
          <div className="error-container">
            <h2>Project Not Found</h2>
            <p>No project ID provided.</p>
          </div>
        </div>
      </div>
    );
  }

  // Refresh handler
  const handleRefresh = () => {
    fetchAllData(true);
  };

  // KPI Calculations
  const calculateProgress = () => {
    if (kpiStates.progress.loading || kpiStates.progress.error) {
      return null;
    }

    const boardData = kpiStates.progress.data || board || [];
    
    // Filter board items to this project if projectId is available
    const projectTasks = boardData.filter(task => 
      !task.projectId || task.projectId === projectId
    );
    
    if (projectTasks.length === 0) {
      // Fallback to my tasks if board doesn't include projectId
      const myTasksArray = myTasks || [];
      const myProjectTasks = myTasksArray.filter(task => 
        (!task.projectId || task.projectId === projectId) && 
        task.status !== 'Done'
      );
      const completedMyTasks = myTasksArray.filter(task => 
        (!task.projectId || task.projectId === projectId) && 
        task.status === 'Done'
      );
      const totalMyTasks = myProjectTasks.length + completedMyTasks.length;
      return totalMyTasks > 0 ? Math.round((completedMyTasks.length / totalMyTasks) * 100) : 0;
    }

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.status === 'Done').length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const calculateDaysLeft = () => {
    if (kpiStates.daysLeft.loading || kpiStates.daysLeft.error) {
      return null;
    }

    const projectData = kpiStates.daysLeft.data || project;
    
    if (!projectData?.createdAtUtc || !projectData?.duration) {
      return null;
    }

    const startDate = new Date(projectData.createdAtUtc);
    const durationInDays = typeof projectData.duration === 'string' ? parseInt(projectData.duration.split('.')[0]) || 0 : 0;
    const endDate = new Date(startDate.getTime() + (durationInDays * 24 * 60 * 60 * 1000));
    const today = new Date();
    const daysLeft = Math.ceil((endDate - today) / (24 * 60 * 60 * 1000));
    
    return daysLeft; // Can be negative (overdue)
  };

  const calculateMyOpenTasks = () => {
    if (kpiStates.myOpenTasks.loading || kpiStates.myOpenTasks.error) {
      return null;
    }

    const tasksData = kpiStates.myOpenTasks.data || myTasks || [];
    const myProjectTasks = tasksData.filter(task => 
      (!task.projectId || task.projectId === projectId) && 
      task.status !== 'Done'
    );
    return myProjectTasks.length;
  };

  const calculateOpenPRs = () => {
    if (kpiStates.openPRs.loading || kpiStates.openPRs.error) {
      return null;
    }

    const statsData = kpiStates.openPRs.data || githubStats;
    return getOpenPRsCount(statsData);
  };

  // KPI Data
  const kpis = [
    {
      id: 'progress',
      label: 'Progress',
      value: calculateProgress(),
      suffix: '%',
      icon: BarChart3,
      state: kpiStates.progress,
      emptyMessage: 'No tasks yet'
    },
    {
      id: 'daysLeft',
      label: 'Days Left',
      value: calculateDaysLeft(),
      suffix: '',
      icon: Calendar,
      state: kpiStates.daysLeft,
      emptyMessage: 'No target date',
      isOverdue: calculateDaysLeft() !== null && calculateDaysLeft() < 0
    },
    {
      id: 'myTasks',
      label: 'My Open Tasks',
      value: calculateMyOpenTasks(),
      suffix: '',
      icon: CheckCircle,
      state: kpiStates.myOpenTasks,
      emptyMessage: '0'
    },
    {
      id: 'myPRs',
      label: 'Open PRs',
      value: calculateOpenPRs(),
      suffix: '',
      icon: GitPullRequest,
      state: kpiStates.openPRs,
      emptyMessage: '0'
    }
  ];

  const isLoading = Object.values(kpiStates).some(state => state.loading);

  // Tab configuration
  const tabs = [
    {
      id: "My Tasks",
      label: "My Tasks",
      icon: ClipboardCheck,
    },
    {
      id: "Forum",
      label: "Forum",
      icon: MessageSquare,
    },
    {
      id: "Code",
      label: "Code",
      icon: Code,
    },
    {
      id: "Milestones",
      label: "Milestones",
      icon: CheckCircle,
    },
  ];

  // Tab handlers
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleKeyDown = (event, tabId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveTab(tabId);
    }
  };

  // Get content placeholder
  const getContentPlaceholder = () => {
    switch (activeTab) {
      case "My Tasks":
        return "My Tasks (placeholder)";
      case "Forum":
        return "Forum (placeholder)";
      case "Code":
        return "Code (placeholder)";
      case "Milestones":
        return "Milestones (placeholder)";
      default:
        return "Content (placeholder)";
    }
  };

  // Debug render
  console.log('[ProjectWork] Rendering with state:', {
    projectId,
    userInfo,
    isAuthenticated,
    authLoading,
    project,
    error,
    kpiStates
  });

  return (
    <>
      <div className="work-area-content">
        <WorkAreaLayout activeView={activeView} setActiveView={setActiveView}>
          <div className="project-work-page">
            {/* Header */}
            <div className="project-header">
              <div className="header-content">
                <h1 className="project-title">
                  {kpiStates.daysLeft.loading ? (
                    <div className="title-skeleton"></div>
                  ) : (
                    (project && project.projectName) || `Project ${projectId || 'Unknown'}`
                  )}
                </h1>
              </div>
            </div>

            {/* KPI Bar */}
            <div className="kpi-section">
              <div className="kpi-header">
                <h2 className="kpi-title">Project Overview</h2>
                <button 
                  className="refresh-button"
                  onClick={handleRefresh}
                  disabled={refreshing || isLoading}
                  title="Refresh data"
                >
                  <RefreshCw size={16} className={refreshing ? "spinning" : ""} />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              <div className="kpi-grid">
                {kpis.map((kpi) => {
                  const Icon = kpi.icon;
                  const { loading, error, data } = kpi.state;
                  
                  return (
                    <div key={kpi.id} className="kpi-card">
                      <div className="kpi-content">
                        <div className="kpi-label">{kpi.label}</div>
                        <div className="kpi-value">
                          {loading ? (
                            <div className="kpi-skeleton"></div>
                          ) : error ? (
                            <div className="kpi-error" title={error}>
                              <AlertCircle size={16} />
                            </div>
                          ) : kpi.value === null ? (
                            <span className="kpi-empty">—</span>
                          ) : (
                            <span className={`kpi-number ${kpi.isOverdue ? 'kpi-overdue' : ''}`}>
                              {kpi.isOverdue ? `Overdue by ${Math.abs(kpi.value)}d` : `${kpi.value}${kpi.suffix}`}
                            </span>
                          )}
                        </div>
                        <div className="kpi-icon">
                          <Icon size={20} />
                        </div>
                      </div>
                      {kpi.value === null && !loading && !error && (
                        <div className="kpi-empty-caption">{kpi.emptyMessage}</div>
                      )}
                      {error && (
                        <div className="kpi-error-caption">
                          <button 
                            className="kpi-retry-button"
                            onClick={() => {
                              if (kpi.id === 'progress') fetchBoard();
                              else if (kpi.id === 'daysLeft') fetchProject();
                              else if (kpi.id === 'myTasks') fetchMyTasks();
                              else if (kpi.id === 'myPRs') fetchGitHubStats();
                            }}
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tabs Row */}
            <div className="tabs-container">
              <div
                className="tabs-row"
                role="tablist"
                aria-label="Project sections"
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      className={`tab-button ${isActive ? "active" : ""}`}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`tabpanel-${tab.id}`}
                      onClick={() => handleTabClick(tab.id)}
                      onKeyDown={(e) => handleKeyDown(e, tab.id)}
                      tabIndex={isActive ? 0 : -1}
                    >
                      <Icon size={16} className="tab-icon" />
                      <span className="tab-label">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Region */}
            <div className="content-region">
              {activeTab === "My Tasks" ? (
                <MyTasks />
              ) : activeTab === "Forum" ? (
                <Forum />
              ) : activeTab === "Code" ? (
                <CodeTab projectId={projectId} />
              ) : activeTab === "Milestones" ? (
                <MilestonesTab projectId={projectId} />
              ) : (
                <div className="content-placeholder">
                  <h2 className="placeholder-title">{getContentPlaceholder()}</h2>
                  <p className="placeholder-description">
                    This area will display the {activeTab.toLowerCase()} content when implemented.
                  </p>
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="error-banner">
                <p>{error}</p>
                <button 
                  className="retry-button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? "Retrying..." : "Try Again"}
                </button>
              </div>
            )}
          </div>
        </WorkAreaLayout>
      </div>
      
      {/* Footer at bottom of full page layout - outside sidebar layout */}
      <Footer />
    </>
  );
};

export default ProjectWork;
