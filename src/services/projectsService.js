import api from "./api";

export async function getAllTemplateProjects() {
    try {
        const response = await api.get("/projects/active");
        return response.data;
    } catch (error) {
        throw error;
    }
}