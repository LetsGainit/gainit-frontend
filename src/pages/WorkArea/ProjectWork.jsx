import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { RefreshCw, Calendar, CheckCircle, BarChart3, GitPullRequest, ClipboardCheck, MessageSquare, Code, BarChart } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getProjectById } from "../../services/projectsService";
import { getMyTasks, getBoardData } from "../../services/tasksService";
import { getUserActivity } from "../../services/githubService";
import "./ProjectWork.css";

const ProjectWork = () => {
  const { projectId } = useParams();
  const { userInfo } = useAuth();
  
  // State management
  const [project, setProject] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [board, setBoard] = useState([]);
  const [myOpenPRsCount, setMyOpenPRsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("My Tasks");
  
  // Loading states
  const [loading, setLoading] = useState({
    project: false,
    tasks: false,
    board: false,
    prs: false
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

  // Temporary mock data for testing
  const tempMockData = {
    project: {
      projectId: "temp-1",
      projectName: "Eco-Friendly Mobile App",
      projectDescription: "A mobile application that helps users track their carbon footprint and provides eco-friendly lifestyle recommendations.",
      projectPictureUrl: "/default-featured-image.png",
      duration: "90.00:00:00",
      createdAtUtc: "2024-01-01T00:00:00Z",
      status: "InProgress",
      technologies: ["React Native", "Node.js", "MongoDB", "AWS", "Firebase"],
      projectTeamMembers: [
        { userId: "1", fullName: "John Doe", roleInProject: "Frontend Developer" },
        { userId: "2", fullName: "Jane Smith", roleInProject: "Backend Developer" },
        { userId: "3", fullName: "Mike Johnson", roleInProject: "UI/UX Designer" }
      ],
      repositoryLink: "https://github.com/example/eco-app"
    },
    tasks: [
      { taskId: "1", projectId: "temp-1", status: "InProgress", title: "Setup project structure" },
      { taskId: "2", projectId: "temp-1", status: "Done", title: "Create wireframes" },
      { taskId: "3", projectId: "temp-1", status: "InProgress", title: "Implement user authentication" },
      { taskId: "4", projectId: "temp-1", status: "Done", title: "Design database schema" }
    ],
    board: [
      { taskId: "1", projectId: "temp-1", status: "InProgress", title: "Setup project structure" },
      { taskId: "2", projectId: "temp-1", status: "Done", title: "Create wireframes" },
      { taskId: "3", projectId: "temp-1", status: "InProgress", title: "Implement user authentication" },
      { taskId: "4", projectId: "temp-1", status: "Done", title: "Design database schema" },
      { taskId: "5", projectId: "temp-1", status: "InProgress", title: "Build API endpoints" },
      { taskId: "6", projectId: "temp-1", status: "Done", title: "Setup CI/CD pipeline" }
    ],
    githubActivity: [
      { type: "pull_request", state: "open", title: "Add user authentication feature" },
      { type: "pull_request", state: "closed", title: "Fix database connection issue" }
    ]
  };

  // Fetch project details
  const fetchProject = useCallback(async () => {
    if (!projectId) return;

    const correlationId = generateCorrelationId();
    console.log(`[PROJECT-WORK] Fetching project ${projectId} with correlation ID: ${correlationId}`);

    try {
      setLoading(prev => ({ ...prev, project: true }));
      setError(null);

      // TEMPORARY: Use mock data for testing
      // TODO: Remove this and uncomment the real API call below
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      const projectData = projectId === "temp-1" ? tempMockData.project : null;
      
      // Real API call (commented out for testing)
      // const projectData = await getProjectById(projectId, correlationId);

      if (projectData) {
        console.log(`[PROJECT-WORK] Successfully fetched project: ${projectData.projectName}`);
        setProject(projectData);
      } else {
        setError("Project not found");
      }
    } catch (err) {
      console.error("[PROJECT-WORK] Failed to fetch project:", err);
      setError("Failed to load project details");
    } finally {
      setLoading(prev => ({ ...prev, project: false }));
    }
  }, [projectId]);

  // Fetch my tasks
  const fetchMyTasks = useCallback(async () => {
    if (!userInfo?.userId) return;

    const correlationId = generateCorrelationId();
    console.log(`[PROJECT-WORK] Fetching my tasks with correlation ID: ${correlationId}`);

    try {
      setLoading(prev => ({ ...prev, tasks: true }));

      // TEMPORARY: Use mock data for testing
      // TODO: Remove this and uncomment the real API call below
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
      const tasksData = projectId === "temp-1" ? tempMockData.tasks : [];
      
      // Real API call (commented out for testing)
      // const tasksData = await getMyTasks(correlationId);

      console.log(`[PROJECT-WORK] Successfully fetched ${tasksData.length} tasks`);
      setMyTasks(tasksData || []);
    } catch (err) {
      console.error("[PROJECT-WORK] Failed to fetch my tasks:", err);
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  }, [userInfo?.userId, projectId]);

  // Fetch board data
  const fetchBoard = useCallback(async () => {
    if (!projectId) return;

    const correlationId = generateCorrelationId();
    console.log(`[PROJECT-WORK] Fetching board data with correlation ID: ${correlationId}`);

    try {
      setLoading(prev => ({ ...prev, board: true }));

      // TEMPORARY: Use mock data for testing
      // TODO: Remove this and uncomment the real API call below
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay
      const boardData = projectId === "temp-1" ? tempMockData.board : [];
      
      // Real API call (commented out for testing)
      // const boardData = await getBoardData(correlationId);

      console.log(`[PROJECT-WORK] Successfully fetched ${boardData.length} board items`);
      setBoard(boardData || []);
    } catch (err) {
      console.error("[PROJECT-WORK] Failed to fetch board data:", err);
    } finally {
      setLoading(prev => ({ ...prev, board: false }));
    }
  }, [projectId]);

  // Fetch GitHub activity
  const fetchGitHubActivity = useCallback(async () => {
    if (!projectId || !userInfo?.userId) return;

    const correlationId = generateCorrelationId();
    console.log(`[PROJECT-WORK] Fetching GitHub activity for project ${projectId} with correlation ID: ${correlationId}`);

    try {
      setLoading(prev => ({ ...prev, prs: true }));

      // TEMPORARY: Use mock data for testing
      // TODO: Remove this and uncomment the real API call below
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
      const activityData = projectId === "temp-1" ? tempMockData.githubActivity : [];
      
      // Real API call (commented out for testing)
      // const activityData = await getUserActivity(projectId, userInfo.userId, correlationId);

      // Count open PRs from the activity data
      const openPRs = activityData?.filter(item => 
        item.type === 'pull_request' && item.state === 'open'
      ) || [];
      
      console.log(`[PROJECT-WORK] Found ${openPRs.length} open PRs`);
      setMyOpenPRsCount(openPRs.length);
    } catch (err) {
      console.error("[PROJECT-WORK] Failed to fetch GitHub activity:", err);
      setMyOpenPRsCount(0);
    } finally {
      setLoading(prev => ({ ...prev, prs: false }));
    }
  }, [projectId, userInfo?.userId]);

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
        fetchGitHubActivity()
      ]);
    } catch (err) {
      console.error("[PROJECT-WORK] Failed to fetch data:", err);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, [fetchProject, fetchMyTasks, fetchBoard, fetchGitHubActivity]);

  // Load data on mount
  useEffect(() => {
    if (projectId && userInfo?.userId) {
      fetchAllData();
    }
  }, [projectId, userInfo?.userId, fetchAllData]);

  // Refresh handler
  const handleRefresh = () => {
    fetchAllData(true);
  };

  // KPI Calculations
  const calculateProgress = () => {
    // Filter board items to this project
    // TODO: Backend should include projectId in board items response for proper filtering
    const projectTasks = board.filter(task => task.projectId === projectId);
    
    if (projectTasks.length === 0) {
      // Fallback to my tasks if board doesn't include projectId
      // TODO: This undercounts (only my tasks) until backend exposes project-scoped board filter
      const myProjectTasks = myTasks.filter(task => task.projectId === projectId);
      const completedMyTasks = myProjectTasks.filter(task => task.status === 'Done');
      return myProjectTasks.length > 0 ? Math.round((completedMyTasks.length / myProjectTasks.length) * 100) : 0;
    }

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.status === 'Done').length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const calculateDaysLeft = () => {
    if (!project?.createdAtUtc || !project?.duration) {
      // TODO: Add milestone-based deadline calculation when available
      return null;
    }

    const startDate = new Date(project.createdAtUtc);
    const durationInDays = parseInt(project.duration.split('.')[0]) || 0;
    const endDate = new Date(startDate.getTime() + (durationInDays * 24 * 60 * 60 * 1000));
    const today = new Date();
    const daysLeft = Math.ceil((endDate - today) / (24 * 60 * 60 * 1000));
    
    return Math.max(0, daysLeft);
  };

  const calculateMyOpenTasks = () => {
    const myProjectTasks = myTasks.filter(task => 
      task.projectId === projectId && task.status !== 'Done'
    );
    return myProjectTasks.length;
  };

  // KPI Data
  const kpis = [
    {
      id: 'progress',
      label: 'Progress',
      value: calculateProgress(),
      suffix: '%',
      icon: BarChart3,
      loading: loading.board || loading.tasks
    },
    {
      id: 'daysLeft',
      label: 'Days Left',
      value: calculateDaysLeft(),
      suffix: '',
      icon: Calendar,
      loading: loading.project
    },
    {
      id: 'myTasks',
      label: 'My Open Tasks',
      value: calculateMyOpenTasks(),
      suffix: '',
      icon: CheckCircle,
      loading: loading.tasks
    },
    {
      id: 'myPRs',
      label: 'Open PRs',
      value: myOpenPRsCount,
      suffix: '',
      icon: GitPullRequest,
      loading: loading.prs
    }
  ];

  const isLoading = Object.values(loading).some(Boolean);

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
      id: "Analytics",
      label: "Analytics",
      icon: BarChart,
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
      case "Analytics":
        return "Analytics (placeholder)";
      default:
        return "Content (placeholder)";
    }
  };

  return (
    <div className="project-work-page">
      {/* Header */}
      <div className="project-header">
        <div className="header-content">
          <h1 className="project-title">
            {loading.project ? (
              <div className="title-skeleton"></div>
            ) : (
              project?.projectName || "Loading..."
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
            return (
              <div key={kpi.id} className="kpi-card">
                <div className="kpi-content">
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-value">
                    {kpi.loading ? (
                      <div className="kpi-skeleton"></div>
                    ) : kpi.value === null ? (
                      <span className="kpi-empty">—</span>
                    ) : (
                      <span className="kpi-number">
                        {kpi.value}{kpi.suffix}
                      </span>
                    )}
                  </div>
                  <div className="kpi-icon">
                    <Icon size={20} />
                  </div>
                </div>
                {kpi.value === null && !kpi.loading && (
                  <div className="kpi-empty-caption">no data</div>
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
        <div className="content-placeholder">
          <h2 className="placeholder-title">{getContentPlaceholder()}</h2>
          <p className="placeholder-description">
            This area will display the {activeTab.toLowerCase()} content when implemented.
          </p>
        </div>
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
  );
};

export default ProjectWork;
