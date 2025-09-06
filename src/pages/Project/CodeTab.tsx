import React, { useState, useEffect, useCallback } from 'react';
import { 
  getProjectRepository, 
  getSyncStatus, 
  getProjectContributions, 
  syncRepository,
  Repository,
  SyncStatus,
  Contribution
} from '../../services/github.api';
import RepoHeaderCard from '../../components/code/RepoHeaderCard';
import RepoStatusPanel from '../../components/code/RepoStatusPanel';
import LinkRepoForm from '../../components/code/LinkRepoForm';
import ContributorsList from '../../components/code/ContributorsList';
import SyncBanner from '../../components/code/SyncBanner';
import ErrorBanner from '../../components/code/ErrorBanner';
import { SkeletonRepoHeader, SkeletonContributors } from '../../components/code/Skeleton';

interface CodeTabProps {
  projectId: string;
}

const CodeTab: React.FC<CodeTabProps> = ({ projectId }) => {
  const [repository, setRepository] = useState<Repository | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    status: 'idle'
  });
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correlationId, setCorrelationId] = useState<string | null>(null);

  // Fetch repository data
  const fetchRepository = useCallback(async () => {
    try {
      const repo = await getProjectRepository(projectId);
      setRepository(repo);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch repository:', err);
      setError(err instanceof Error ? err.message : 'Failed to load repository');
      setRepository(null);
    }
  }, [projectId]);

  // Fetch sync status
  const fetchSyncStatus = useCallback(async () => {
    try {
      const status = await getSyncStatus(projectId);
      setSyncStatus(status);
    } catch (err) {
      console.error('Failed to fetch sync status:', err);
      // Don't set error for sync status, just keep current state
    }
  }, [projectId]);

  // Fetch contributions
  const fetchContributions = useCallback(async () => {
    try {
      const contribs = await getProjectContributions(projectId);
      setContributions(contribs);
    } catch (err) {
      console.error('Failed to fetch contributions:', err);
      // Don't set error for contributions, just keep empty array
    }
  }, [projectId]);

  // Handle sync action
  const handleSync = useCallback(async () => {
    try {
      await syncRepository(projectId);
      setSyncStatus(prev => ({ ...prev, isRunning: true, status: 'running' }));
      
      // Start polling for sync status
      const pollInterval = setInterval(async () => {
        try {
          const status = await getSyncStatus(projectId);
          setSyncStatus(status);
          
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(pollInterval);
            if (status.status === 'completed') {
              // Refresh repository and contributions after successful sync
              await Promise.all([fetchRepository(), fetchContributions()]);
            }
          }
        } catch (err) {
          console.error('Failed to poll sync status:', err);
          clearInterval(pollInterval);
        }
      }, 2000); // Poll every 2 seconds
      
    } catch (err) {
      console.error('Failed to sync repository:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync repository');
    }
  }, [projectId, fetchRepository, fetchContributions]);

  // Handle successful repository linking
  const handleRepoLinked = useCallback(async () => {
    await Promise.all([fetchRepository(), fetchContributions(), fetchSyncStatus()]);
  }, [fetchRepository, fetchContributions, fetchSyncStatus]);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchRepository(),
          fetchSyncStatus(),
          fetchContributions()
        ]);
      } catch (err) {
        // Error handling is done in individual fetch functions
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadData();
    }
  }, [projectId, fetchRepository, fetchSyncStatus, fetchContributions]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    fetchRepository();
  }, [fetchRepository]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonRepoHeader />
        <SkeletonContributors />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorBanner
          message={error}
          correlationId={correlationId || undefined}
          onRetry={handleRetry}
        />
        <SkeletonContributors />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Banner */}
      <SyncBanner syncStatus={syncStatus} />
      
      {/* Repository Header or Link Form */}
      {repository ? (
        <RepoHeaderCard
          repository={repository}
          onSync={handleSync}
          isSyncing={syncStatus.isRunning}
        />
      ) : (
        <LinkRepoForm
          projectId={projectId}
          onSuccess={handleRepoLinked}
        />
      )}
      
      {/* Repository Status Panel */}
      {repository && (
        <RepoStatusPanel
          syncStatus={syncStatus}
          isPublic={repository.isPublic}
          primaryLanguage={repository.primaryLanguage}
        />
      )}
      
      {/* Contributors List */}
      <ContributorsList
        contributions={contributions}
        loading={loading}
      />
    </div>
  );
};

export default CodeTab;
