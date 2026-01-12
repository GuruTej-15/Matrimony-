import axios from 'axios';
import { getIdToken } from './firebase.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000'
});

api.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const verifyPhone = async ({ phone, otp, idToken }) => {
  const { data } = await api.post('/api/auth/verify-phone', { phone, otp, idToken });
  return data;
};

export const fetchProfile = async () => {
  const { data } = await api.get('/api/profiles/me');
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/api/profiles/me', payload);
  return data;
};

export const searchProfiles = async (params = {}) => {
  const { data } = await api.get('/api/search', { params });
  return data;
};

export const fetchMatches = async () => {
  const { data } = await api.get('/api/matches');
  return data;
};

export const fetchPlans = async () => {
  const { data } = await api.get('/api/plans');
  return data;
};

export const fetchMessages = async (userId) => {
  const { data } = await api.get(`/api/chat/messages/${userId}`);
  return data;
};

export const sendMessage = async (userId, body) => {
  const { data } = await api.post(`/api/chat/messages/${userId}`, { body });
  return data;
};

export const health = async () => {
  const { data } = await api.get('/api/health');
  return data;
};
