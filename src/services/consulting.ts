import api from '@/lib/api';

export interface ConsultingRequest {
    id: string;
    title: string;
    description?: string;
    status: string;
    scheduled_at?: string;
}

export const consultingService = {
    getAll: async (): Promise<ConsultingRequest[]> => {
        const response = await api.get('/consulting');
        return response.data;
    },

    create: async (data: Partial<ConsultingRequest>): Promise<ConsultingRequest> => {
        const response = await api.post('/consulting', data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/consulting/${id}`);
    }
};
