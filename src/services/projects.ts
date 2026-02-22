import api from '@/lib/api';

export interface Project {
    id: string;          // UUID string from the API
    name: string;
    title?: string;
    description?: string;
    main_sector?: string;
    business_model?: string;
    status: string;
    created_at?: string;
}

export interface OnboardingAnswer {
    question: string;
    answer: string;
}

export const projectsService = {
    getAll: async (): Promise<Project[]> => {
        const response = await api.get('/projects');
        return response.data;
    },

    getById: async (id: string): Promise<Project> => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },

    create: async (data: Partial<Project>): Promise<Project> => {
        const response = await api.post('/projects', data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/projects/${id}`);
    },

    // GET already-answered questions (to resume onboarding)
    getOnboarding: async (id: string): Promise<OnboardingAnswer[]> => {
        const response = await api.get(`/projects/${id}/onboarding`);
        return response.data;
    },

    // PATCH a single answer by its question label
    patchAnswer: async (id: string, questionLabel: string, answer: string): Promise<any> => {
        const response = await api.patch(
            `/projects/${id}/onboarding/${encodeURIComponent(questionLabel)}`,
            { answer }
        );
        return response.data;
    },

    completeOnboarding: async (id: string): Promise<any> => {
        const response = await api.post(`/projects/${id}/complete`);
        return response.data;
    },

    getPlan: async (id: string): Promise<any> => {
        const response = await api.get(`/projects/${id}/plan`);
        return response.data;
    },

    getAnalysis: async (id: string): Promise<any> => {
        const response = await api.get(`/projects/${id}/plan/analysis`);
        return response.data;
    }
};
