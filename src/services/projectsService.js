import api from "./api";

export async function getAllActiveProjects() {
    const response = await api.get("/projects/active");
    return response.data;
}