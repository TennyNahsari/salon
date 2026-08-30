import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Interceptor to add JWT token if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getServices = async () => {
  const res = await api.get('/services');
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

export const createBooking = async (data) => {
  const res = await api.post('/bookings', data);
  return res.data;
};

export const checkBookingStatus = async (phone, code) => {
  const res = await api.get('/bookings/check', { params: { phone, code } });
  return res.data;
};

export const uploadPaymentProof = async (formData) => {
  const res = await api.post('/bookings/upload-proof', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getAllBookings = async (status = 'All', date = '') => {
  const res = await api.get('/bookings', { params: { status, date } });
  return res.data;
};

export const refreshBookings = async (status = 'All', date = '') => {
  const res = await api.post('/bookings/refresh', null, { params: { status, date } });
  return res.data;
};

export const updateBookingStatus = async (id, status, notes) => {
  const res = await api.patch(`/bookings/${id}/status`, { status, notes });
  return res.data;
};

export const createManualBooking = async (data) => {
  const res = await api.post('/bookings/manual', data);
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await api.delete(`/bookings/${id}`);
  return res.data;
};

export const getConfigs = async () => {
  const res = await api.get('/configs');
  return res.data;
};

export const updateConfigs = async (formData) => {
  const res = await api.put('/configs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const adminLogin = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
};

export const getAdminMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const getAllStaff = async () => {
  const res = await api.get('/staff');
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

export default api;
