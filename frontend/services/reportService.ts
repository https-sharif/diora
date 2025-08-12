import axios from 'axios';
import { API_URL } from '@/constants/api';
import { ReportData } from '@/types/Report';

export const reportService = {
  async createReport(reportData: ReportData, token: string): Promise<any> {
    const response = await axios.post(`${API_URL}/api/report`, reportData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getReportById(reportId: string, token: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/report/${reportId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateReport(reportId: string, data: any, token: string): Promise<any> {
    const response = await axios.put(`${API_URL}/api/report/${reportId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async moderateReport(reportId: string, action: string, token: string): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/report/${reportId}/moderate`,
      { action },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  async getReports(filters?: any, token?: string): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, String(value));
        }
      });
    }

    const response = await axios.get(`${API_URL}/api/report?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  }
};
