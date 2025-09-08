import React, { useState, useEffect } from 'react';
import { X, Users, Clock, CheckCircle, XCircle, MessageSquare, User, Mail, Calendar, Briefcase } from 'lucide-react';
import { getJoinRequests, getJoinRequestById, decideJoinRequest } from '../services/projectsService';
import './JoinRequestsModal.css';

interface JoinRequest {
  joinRequestId: string;
  projectId: string;
  requesterUserId: string;
  requesterFullName: string;
  requesterEmailAddress: string;
  message: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  decisionReason: string | null;
  createdAtUtc: string;
  decisionAtUtc: string | null;
  isApproved: boolean;
  requestedRole: string;
  projectName: string;
  deciderUserId: string | null;
}

interface JoinRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onDecision?: (projectId: string, joinRequestId: string, isApproved: boolean) => void;
  onError?: (error: any) => void;
  loading?: boolean;
}

const JoinRequestsModal: React.FC<JoinRequestsModalProps> = ({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName, 
  onDecision, 
  onError, 
  loading: externalLoading = false 
}) => {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decisionLoading, setDecisionLoading] = useState<string | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<{ requestId: string; isApproved: boolean } | null>(null);

  // Generate correlation ID
  const generateCorrelationId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Load join requests
  useEffect(() => {
    if (isOpen && projectId) {
      loadJoinRequests();
    } else if (!isOpen) {
      // Reset state when modal closes
      setJoinRequests([]);
      setSelectedRequest(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, projectId]);

  const loadJoinRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const correlationId = generateCorrelationId();
      const requests = await getJoinRequests(projectId, 'Pending' as any, correlationId);
      setJoinRequests(requests);
    } catch (err: any) {
      let errorMessage = 'Failed to load join requests';
      
      // Handle specific error cases
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        errorMessage = 'You do not have permission to view join requests for this project. Only project administrators can access this feature.';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = async (request: JoinRequest) => {
    setSelectedRequest(request);
  };

  const handleDecision = (requestId: string, isApproved: boolean) => {
    setPendingDecision({ requestId, isApproved });
    setDecisionReason('');
    setShowDecisionModal(true);
  };

  const submitDecision = async () => {
    if (!pendingDecision) return;

    setDecisionLoading(pendingDecision.requestId);
    try {
      const correlationId = generateCorrelationId();
      await decideJoinRequest(
        projectId,
        pendingDecision.requestId,
        pendingDecision.isApproved,
        decisionReason.trim() ? decisionReason.trim() : undefined,
        correlationId
      );

      // Call external decision callback
      if (onDecision) {
        onDecision(projectId, pendingDecision.requestId, pendingDecision.isApproved);
      }

      // Remove the processed request from the list
      setJoinRequests(prev => prev.filter(req => req.joinRequestId !== pendingDecision.requestId));
      
      // Close decision modal
      setShowDecisionModal(false);
      setPendingDecision(null);
      setDecisionReason('');
      
      // If we were viewing this request, clear selection
      if (selectedRequest?.joinRequestId === pendingDecision.requestId) {
        setSelectedRequest(null);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to process decision';
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
    } finally {
      setDecisionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock size={16} className="status-icon pending" />;
      case 'Approved':
        return <CheckCircle size={16} className="status-icon approved" />;
      case 'Rejected':
        return <XCircle size={16} className="status-icon rejected" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="join-requests-modal-overlay">
      <div className="join-requests-modal">
        {/* Header */}
        <div className="join-requests-modal-header">
          <div className="header-content">
            <div className="header-title">
              <Users size={24} className="header-icon" />
              <h2>Join Requests</h2>
            </div>
            <p className="header-subtitle">{projectName}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="join-requests-modal-content">
          {(loading || externalLoading) ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading join requests...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <XCircle size={48} className="error-icon" />
              <h3>
                {error.includes('permission') || error.includes('administrator') 
                  ? 'Access Denied' 
                  : 'Error Loading Requests'}
              </h3>
              <p>{error}</p>
              {!error.includes('permission') && !error.includes('administrator') && (
                <button className="retry-button" onClick={loadJoinRequests}>
                  Try Again
                </button>
              )}
            </div>
          ) : joinRequests.length === 0 ? (
            <div className="empty-state">
              <Users size={48} className="empty-icon" />
              <h3>No Pending Requests</h3>
              <p>There are no pending join requests for this project.</p>
            </div>
          ) : (
            <div className="join-requests-layout">
              {/* Requests List */}
              <div className="requests-list">
                <h3>Pending Requests ({joinRequests.length})</h3>
                <div className="requests-container">
                  {joinRequests.map((request) => (
                    <div
                      key={request.joinRequestId}
                      className={`request-item ${selectedRequest?.joinRequestId === request.joinRequestId ? 'selected' : ''}`}
                      onClick={() => handleRequestClick(request)}
                    >
                      <div className="request-header">
                        <div className="requester-info">
                          <User size={16} className="user-icon" />
                          <span className="requester-name">{request.requesterFullName}</span>
                        </div>
                        {getStatusIcon(request.status)}
                      </div>
                      <div className="request-details">
                        <div className="request-role">
                          <Briefcase size={14} className="role-icon" />
                          <span>{request.requestedRole}</span>
                        </div>
                        <div className="request-date">
                          <Calendar size={14} className="date-icon" />
                          <span>{formatDate(request.createdAtUtc)}</span>
                        </div>
                      </div>
                      {request.message && (
                        <div className="request-message-preview">
                          <MessageSquare size={14} className="message-icon" />
                          <span>{request.message.length > 100 ? `${request.message.substring(0, 100)}...` : request.message}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Details */}
              <div className="request-details-panel">
                {selectedRequest ? (
                  <div className="request-detail-content">
                    <div className="detail-header">
                      <h3>Request Details</h3>
                    </div>
                    
                    <div className="detail-section">
                      <h4>Requester Information</h4>
                      <div className="detail-item">
                        <User size={16} className="detail-icon" />
                        <div>
                          <span className="detail-label">Name:</span>
                          <span className="detail-value">{selectedRequest.requesterFullName}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Mail size={16} className="detail-icon" />
                        <div>
                          <span className="detail-label">Email:</span>
                          <span className="detail-value">{selectedRequest.requesterEmailAddress}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Briefcase size={16} className="detail-icon" />
                        <div>
                          <span className="detail-label">Requested Role:</span>
                          <span className="detail-value">{selectedRequest.requestedRole}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Calendar size={16} className="detail-icon" />
                        <div>
                          <span className="detail-label">Requested:</span>
                          <span className="detail-value">{formatDate(selectedRequest.createdAtUtc)}</span>
                        </div>
                      </div>
                    </div>

                    {selectedRequest.message && (
                      <div className="detail-section">
                        <h4>Message</h4>
                        <div className="message-content">
                          <MessageSquare size={16} className="message-icon" />
                          <p>{selectedRequest.message}</p>
                        </div>
                      </div>
                    )}

                    <div className="detail-actions">
                      <button
                        className="action-button approve-button"
                        onClick={() => handleDecision(selectedRequest.joinRequestId, true)}
                        disabled={decisionLoading === selectedRequest.joinRequestId}
                      >
                        {decisionLoading === selectedRequest.joinRequestId ? (
                          <div className="button-spinner"></div>
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Approve
                      </button>
                      <button
                        className="action-button reject-button"
                        onClick={() => handleDecision(selectedRequest.joinRequestId, false)}
                        disabled={decisionLoading === selectedRequest.joinRequestId}
                      >
                        {decisionLoading === selectedRequest.joinRequestId ? (
                          <div className="button-spinner"></div>
                        ) : (
                          <XCircle size={16} />
                        )}
                        Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-selection">
                    <Users size={48} className="no-selection-icon" />
                    <h3>Select a Request</h3>
                    <p>Choose a join request from the list to view details and make a decision.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Decision Modal */}
        {showDecisionModal && pendingDecision && (
          <div className="decision-modal-overlay">
            <div className="decision-modal">
              <div className="decision-modal-header">
                <h3>{pendingDecision.isApproved ? 'Approve Request' : 'Reject Request'}</h3>
                <button className="close-button" onClick={() => setShowDecisionModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="decision-modal-content">
                <p>
                  Are you sure you want to {pendingDecision.isApproved ? 'approve' : 'reject'} this join request?
                </p>
                
                <div className="reason-input">
                  <label htmlFor="decision-reason">
                    Reason (optional):
                  </label>
                  <textarea
                    id="decision-reason"
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder={`Enter a reason for ${pendingDecision.isApproved ? 'approving' : 'rejecting'} this request...`}
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="decision-modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowDecisionModal(false)}
                  disabled={decisionLoading !== null}
                >
                  Cancel
                </button>
                <button
                  className={`confirm-button ${pendingDecision.isApproved ? 'approve' : 'reject'}`}
                  onClick={submitDecision}
                  disabled={decisionLoading !== null}
                >
                  {decisionLoading ? (
                    <div className="button-spinner"></div>
                  ) : (
                    pendingDecision.isApproved ? 'Approve' : 'Reject'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinRequestsModal;
