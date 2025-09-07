import api from "./api";

export async function getAllActiveProjects() {
    const response = await api.get("/projects/active");
    return response.data;
}

export async function getUserProjects(userId, correlationId) {
    const response = await api.get(`/projects/user/${userId}`, {
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
    const response = await api.get("/api/users/me");
    return response.data;
}

export async function getMatchedProjects(userId, count = 5) {
    console.log(`[Home] Calling /api/match/profile with userId=${userId}, count=${count}`);
    const response = await api.get(`/api/match/profile?userId=${userId}&count=${count}`);
    return response.data;
}