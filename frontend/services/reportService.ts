import axios from 'axios';
import { config } from '@/config';
import { ReportData } from '@/types/Report';

export const reportService = {
  async createReport(reportData: ReportData, token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/report`,
      reportData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async getReportById(reportId: string, token: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/report/${reportId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async updateReport(reportId: string, data: any, token: string): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/report/${reportId}`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async moderateReport(
    reportId: string,
    action: string,
    token: string,
    additionalData?: any
  ): Promise<any> {
    const data = { action, ...additionalData };
    const response = await axios.post(
      `${config.apiUrl}/api/report/${reportId}/moderate`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
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

    const response = await axios.get(
      `${config.apiUrl}/api/report?${params.toString()}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },

  async getStats(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/report/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async clearOldReports(token: string): Promise<any> {
    const response = await axios.delete(`${config.apiUrl}/api/report/cleanup`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async clearResolvedReports(token: string): Promise<any> {
    const response = await axios.delete(
      `${config.apiUrl}/api/report/cleanup-resolved`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
