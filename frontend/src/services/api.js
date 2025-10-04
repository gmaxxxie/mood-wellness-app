import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error.response?.data || error.message);
  }
);

// API服务
export const api = {
  // 评估相关
  assessment: {
    getQuestions: () => apiClient.get('/assessment/questions'),
    getTags: () => apiClient.get('/assessment/tags'),
    submit: (data) => apiClient.post('/assessment/submit', data),
    getHistory: (userId, params = {}) => apiClient.get(`/assessment/history/${userId}`, { params }),
    analyzeVoice: (data) => apiClient.post('/assessment/voice-analysis', data),
  },

  // 情绪相关
  emotion: {
    getCategories: () => apiClient.get('/emotion/categories'),
    getStats: (params = {}) => apiClient.get('/emotion/stats', { params }),
  },

  // 解决方案相关
  solution: {
    getRecommendations: (data) => apiClient.post('/solution/recommendations', data),
    getTypes: () => apiClient.get('/solution/types'),
    getByType: (typeId, params = {}) => apiClient.get(`/solution/by-type/${typeId}`, { params }),
    getDetails: (solutionId) => apiClient.get(`/solution/${solutionId}`),
    recordUsage: (data) => apiClient.post('/solution/usage', data),
  },

  // 用户相关
  user: {
    getStats: (userId) => apiClient.get(`/user/${userId}/stats`),
  },

  // 认证相关
  auth: {
    login: (data) => apiClient.post('/auth/login', data),
    register: (data) => apiClient.post('/auth/register', data),
  },
};

export default api;