import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { Milestone, UpdateMilestoneDto } from '../../services/milestones.api';

interface MilestoneEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (milestoneId: string, dto: UpdateMilestoneDto) => void;
  milestone: Milestone | null;
  loading?: boolean;
}

const MilestoneEditModal: React.FC<MilestoneEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  milestone,
  loading = false
}) => {
  const [formData, setFormData] = useState<UpdateMilestoneDto>({
    title: '',
    description: '',
    targetDateUtc: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (milestone) {
      setFormData({
        title: milestone.title,
        description: milestone.description || '',
        targetDateUtc: milestone.targetDateUtc
      });
    }
  }, [milestone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!milestone) return;
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.targetDateUtc) {
      newErrors.targetDateUtc = 'Target date is required';
    } else {
      const targetDate = new Date(formData.targetDateUtc);
      const now = new Date();
      if (targetDate <= now) {
        newErrors.targetDateUtc = 'Target date must be in the future';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(milestone.milestoneId, formData);
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', targetDateUtc: '' });
    setErrors({});
    onClose();
  };

  const handleChange = (field: keyof UpdateMilestoneDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !milestone) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Milestone</h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter milestone title"
              disabled={loading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter milestone description (optional)"
              disabled={loading}
            />
          </div>

          {/* Target Date */}
          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-2">
              Target Date *
            </label>
            <div className="relative">
              <input
                id="targetDate"
                type="datetime-local"
                value={formData.targetDateUtc ? new Date(formData.targetDateUtc).toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  const value = e.target.value ? new Date(e.target.value).toISOString() : '';
                  handleChange('targetDateUtc', value);
                }}
                className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.targetDateUtc ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            {errors.targetDateUtc && (
              <p className="mt-1 text-sm text-red-600">{errors.targetDateUtc}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneEditModal;
