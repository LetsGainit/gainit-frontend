import api from "./api";

export async function getMyTasks(correlationId, params = {}) {
    const response = await api.get('/tasks/my-tasks', {
        headers: {
            'X-Correlation-ID': correlationId
        },
        params: {
            includeCompleted: false,
            sortBy: 'CreatedAtUtc',
            ...params
        }
    });
    return response.data;
}

export async function getBoardData(correlationId, params = {}) {
    const response = await api.get('/tasks/board', {
        headers: {
            'X-Correlation-ID': correlationId
        },
        params: {
            includeCompleted: true,
            ...params
        }
    });
    return response.data;
}

export async function getProjectTasks(correlationId, projectId, params = {}) {
    const response = await api.get(`/tasks/project/${projectId}`, {
        headers: {
            'X-Correlation-ID': correlationId
        },
        params: {
            includeCompleted: true,
            sortBy: 'CreatedAtUtc',
            ...params
        }
    });
    return response.data;
}
