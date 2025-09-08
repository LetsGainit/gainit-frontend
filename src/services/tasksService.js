import api from "./api";

// Get current user's tasks for a specific project
export async function getMyTasks(projectId, params = {}, correlationId) {
    const response = await api.get(`/projects/${projectId}/tasks/my-tasks`, {
        headers: correlationId ? { 'X-Correlation-ID': correlationId } : undefined,
        params: {
            includeCompleted: false,
            sortBy: 'CreatedAtUtc',
            ...params
        }
    });
    return response.data;
}

// Get board data for a specific project
export async function getBoardData(projectId, params = {}, correlationId) {
    const response = await api.get(`/projects/${projectId}/tasks/board`, {
        headers: correlationId ? { 'X-Correlation-ID': correlationId } : undefined,
        params: {
            includeCompleted: true,
            ...params
        }
    });
    return response.data;
}

// Backwards-compatible alias to getMyTasks for a project
export async function getProjectTasks(projectId, params = {}, correlationId) {
    return getMyTasks(projectId, params, correlationId);
}
