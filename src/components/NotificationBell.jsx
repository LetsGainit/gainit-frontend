import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, X, CheckCircle, AlertCircle, Info, Users, CheckSquare, MessageSquare, Play } from 'lucide-react';
import signalRService from '../services/signalRService';
import '../css/NotificationBell.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        // Add error handling for SignalR connection
        const startConnection = async () => {
            try {
                const connected = await signalRService.startConnection();
                if (connected) {
                    setIsConnected(true);
                    setConnectionError(null);
                } else {
                    setIsConnected(false);
                    setConnectionError('Failed to connect to notification service');
                }
            } catch (error) {
                console.error('Failed to start SignalR connection:', error);
                setIsConnected(false);
                setConnectionError('Connection error: ' + error.message);
            }
        };
        
        startConnection();

        // Listen for SignalR notifications
        const handleNotification = (event) => {
            const { eventName, data } = event.detail;
            addNotification(eventName, data);
        };

        // Listen for connection status changes
        const handleConnectionChange = () => {
            const state = signalRService.getConnectionState();
            setIsConnected(state === 'Connected');
            if (state === 'Disconnected') {
                setConnectionError('Connection lost');
            } else if (state === 'Connected') {
                setConnectionError(null);
            }
        };

        // Check connection status periodically
        const connectionInterval = setInterval(handleConnectionChange, 2000);

        window.addEventListener('signalr-notification', handleNotification);

        // Handle clicks outside to close dropdown
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup on unmount
        return () => {
            clearInterval(connectionInterval);
            window.removeEventListener('signalr-notification', handleNotification);
            document.removeEventListener('mousedown', handleClickOutside);
            signalRService.stopConnection();
        };
    }, []);

    // Add new notification
    const addNotification = (eventName, data) => {
        const notification = {
            id: Date.now() + Math.random(),
            type: getNotificationType(eventName),
            title: getNotificationTitle(eventName, data),
            message: getNotificationMessage(eventName, data),
            timestamp: new Date(),
            read: false,
            eventName,
            data
        };

        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            removeNotification(notification.id);
        }, 10000);
    };

    // Get notification type based on event
    const getNotificationType = (eventName) => {
        if (eventName.includes('Approved') || eventName.includes('Completed') || eventName.includes('Started')) {
            return 'success';
        } else if (eventName.includes('Rejected') || eventName.includes('Error')) {
            return 'error';
        } else if (eventName.includes('Requested') || eventName.includes('Created')) {
            return 'info';
        } else {
            return 'info';
        }
    };

    // Get notification title
    const getNotificationTitle = (eventName, data) => {
        const titles = {
            'projectJoinRequested': 'New Join Request',
            'projectJoinApproved': 'Join Request Approved',
            'projectJoinRejected': 'Join Request Rejected',
            'projectJoinCancelled': 'Join Request Cancelled',
            'projectStarted': 'Project Started',
            'taskCreated': 'New Task Created',
            'taskCompleted': 'Task Completed',
            'taskUnblocked': 'Task Unblocked',
            'milestoneCompleted': 'Milestone Completed',
            'postReplied': 'New Reply',
            'postLiked': 'Post Liked',
            'replyLiked': 'Reply Liked'
        };
        return titles[eventName] || 'New Notification';
    };

    // Get notification message
    const getNotificationMessage = (eventName, data) => {
        switch (eventName) {
            case 'projectJoinRequested':
                return `Someone requested to join project "${data.projectName || 'Unknown Project'}"`;
            case 'projectJoinApproved':
                return `Your request to join project has been approved`;
            case 'projectJoinRejected':
                return `Your request to join project was rejected${data.decisionReason ? ': ' + data.decisionReason : ''}`;
            case 'projectJoinCancelled':
                return `A join request for project has been cancelled`;
            case 'projectStarted':
                return `Project "${data.projectName || 'Unknown Project'}" has been started and is now active`;
            case 'taskCreated':
                return `New task "${data.title}" created in project "${data.projectName}"`;
            case 'taskCompleted':
                return `Task "${data.title}" has been completed in project "${data.projectName}"`;
            case 'taskUnblocked':
                return `Task "${data.title}" is now unblocked and ready to work on`;
            case 'milestoneCompleted':
                return `Milestone "${data.title}" completed in project "${data.projectName}"`;
            case 'postReplied':
                return `${data.replyAuthorName} replied to your post in project "${data.projectName}"`;
            case 'postLiked':
                return `${data.likedByUserName} liked your post in project "${data.projectName}"`;
            case 'replyLiked':
                return `${data.likedByUserName} liked your reply in project "${data.projectName}"`;
            default:
                return 'You have a new notification';
        }
    };

    // Get notification icon
    const getNotificationIcon = (type, eventName) => {
        if (type === 'success') return <CheckCircle className="notification-icon success" />;
        if (type === 'error') return <AlertCircle className="notification-icon error" />;
        
        // Event-specific icons
        if (eventName.includes('project') || eventName.includes('Join')) {
            return <Users className="notification-icon info" />;
        } else if (eventName.includes('task') || eventName.includes('milestone')) {
            return <CheckSquare className="notification-icon info" />;
        } else if (eventName.includes('post') || eventName.includes('reply')) {
            return <MessageSquare className="notification-icon info" />;
        } else if (eventName === 'projectStarted') {
            return <Play className="notification-icon success" />;
        }
        
        return <Info className="notification-icon info" />;
    };

    // Mark notification as read
    const markAsRead = (id) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === id 
                    ? { ...notification, read: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
    };

    // Remove notification
    const removeNotification = (id) => {
        setNotifications(prev => {
            const notification = prev.find(n => n.id === id);
            if (notification && !notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            return prev.filter(n => n.id !== id);
        });
    };

    // Handle notification click
    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        
        // Navigate based on notification type
        switch (notification.eventName) {
            case 'projectJoinRequested':
                // Navigate to project join requests page
                window.location.href = `/projects/${notification.data.projectId}/join-requests`;
                break;
            case 'taskCreated':
            case 'taskCompleted':
            case 'taskUnblocked':
                // Navigate to project tasks page
                window.location.href = `/projects/${notification.data.projectId}/tasks`;
                break;
            case 'postReplied':
            case 'postLiked':
            case 'replyLiked':
                // Navigate to project forum
                window.location.href = `/projects/${notification.data.projectId}/forum`;
                break;
            case 'projectStarted':
                // Navigate to project overview
                window.location.href = `/projects/${notification.data.projectId}`;
                break;
            default:
                // Navigate to project overview
                window.location.href = `/projects/${notification.data.projectId}`;
        }
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="notification-bell-container" ref={notificationRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`bell-button ${!isConnected ? 'disconnected' : ''}`}
                aria-label="Notifications"
                title={connectionError || (isConnected ? 'Connected' : 'Disconnected')}
            >
                {unreadCount > 0 ? (
                    <BellRing className="bell-icon active" />
                ) : (
                    <Bell className="bell-icon" />
                )}
                
                {/* Connection Status Indicator */}
                <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
                
                {/* Unread Count Badge */}
                {unreadCount > 0 && (
                    <span className="unread-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="notification-dropdown">
                    {/* Header */}
                    <div className="notification-header">
                        <div className="notification-title-section">
                            <h3 className="notification-title">
                                Notifications
                            </h3>
                            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                                <div className="status-dot"></div>
                                <span className="status-text">
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                        <div className="notification-actions">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="mark-all-read-btn"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="close-btn"
                            >
                                <X className="close-icon" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notifications">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-content">
                                        {getNotificationIcon(notification.type, notification.eventName)}
                                        <div className="notification-details">
                                            <div className="notification-item-header">
                                                <p className="notification-item-title">
                                                    {notification.title}
                                                </p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeNotification(notification.id);
                                                    }}
                                                    className="remove-notification-btn"
                                                >
                                                    <X className="remove-icon" />
                                                </button>
                                            </div>
                                            <p className="notification-item-message">
                                                {notification.message}
                                            </p>
                                            <p className="notification-item-time">
                                                {formatTimestamp(notification.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="notification-footer">
                            <button
                                onClick={() => {
                                    setNotifications([]);
                                    setUnreadCount(0);
                                }}
                                className="clear-all-btn"
                            >
                                Clear all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
