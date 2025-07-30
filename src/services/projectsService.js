import api from "./api";

export async function getAllActiveProjects() {
    try {
        const response = await api.get("/projects/active");
        return response.data;
    } catch (error) {
        throw error;
    }
}