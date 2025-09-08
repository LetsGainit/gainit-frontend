import api from "./api";

export async function getAllActiveProjects() {
    const response = await api.get("/projects/active");
    return response.data;
}

export async function getUserProjects(correlationId) {
    const response = await api.get(`/projects/user/me`, {
        headers: {
            'X-Correlation-ID': correlationId
        }
    });
    return response.data;
}

export async function getProjectById(projectId, correlationId) {
    const response = await api.get(`/projects/${projectId}`, {
        headers: {
            'X-Correlation-ID': correlationId
        }
    });
    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get("/users/me");
    return response.data;
}

export async function getMatchedProjects(userId, count = 5) {
    console.log(`[Home] Calling /api/match/profile with userId=${userId}, count=${count}`);
    const response = await api.get(`/api/match/profile?userId=${userId}&count=${count}`);
    return response.data;
}

// Start a project (move from Pending to InProgress)
export async function startProject(projectId, correlationId) {
    const response = await api.post(`/projects/${projectId}/start`, undefined, {
        headers: correlationId ? { 'X-Correlation-ID': correlationId } : undefined
    });
    return response.data;
}

// Update a project's connected repository
export async function updateProjectRepository(projectId, repositoryUrl, correlationId) {
    const response = await api.put(`/projects/${projectId}/repository`, JSON.stringify(repositoryUrl), {
        headers: {
            'Content-Type': 'application/json',
            ...(correlationId ? { 'X-Correlation-ID': correlationId } : {})
        }
    });
    return response.data;
}

// Join Requests API functions
export async function getJoinRequests(projectId, status = null, correlationId) {
    const url = status ? `/projects/${projectId}/myrequests?status=${status}` : `/projects/${projectId}/myrequests`;
    const response = await api.get(url, {
        headers: {
            ...(correlationId ? { 'X-Correlation-ID': correlationId } : {})
        }
    });
    return response.data;
}

export async function getJoinRequestById(projectId, joinRequestId, correlationId) {
    const response = await api.get(`/projects/${projectId}/joinrequests/${joinRequestId}`, {
        headers: {
            ...(correlationId ? { 'X-Correlation-ID': correlationId } : {})
        }
    });
    return response.data;
}

export async function createJoinRequest(projectId, message, requestedRole, correlationId) {
    const response = await api.post(`/projects/${projectId}/createrequest`, {
        message: message,
        requestedRole: requestedRole
    }, {
        headers: {
            'Content-Type': 'application/json',
            ...(correlationId ? { 'X-Correlation-ID': correlationId } : {})
        }
    });
    return response.data;
}

export async function cancelJoinRequest(projectId, joinRequestId, reason = null, correlationId) {
    const response = await api.post(`/projects/${projectId}/joinrequests/${joinRequestId}/cancel`, {
        reason: reason
    }, {
        headers: {
            'Content-Type': 'application/json',
            ...(correlationId ? { 'X-Correlation-ID': correlationId } : {})
        }
    });
    return response.data;
}

export async function decideJoinRequest(projectId, joinRequestId, isApproved, reason, correlationId) {
    const response = await api.post(`/projects/${projectId}/${joinRequestId}/decision`, {
        isApproved: isApproved,
        reason: reason
    }, {
        headers: {
            'Content-Type': 'application/json',
            ...(correlationId ? { 'X-Correlation-ID': correlationId } : {})
        }
    });
    return response.data;
}