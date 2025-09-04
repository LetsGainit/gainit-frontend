import api from "./api";

export async function getUserActivity(projectId, userId, correlationId) {
    const response = await api.get(`/github/projects/${projectId}/users/${userId}/activity`, {
        headers: {
            'X-Correlation-ID': correlationId
        }
    });
    return response.data;
}
