import * as signalR from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.eventHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    // Initialize connection
    async startConnection() {
        try {
            console.log('🔗 SignalR: Starting connection...');
            
            // Get your JWT token (adjust based on how you store it)
            const token = await this.getTokenFromAuthProviderAsync();
            console.log('🔗 SignalR: Token acquired:', token ? 'Yes' : 'No');

            if (!token) {
                console.warn('🔗 SignalR: No JWT token found for SignalR connection');
                return false;
            }

            // Try different possible endpoint paths
            const possibleEndpoints = [
                'https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/hubs/notifications',
                'https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/hub/notifications',
                'https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/notifications',
                'https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/signalr/notifications'
            ];
            
            const endpoint = possibleEndpoints[0]; // Start with the original
            console.log('🔗 SignalR: Trying endpoint:', endpoint);
            
            // Create connection - using your backend URL
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(endpoint, {
                    accessTokenFactory: async () => {
                        // This will be called whenever the connection needs a token
                        // It will automatically handle token refresh
                        return await this.getTokenFromAuthProviderAsync();
                    },
                    // For Azure SignalR Service, use WebSockets only and skip negotiation
                    transport: signalR.HttpTransportType.WebSockets,
                    skipNegotiation: true // Skip negotiation for Azure SignalR Service
                })
                .withAutomaticReconnect([0, 2000, 10000, 30000]) // Auto-reconnect with backoff
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Set up event handlers
            this.setupEventHandlers();

            // Start connection
            console.log('🔗 SignalR: Attempting to start connection...');
            await this.connection.start();
            this.isConnected = true;
            this.reconnectAttempts = 0;

            console.log('🔗 SignalR: Connected successfully!');
            return true;

        } catch (error) {
            console.error('🔗 SignalR: Connection failed:', error);
            this.handleConnectionError(error);
            return false;
        }
    }

    // Set up all event handlers
    setupEventHandlers() {
        // Project Events
        this.connection.on('projectJoinRequested', (data) => {
            this.handleEvent('projectJoinRequested', data);
        });

        this.connection.on('projectJoinApproved', (data) => {
            this.handleEvent('projectJoinApproved', data);
        });

        this.connection.on('projectJoinRejected', (data) => {
            this.handleEvent('projectJoinRejected', data);
        });

        this.connection.on('projectJoinCancelled', (data) => {
            this.handleEvent('projectJoinCancelled', data);
        });

        this.connection.on('projectStarted', (data) => {
            this.handleEvent('projectStarted', data);
        });

        // Task Events
        this.connection.on('taskCreated', (data) => {
            this.handleEvent('taskCreated', data);
        });

        this.connection.on('taskCompleted', (data) => {
            this.handleEvent('taskCompleted', data);
        });

        this.connection.on('taskUnblocked', (data) => {
            this.handleEvent('taskUnblocked', data);
        });

        this.connection.on('milestoneCompleted', (data) => {
            this.handleEvent('milestoneCompleted', data);
        });

        // Forum Events
        this.connection.on('postReplied', (data) => {
            this.handleEvent('postReplied', data);
        });

        this.connection.on('postLiked', (data) => {
            this.handleEvent('postLiked', data);
        });

        this.connection.on('replyLiked', (data) => {
            this.handleEvent('replyLiked', data);
        });

        // Connection state events
        this.connection.onclose((error) => {
            this.isConnected = false;
            console.log('SignalR connection closed:', error);
            this.handleConnectionError(error);
        });

        this.connection.onreconnecting((error) => {
            this.isConnected = false;
            console.log('SignalR reconnecting:', error);
        });

        this.connection.onreconnected((connectionId) => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('SignalR reconnected:', connectionId);
        });
    }

    // Generic event handler
    handleEvent(eventName, data) {
        console.log(`SignalR event received: ${eventName}`, data);
        
        // Call registered handlers
        const handlers = this.eventHandlers.get(eventName) || [];
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for ${eventName}:`, error);
            }
        });

        // Trigger global notification system
        this.triggerNotification(eventName, data);
    }

    // Register event handler
    on(eventName, handler) {
        if (!this.eventHandlers.has(eventName)) {
            this.eventHandlers.set(eventName, []);
        }
        this.eventHandlers.get(eventName).push(handler);
    }

    // Remove event handler
    off(eventName, handler) {
        const handlers = this.eventHandlers.get(eventName);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // Handle connection errors
    handleConnectionError(error) {
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.startConnection();
            }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    // Get token from your auth provider (Azure B2C with MSAL)
    getTokenFromAuthProvider() {
        // Try to get token from localStorage first (fallback)
        const token = localStorage.getItem('access_token') || 
                     sessionStorage.getItem('access_token');
        
        if (token) {
            // Check if token is expired
            if (this.isTokenExpired(token)) {
                console.warn('Token is expired, removing from storage');
                localStorage.removeItem('access_token');
                sessionStorage.removeItem('access_token');
                return null;
            }
            return token;
        }

        // Try to get token from MSAL (Azure B2C)
        try {
            // Get MSAL instance (adjust based on how you initialize MSAL)
            const msalInstance = window.msalInstance || this.msalInstance;
            
            if (msalInstance) {
                const account = msalInstance.getActiveAccount();
                if (account && account.idToken) {
                    return account.idToken;
                }
                
                // Try to get access token silently
                const tokenRequest = {
                    scopes: ['openid', 'profile', 'email'], // Adjust scopes as needed
                    account: account
                };
                
                // This is async, so you might need to handle it differently
                // For now, return the idToken if available
                if (account && account.idToken) {
                    return account.idToken;
                }
            }
        } catch (error) {
            console.warn('Could not get token from MSAL:', error);
        }
        
        return null;
    }

    // Async version for better token refresh handling
    async getTokenFromAuthProviderAsync() {
        console.log('🔑 SignalR: Getting token from auth provider...');
        
        // Use the same token acquisition method as the API service
        try {
            const { getAccessToken } = await import('../auth/auth');
            const token = await getAccessToken();
            
            if (token) {
                console.log('🔑 SignalR: Got token from getAccessToken()');
                return token;
            } else {
                console.warn('🔑 SignalR: getAccessToken() returned no token');
            }
        } catch (error) {
            console.warn('🔑 SignalR: Failed to get token from getAccessToken():', error);
        }
        
        // Fallback: Try to get token from localStorage/sessionStorage
        const storedToken = localStorage.getItem('access_token') || 
                           sessionStorage.getItem('access_token');
        
        console.log('🔑 SignalR: Stored token found:', storedToken ? 'Yes' : 'No');
        
        if (storedToken) {
            // Check if token is expired
            if (this.isTokenExpired(storedToken)) {
                console.warn('🔑 SignalR: Stored token is expired, removing from storage');
                localStorage.removeItem('access_token');
                sessionStorage.removeItem('access_token');
            } else {
                console.log('🔑 SignalR: Using stored token');
                return storedToken;
            }
        }
        
        return null;
    }

    // Helper method to check token expiration
    isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    }

    // Disconnect
    async stopConnection() {
        if (this.connection) {
            await this.connection.stop();
            this.isConnected = false;
            console.log('SignalR disconnected');
        }
    }

    // Check connection status
    getConnectionState() {
        return this.connection?.state || signalR.HubConnectionState.Disconnected;
    }

    // Trigger notification (implement based on your notification system)
    triggerNotification(eventName, data) {
        // This will be implemented in the notification component
        window.dispatchEvent(new CustomEvent('signalr-notification', {
            detail: { eventName, data }
        }));
    }
}

// Export singleton instance
export const signalRService = new SignalRService();
export default signalRService;
