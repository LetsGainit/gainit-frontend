import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  FolderOpen, 
  Flame, 
  Code, 
  Database, 
  Server, 
  GitBranch,
  Github,
  GitPullRequest,
  GitCommit,
  Eye,
  Trophy,
  Activity,
  Loader2,
  Users
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { getUserProjects } from '../../services/projectsService';
import './AIInsight.css';

const AIInsight = () => {
  const { userInfo, loading: authLoading, isAuthenticated } = useAuth();
  const { projectId: projectIdFromRoute, id: idFromRoute } = useParams();
  const projectId = projectIdFromRoute || idFromRoute;
  const [summary, setSummary] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) {
        console.debug('[AIInsight] Waiting for auth to finish...');
        return;
      }

      if (!isAuthenticated) {
        console.warn('[AIInsight] Not authenticated.');
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      if (!userInfo?.userId) {
        console.debug('[AIInsight] Auth finished but userId not ready yet.');
        return;
      }

      if (!synced) {
        console.debug('[AIInsight] Skipping data fetch until sync completes');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.debug('[AIInsight] Starting data fetch', { userId: userInfo.userId });
        const [summaryRes, dashboardRes] = await Promise.all([
          api.get('/users/me/summary', { timeout: 60000 }).then(r => {
            console.debug('[AIInsight] /me/summary response', { status: r.status, ok: r.status >= 200 && r.status < 300 });
            return r;
          }),
          api.get(`/users/${userInfo.userId}/dashboard?forceRefresh=true`, { timeout: 60000 }).then(r => {
            console.debug('[AIInsight] /users/{userId}/dashboard response', { status: r.status, ok: r.status >= 200 && r.status < 300 });
            return r;
          })
        ]);
        
        console.debug('[AIInsight] Parsed responses', {
          summaryKeys: summaryRes?.data ? Object.keys(summaryRes.data) : null,
          dashboardKeys: dashboardRes?.data ? Object.keys(dashboardRes.data) : null
        });

        setSummary(summaryRes.data);
        setDashboard(dashboardRes.data);
      } catch (err) {
        setError('Failed to load insights data');
        console.error('[AIInsight] Error fetching data', {
          message: err?.message,
          status: err?.response?.status,
          responseData: err?.response?.data
        });
      } finally {
        setLoading(false);
        console.debug('[AIInsight] Finished data fetch');
      }
    };

    fetchData();
  }, [userInfo?.userId, authLoading, isAuthenticated, synced]);

  const handleSync = async () => {
    setSyncError(null);
    setSyncing(true);
    try {
      // Resolve project id: route param or fetch first user project
      let effectiveProjectId = projectId;
      if (!effectiveProjectId) {
        const correlationId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        console.debug('[AIInsight] Fetching user projects to resolve projectId');
        const projects = await getUserProjects(correlationId);
        if (Array.isArray(projects) && projects.length > 0) {
          effectiveProjectId = projects[0].id || projects[0].projectId;
        } else {
          throw new Error('No projects found for user');
        }
      }

      console.debug('[AIInsight] Sync start', { projectId: effectiveProjectId });
      await api.post(`/github/projects/${effectiveProjectId}/sync`, {}, {
        timeout: 300000 // 5 minute timeout for sync operations
      });
      console.debug('[AIInsight] Sync completed');
      setSynced(true);
    } catch (e) {
      console.error('[AIInsight] Sync failed', {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data
      });
      setSyncError(e?.message || 'Failed to sync project. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const getIcon = (iconName) => {
    const iconMap = {
      'check-circle': CheckCircle,
      'clock': Clock,
      'folder': FolderOpen,
      'flame': Flame,
      'code': Code,
      'database': Database,
      'server': Server,
      'activity': Activity,
      'trophy': Trophy
    };
    return iconMap[iconName] || Activity;
  };

  // Convert markdown-style bold text (*text*) to HTML bold tags and handle line breaks
  const formatBoldText = (text) => {
    if (!text) return '';
    // First convert line breaks to <br> tags
    let formattedText = text.replace(/\n/g, '<br>');
    // Then convert *text* to <strong>text</strong>
    formattedText = formattedText.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    return formattedText;
  };

  // Render formatted text with bold styling
  const renderFormattedText = (text) => {
    const formattedText = formatBoldText(text);
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  if (loading) {
    return (
      <div className="ai-insight-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn('[AIInsight] Rendering error state:', error);
    return (
      <div className="ai-insight-page">
        <div className="error-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insight-page">
      {/* Header */}
      <div className="ai-insight-header">
        <div className="header-content">
          <div className="header-icon">
            <Brain />
          </div>
          <div className="header-text">
            <h1 className="page-title">Smart Summary</h1>
            <p className="page-subtitle">
              Your personalized AI-powered project insights and performance analytics
            </p>
          </div>
        </div>
      </div>

      {!synced && (
        <div className="summary-section">
          <div className="summary-card">
            <h2 className="section-title">Prepare Your Insights</h2>
            <p className="summary-text">Click the button to sync your latest project data and generate insights.</p>
            <div style={{ marginTop: '12px' }}>
              <button
                className="github-connect-btn"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Syncing…
                  </>
                ) : (
                  'Show me summary'
                )}
              </button>
            </div>
            {syncError && (
              <div className="error-container" style={{ marginTop: '12px' }}>
                <p>{syncError}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Summary */}
      {synced && summary?.overallSummary && (
        <div className="summary-section">
          <div className="summary-card">
            <h2 className="section-title">Overall Summary</h2>
            <div className="summary-text">
              {renderFormattedText(summary.overallSummary)}
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      {synced && dashboard?.kpis && (
        <div className="kpis-section">
          <h2 className="section-title">Key Performance Indicators</h2>
          <div className="kpis-grid">
            {Object.entries(dashboard.kpis).map(([key, kpi]) => {
              const IconComponent = getIcon(kpi.icon);
              return (
                <div key={key} className="kpi-card">
                  <div className="kpi-icon">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">{kpi.value}</div>
                    <div className="kpi-subtitle">{kpi.subtitle}</div>
                    {kpi.trend && <div className="kpi-trend">{kpi.trend}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skill Distribution */}
      {synced && dashboard?.skillDistribution && (
        <div className="skills-section">
          <h2 className="section-title">Skill Distribution</h2>
          <div className="skills-card">
            <div className="skills-chart">
              {Object.entries(dashboard.skillDistribution).map(([skill, data]) => (
                <div key={skill} className="skill-bar">
                  <div className="skill-label">{skill}</div>
                  <div className="skill-bar-container">
                    <div 
                      className="skill-bar-fill" 
                      style={{ width: `${data.percentage}%` }}
                    ></div>
                  </div>
                  <div className="skill-percentage">{data.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Metrics */}
      {synced && dashboard?.activityMetrics && (
        <div className="metrics-section">
          <h2 className="section-title">Activity Metrics</h2>
          <div className="metrics-card">
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">Total Tasks</div>
                <div className="metric-value">{dashboard.activityMetrics.totalTasks}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Completed Tasks</div>
                <div className="metric-value">{dashboard.activityMetrics.completedTasks}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Completion Rate</div>
                <div className="metric-value">{dashboard.activityMetrics.completionRate}%</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Total Projects</div>
                <div className="metric-value">{dashboard.activityMetrics.totalProjects}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Owned Projects</div>
                <div className="metric-value">{dashboard.activityMetrics.ownedProjects}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Active Projects</div>
                <div className="metric-value">{dashboard.activityMetrics.activeProjects}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Completed Projects</div>
                <div className="metric-value">{dashboard.activityMetrics.completedProjects}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Total Achievements</div>
                <div className="metric-value">{dashboard.activityMetrics.totalAchievements}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technologies */}
      {synced && dashboard?.technologies && (
        <div className="technologies-section">
          <h2 className="section-title">Technologies</h2>
          <div className="technologies-card">
            <div className="tech-stats">
              <div className="tech-stat">
                <div className="tech-stat-value">{dashboard.technologies.totalLanguages}</div>
                <div className="tech-stat-label">Languages</div>
              </div>
              <div className="tech-stat">
                <div className="tech-stat-value">{dashboard.technologies.totalTechnologies}</div>
                <div className="tech-stat-label">Technologies</div>
              </div>
            </div>
            <div className="tech-lists">
              {Array.isArray(dashboard.technologies.languages) && dashboard.technologies.languages.length > 0 && (
                <div className="tech-list">
                  <h4>Languages</h4>
                  <div className="tech-tags">
                    {dashboard.technologies.languages.map((lang, index) => (
                      <span key={index} className="tech-tag">{lang}</span>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(dashboard.technologies.technologies) && dashboard.technologies.technologies.length > 0 && (
                <div className="tech-list">
                  <h4>Technologies</h4>
                  <div className="tech-tags">
                    {dashboard.technologies.technologies.map((tech, index) => (
                      <span key={index} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Analytics */}
      {synced && dashboard?.collaborationIndex && (
        <div className="analytics-section">
          <h2 className="section-title">Collaboration Analytics</h2>
          <div className="analytics-card">
            <div className="analytics-grid">
              <div className="analytics-item">
                <div className="analytics-icon">
                  <GitPullRequest className="w-6 h-6" />
                </div>
                <div className="analytics-content">
                  <div className="analytics-value">{dashboard.collaborationIndex.pullRequests}</div>
                  <div className="analytics-label">Pull Requests</div>
                </div>
              </div>
              <div className="analytics-item">
                <div className="analytics-icon">
                  <GitCommit className="w-6 h-6" />
                </div>
                <div className="analytics-content">
                  <div className="analytics-value">{dashboard.collaborationIndex.pushes}</div>
                  <div className="analytics-label">Pushes</div>
                </div>
              </div>
              <div className="analytics-item">
                <div className="analytics-icon">
                  <Users className="w-6 h-6" />
                </div>
                <div className="analytics-content">
                  <div className="analytics-value">{dashboard.collaborationIndex.collaborationRatioPercentage}%</div>
                  <div className="analytics-label">Collaboration Ratio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Tracker */}
      {synced && dashboard?.completionTracker && (
        <div className="analytics-section">
          <h2 className="section-title">Task Completion</h2>
          <div className="analytics-card">
            <div className="completion-tracker">
              <div className="completion-stats">
                <div className="completion-stat">
                  <div className="completion-value">{dashboard.completionTracker.tasksStarted}</div>
                  <div className="completion-label">Tasks Started</div>
                </div>
                <div className="completion-stat">
                  <div className="completion-value">{dashboard.completionTracker.tasksCompleted}</div>
                  <div className="completion-label">Tasks Completed</div>
                </div>
                <div className="completion-stat">
                  <div className="completion-value">{dashboard.completionTracker.completionRatePercentage}%</div>
                  <div className="completion-label">Completion Rate</div>
                </div>
              </div>
              <div className="completion-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${dashboard.completionTracker.completionRatePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refactoring Rate */}
      {synced && dashboard?.refactoringRate && (
        <div className="analytics-section">
          <h2 className="section-title">Code Quality</h2>
          <div className="analytics-card">
            <div className="refactoring-stats">
              <div className="refactoring-item">
                <div className="refactoring-icon">
                  <Code className="w-6 h-6" />
                </div>
                <div className="refactoring-content">
                  <div className="refactoring-value">{dashboard.refactoringRate.linesAdded.toLocaleString()}</div>
                  <div className="refactoring-label">Lines Added</div>
                </div>
              </div>
              <div className="refactoring-item">
                <div className="refactoring-icon">
                  <Database className="w-6 h-6" />
                </div>
                <div className="refactoring-content">
                  <div className="refactoring-value">{dashboard.refactoringRate.linesDeleted.toLocaleString()}</div>
                  <div className="refactoring-label">Lines Deleted</div>
                </div>
              </div>
              <div className="refactoring-item">
                <div className="refactoring-icon">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="refactoring-content">
                  <div className="refactoring-value">{dashboard.refactoringRate.refactoringRatioPercentage}%</div>
                  <div className="refactoring-label">Refactoring Ratio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {synced && dashboard?.achievements && dashboard.achievements.length > 0 && (
        <div className="analytics-section">
          <h2 className="section-title">Achievements</h2>
          <div className="analytics-card">
            <div className="achievements-grid">
              {dashboard.achievements.map((achievement, index) => (
                <div key={index} className={`achievement-card ${achievement.earned ? 'earned' : 'pending'}`}>
                  <div className="achievement-icon">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="achievement-content">
                    <h3 className="achievement-title">{achievement.title}</h3>
                    <p className="achievement-description">{achievement.description}</p>
                    {!achievement.earned && (
                      <div className="achievement-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${achievement.progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{achievement.progressPercentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Community Collaboration */}
      {synced && dashboard?.communityCollaboration && (
        <div className="analytics-section">
          <h2 className="section-title">Community Engagement</h2>
          <div className="analytics-card">
            <div className="community-stats">
              <div className="community-item">
                <div className="community-value">{dashboard.communityCollaboration.posts}</div>
                <div className="community-label">Posts</div>
              </div>
              <div className="community-item">
                <div className="community-value">{dashboard.communityCollaboration.replies}</div>
                <div className="community-label">Replies</div>
              </div>
              <div className="community-item">
                <div className="community-value">{dashboard.communityCollaboration.likesReceived}</div>
                <div className="community-label">Likes Received</div>
              </div>
              <div className="community-item">
                <div className="community-value">{dashboard.communityCollaboration.uniquePeersInteracted}</div>
                <div className="community-label">Peers Interacted</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Data */}
      {synced && dashboard?.githubData && (
        <div className="github-section">
          <h2 className="section-title">GitHub Activity</h2>
          <div className="github-card">
            {dashboard.githubData.needsSetup ? (
              <div className="github-setup">
                <Github className="w-12 h-12 text-gray-400" />
                <h3>Connect your GitHub to unlock insights</h3>
                <p>Link your GitHub account to see detailed development activity and contributions.</p>
                <button className="github-connect-btn">Connect GitHub</button>
              </div>
            ) : (
              <div className="github-stats">
                <div className="github-header">
                  <Github className="w-6 h-6" />
                  <span>@{dashboard.githubData.username}</span>
                </div>
                <div className="github-metrics">
                  <div className="github-metric">
                    <GitBranch className="w-4 h-4" />
                    <span>{dashboard.githubData.linkedRepos} Repos</span>
                  </div>
                  <div className="github-metric">
                    <GitPullRequest className="w-4 h-4" />
                    <span>{dashboard.githubData.totalPullRequests} PRs</span>
                  </div>
                  <div className="github-metric">
                    <GitCommit className="w-4 h-4" />
                    <span>{dashboard.githubData.totalCommits} Commits</span>
                  </div>
                  <div className="github-metric">
                    <Eye className="w-4 h-4" />
                    <span>{dashboard.githubData.totalCodeReviews} Reviews</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsight;
