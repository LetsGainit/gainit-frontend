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