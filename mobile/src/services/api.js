import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default API Base URL based on platform
const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export const API_BASE_URL = DEFAULT_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token from AsyncStorage
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Error fetching token:', err);
  }
  return config;
});

// Outlets API
export const getOutlets = async (activeOnly = false) => {
  const res = await api.get('/outlets', { params: { active_only: activeOnly } });
  return res.data;
};

export const createOutlet = async (data) => {
  const res = await api.post('/outlets', data);
  return res.data;
};

export const updateOutlet = async (id, data) => {
  const res = await api.put(`/outlets/${id}`, data);
  return res.data;
};

export const deleteOutlet = async (id) => {
  const res = await api.delete(`/outlets/${id}`);
  return res.data;
};

// Services API
export const getServices = async (outletId = null) => {
  const res = await api.get('/services', { params: { outlet_id: outletId || undefined } });
  return res.data;
};

export const createService = async (data) => {
  const res = await api.post('/services', data);
  return res.data;
};

export const updateService = async (id, data) => {
  const res = await api.put(`/services/${id}`, data);
  return res.data;
};

export const deleteService = async (id) => {
  const res = await api.delete(`/services/${id}`);
  return res.data;
};

// Staff API
export const getAllStaff = async (outletId = null) => {
  const res = await api.get('/staff', { params: { outlet_id: outletId || undefined } });
  return res.data;
};

export const createStaff = async (data) => {
  const res = await api.post('/staff', data);
  return res.data;
};

export const updateStaff = async (id, data) => {
  const res = await api.put(`/staff/${id}`, data);
  return res.data;
};

export const deleteStaff = async (id) => {
  const res = await api.delete(`/staff/${id}`);
  return res.data;
};

// Users API (Super Admin)
export const getUsers = async () => {
  const res = await api.get('/users');
  return res.data;
};

export const createUser = async (data) => {
  const res = await api.post('/users', data);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

// Configs API (WhatsApp, QRIS, Bank details)
export const getConfigs = async () => {
  const res = await api.get('/configs');
  return res.data;
};

export const updateConfigs = async (data) => {
  const res = await api.put('/configs', data);
  return res.data;
};

// Bookings API
export const createBooking = async (data) => {
  const res = await api.post('/bookings', data);
  return res.data;
};

export const createManualBooking = async (data) => {
  const res = await api.post('/bookings/manual', data);
  return res.data;
};

export const checkBookingStatus = async (phone, code) => {
  const res = await api.get('/bookings/check', { params: { phone, code } });
  return res.data;
};

export const getAllBookings = async (status = 'All', date = '', outletId = null) => {
  const res = await api.get('/bookings', { params: { status, date, outlet_id: outletId || undefined } });
  return res.data;
};

export const updateBookingStatus = async (id, status, notes = '') => {
  const res = await api.patch(`/bookings/${id}/status`, { status, notes });
  return res.data;
};

export const uploadPaymentProof = async (formData) => {
  const res = await api.post('/bookings/upload-proof', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await api.delete(`/bookings/${id}`);
  return res.data;
};

// Auth API
export const adminLogin = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
};

export const getAdminMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export default api;
