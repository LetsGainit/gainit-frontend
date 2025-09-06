import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import {
  getMilestones,
  createMilestone,
  updateMilestone,
  updateMilestoneStatus,
  deleteMilestone,
  Milestone,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  MilestoneStatus
} from '../../services/milestones.api';
import MilestoneCard from '../../components/milestones/MilestoneCard';
import MilestoneCreateModal from '../../components/milestones/MilestoneCreateModal';
import MilestoneEditModal from '../../components/milestones/MilestoneEditModal';
import SummaryBar from '../../components/milestones/SummaryBar';
import EmptyState from '../../components/milestones/EmptyState';
import ErrorBanner from '../../components/milestones/ErrorBanner';
import Skeleton, { SkeletonCard, SkeletonSummaryBar } from '../../components/milestones/Skeleton';

interface MilestonesTabProps {
  projectId: string;
}

const MilestonesTab: React.FC<MilestonesTabProps> = ({ projectId }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correlationId, setCorrelationId] = useState<string | null>(null);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch milestones
  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getMilestones(projectId);
      setMilestones(data);
    } catch (err) {
      console.error('Failed to fetch milestones:', err);
      setError(err instanceof Error ? err.message : 'Failed to load milestones');
      
      // Extract correlation ID from error if available
      if (err instanceof Error && err.message.includes('Correlation ID:')) {
        const match = err.message.match(/Correlation ID: ([a-f0-9-]+)/i);
        if (match) setCorrelationId(match[1]);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Initial fetch
  useEffect(() => {
    if (projectId) {
      fetchMilestones();
    }
  }, [projectId, fetchMilestones]);

  // Group milestones by status
  const groupedMilestones = {
    Planned: milestones
      .filter(m => m.status === 'Planned')
      .sort((a, b) => a.orderIndex - b.orderIndex || new Date(a.targetDateUtc).getTime() - new Date(b.targetDateUtc).getTime()),
    Active: milestones
      .filter(m => m.status === 'Active')
      .sort((a, b) => a.orderIndex - b.orderIndex || new Date(a.targetDateUtc).getTime() - new Date(b.targetDateUtc).getTime()),
    Completed: milestones
      .filter(m => m.status === 'Completed')
      .sort((a, b) => a.orderIndex - b.orderIndex || new Date(a.targetDateUtc).getTime() - new Date(b.targetDateUtc).getTime())
  };

  // Handle create milestone
  const handleCreateMilestone = async (dto: CreateMilestoneDto) => {
    try {
      setActionLoading(true);
      await createMilestone(dto);
      setCreateModalOpen(false);
      await fetchMilestones(); // Refetch to get updated data
    } catch (err) {
      console.error('Failed to create milestone:', err);
      // Error handling is done in the modal
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit milestone
  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setEditModalOpen(true);
  };

  const handleUpdateMilestone = async (milestoneId: string, dto: UpdateMilestoneDto) => {
    try {
      setActionLoading(true);
      await updateMilestone(milestoneId, dto);
      setEditModalOpen(false);
      setEditingMilestone(null);
      await fetchMilestones(); // Refetch to get updated data
    } catch (err) {
      console.error('Failed to update milestone:', err);
      // Error handling is done in the modal
    } finally {
      setActionLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (milestoneId: string, status: MilestoneStatus) => {
    try {
      setActionLoading(true);
      await updateMilestoneStatus(milestoneId, status);
      await fetchMilestones(); // Refetch to get updated data
    } catch (err) {
      console.error('Failed to update milestone status:', err);
      // You could show a toast notification here
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete milestone
  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      setActionLoading(true);
      await deleteMilestone(milestoneId);
      await fetchMilestones(); // Refetch to get updated data
    } catch (err) {
      console.error('Failed to delete milestone:', err);
      // You could show a toast notification here
    } finally {
      setActionLoading(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    fetchMilestones();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonSummaryBar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ))}
        </div>
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
        <SkeletonSummaryBar />
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="space-y-6">
        <SummaryBar milestones={milestones} />
        <EmptyState onCreateMilestone={() => setCreateModalOpen(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Milestones</h2>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Milestone
        </button>
      </div>

      {/* Summary Bar */}
      <SummaryBar milestones={milestones} />

      {/* Milestones Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planned Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Planned</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              {groupedMilestones.Planned.length}
            </span>
          </div>
          <div className="space-y-3">
            {groupedMilestones.Planned.map((milestone) => (
              <MilestoneCard
                key={milestone.milestoneId}
                milestone={milestone}
                onEdit={handleEditMilestone}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteMilestone}
              />
            ))}
          </div>
        </div>

        {/* Active Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Active</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
              {groupedMilestones.Active.length}
            </span>
          </div>
          <div className="space-y-3">
            {groupedMilestones.Active.map((milestone) => (
              <MilestoneCard
                key={milestone.milestoneId}
                milestone={milestone}
                onEdit={handleEditMilestone}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteMilestone}
              />
            ))}
          </div>
        </div>

        {/* Completed Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
            <span className="px-2 py-1 bg-green-100 text-green-600 text-sm rounded-full">
              {groupedMilestones.Completed.length}
            </span>
          </div>
          <div className="space-y-3">
            {groupedMilestones.Completed.map((milestone) => (
              <MilestoneCard
                key={milestone.milestoneId}
                milestone={milestone}
                onEdit={handleEditMilestone}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteMilestone}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <MilestoneCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateMilestone}
        loading={actionLoading}
      />

      <MilestoneEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingMilestone(null);
        }}
        onSubmit={handleUpdateMilestone}
        milestone={editingMilestone}
        loading={actionLoading}
      />
    </div>
  );
};

export default MilestonesTab;
