import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCities = async () => {
  const response = await apiClient.get('/cities');
  return response.data;
};

export const getHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const getStats = async () => {
  const response = await apiClient.get('/data/stats');
  return response.data;
};

export const getMapData = async () => {
  const response = await apiClient.get('/data/map');
  return response.data;
};

export const getHistory = async (city: string) => {
  const response = await apiClient.get(`/data/history/${city}`);
  return response.data;
};

export const getAlerts = async () => {
  const response = await apiClient.get('/alerts');
  return response.data;
};

export const getCorrelations = async () => {
  const response = await apiClient.get('/data/correlations');
  return response.data;
};

export const getCurrentWeather = async (city: string) => {
  const response = await apiClient.get(`/data/current/${city}`);
  return response.data;
};

export const predictPollution = async (data: {
  ville: string;
  temperature: number;
  vent: number;
  pluie: number;
  humidite?: number;
  radiation?: number;
}) => {
  const response = await apiClient.post('/predict', data);
  return response.data;
};

export const getForecast = async (city: string, days: number = 7) => {
  const response = await apiClient.get(`/forecast/${city}?days=${days}`);
  return response.data;
};
