import api from '@/lib/api';

export interface Project {
    id: number;
    name: string;
    description?: string;
    status: string;
    created_at?: string;
}

export const projectsService = {
    getAll: async (): Promise<Project[]> => {
        const response = await api.get('/projects');
        return response.data;
    },

    getById: async (id: number): Promise<Project> => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },

    create: async (data: Partial<Project>): Promise<Project> => {
        const response = await api.post('/projects', data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/projects/${id}`);
    },

    submitOnboarding: async (id: number, data: any): Promise<any> => {
        const response = await api.post(`/projects/${id}/onboarding`, data);
        return response.data;
    },

    completeOnboarding: async (id: number): Promise<any> => {
        const response = await api.post(`/projects/${id}/complete`);
        return response.data;
    },

    getPlan: async (id: number): Promise<any> => {
        const response = await api.get(`/projects/${id}/plan`);
        return response.data;
    }
};
