import React, { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import './AIInsight.css';

const AIInsight = () => {
  const { userInfo, loading: authLoading, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      try {
        setLoading(true);
        console.debug('[AIInsight] Starting data fetch', { userId: userInfo.userId });
        const [summaryRes, dashboardRes] = await Promise.all([
          api.get('/me/summary').then(r => {
            console.debug('[AIInsight] /me/summary response', { status: r.status, ok: r.status >= 200 && r.status < 300 });
            return r;
          }),
          api.get('/me/dashboard').then(r => {
            console.debug('[AIInsight] /me/dashboard response', { status: r.status, ok: r.status >= 200 && r.status < 300 });
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
  }, [userInfo?.userId, authLoading, isAuthenticated]);

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
            <Brain className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="header-text">
            <h1 className="page-title">Smart Summary</h1>
            <p className="page-subtitle">
              Your personalized AI-powered project insights and performance analytics
            </p>
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      {summary?.overallSummary && (
        <div className="summary-section">
          <div className="summary-card">
            <h2 className="section-title">Overall Summary</h2>
            <p className="summary-text">{summary.overallSummary}</p>
          </div>
        </div>
      )}

      {/* KPIs */}
      {dashboard?.kpis && (
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
      {dashboard?.skillDistribution && (
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
      {dashboard?.activityMetrics && (
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
      {dashboard?.technologies && (
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
              {dashboard.technologies.languages?.length > 0 && (
                <div className="tech-list">
                  <h4>Languages</h4>
                  <div className="tech-tags">
                    {dashboard.technologies.languages.map((lang, index) => (
                      <span key={index} className="tech-tag">{lang}</span>
                    ))}
                  </div>
                </div>
              )}
              {dashboard.technologies.technologies?.length > 0 && (
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

      {/* GitHub Data */}
      {dashboard?.githubData && (
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
