import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const jobAPI = {
    getAllJobs: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.job_type) params.append('job_type', filters.job_type);
        if (filters.location) params.append('location', filters.location);
        if (filters.tag) params.append('tag', filters.tag);
        if (filters.search) params.append('search', filters.search);
        if (filters.sort) params.append('sort', filters.sort);

        const response = await api.get('/jobs', { params: filters });

        return response.data;
    },

    getJobById: async (id) => {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    },

    createJob: async (jobData) => {
        const response = await api.post('/jobs', jobData);
        return response.data;
    },

    updateJob: async (id, jobData) => {
        const response = await api.put(`/jobs/${id}`, jobData);
        return response.data;
    },

    deleteJob: async (id) => {
        const response = await api.delete(`/jobs/${id}`);
        return response.data;
    },

    getFilterOptions: async () => {
        const response = await api.get('/jobs/filters');
        return response.data;
    }
};

export default api;