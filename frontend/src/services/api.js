import axios from 'axios';

const API_URL = 'http://localhost:8001';

export const getHealth = () => axios.get(`${API_URL}/health`);
export const getTransactionCount = () => axios.get(`${API_URL}/transactions/count`);
export const getTransactions = () => axios.get(`${API_URL}/transactions`);
export const createTransaction = (data) => axios.post(`${API_URL}/transactions`, data);
export const checkCompliance = () => axios.post(`${API_URL}/compliance/check`);
export const simulateTraffic = () => axios.post(`${API_URL}/simulate/traffic`);
export const getComplianceEvents = () => axios.get(`${API_URL}/compliance/events`);
export const getRegulations = () => axios.get(`${API_URL}/regulations`);
export const ingestPolicy = (text) => axios.post(`${API_URL}/regulations/ingest`, { text });
export const uploadPolicyFile = (formData) => axios.post(`${API_URL}/regulations/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteRegulation = (id) => axios.delete(`${API_URL}/regulations/${id}`);
export const resetData = () => axios.delete(`${API_URL}/reset`);
export const saveAuditReport = (data) => axios.post(`${API_URL}/audit/save`, data);
export const getAuditHistory = () => axios.get(`${API_URL}/audit/history`);
