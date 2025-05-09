import axios, { AxiosRequestConfig, Method } from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const wawiClient = {
  async get<T>(url: string, sessionToken: string): Promise<T> {
    return wawiClient.request<T>(url, 'GET', sessionToken);
  },

  async post<T>(url: string, sessionToken: string, body?: any): Promise<T> {
    return wawiClient.request<T>(url, 'POST', sessionToken, body);
  },

  async patch<T>(url: string, sessionToken: string, body?: any): Promise<T> {
    return wawiClient.request<T>(url, 'PATCH', sessionToken, body);
  },

  async delete<T>(url: string, sessionToken: string): Promise<T> {
    return wawiClient.request<T>(url, 'DELETE', sessionToken);
  },

  async request<T>(url: string, method: Method, sessionToken: string, body?: any): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    const config: AxiosRequestConfig = {
      url: fullUrl,
      method,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
      data: body,
    };

    try {
      const response = await axios.request<T>(config);
      return response.data;
    } catch (error: any) {
      const status = error.response?.status ?? 'Unknown';
      const message = error.response?.data ?? error.message;
      console.error(`[wawiClient] HTTP ${status}:`, message);
      throw new Error(`HTTP ${status}: ${JSON.stringify(message)}`);
    }
  }
};
