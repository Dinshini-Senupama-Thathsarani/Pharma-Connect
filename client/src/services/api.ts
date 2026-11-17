import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const api = axios.create({ baseURL });

export const storage = {
  get access() { return localStorage.getItem('accessToken'); },
  get refresh() { return localStorage.getItem('refreshToken'); },
  save(access: string, refresh: string) {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  },
  clear() {
    ['accessToken', 'refreshToken', 'user'].forEach((k) => localStorage.removeItem(k));
  },
};

api.interceptors.request.use((config) => {
  if (storage.access) config.headers.Authorization = `Bearer ${storage.access}`;
  return config;
});

// When the access token expires (401) try ONE refresh, then replay the failed request.
// Concurrent 401s share the same refresh promise so we never refresh twice.
let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthCall = original?.url?.includes('/auth/');
    if (error.response?.status !== 401 || !original || original._retry || isAuthCall || !storage.refresh) {
      return Promise.reject(error);
    }
    original._retry = true;
    try {
      refreshing ??= axios
        .post(`${baseURL}/auth/refresh`, { refreshToken: storage.refresh })
        .then((r) => {
          storage.save(r.data.data.accessToken, r.data.data.refreshToken);
          return r.data.data.accessToken as string;
        })
        .finally(() => { refreshing = null; });
      const token = await refreshing;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (e) {
      storage.clear();
      window.location.href = '/login';
      return Promise.reject(e);
    }
  }
);

export const errMsg = (e: unknown): string => {
  const err = e as AxiosError<{ message?: string }>;
  return err.response?.data?.message || err.message || 'Something went wrong';
};
