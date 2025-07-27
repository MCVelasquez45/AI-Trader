// ✅ File: src/api/axiosInstance.ts

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

// 🌐 Dynamically select base URL: use localhost in dev, env var in prod
const API_BASE = import.meta.env.DEV
  ? (import.meta.env.VITE_DEV_API_URL || 'http://localhost:4545').trim()
  : (import.meta.env.VITE_API_URL || '').trim();

// 💡 Log which server URL we’ll use (dev or prod)
console.log('🌐 [axiosInstance] Running in', import.meta.env.DEV ? 'development' : 'production');
console.log('🌐 [axiosInstance] Base URL:', API_BASE);

// 🔁 Create Axios instance with session (cookie) support
export const axiosInstance = axios.create({
  baseURL: API_BASE,               // e.g., http://localhost:4545 or https://...onrender.com
  withCredentials: true,           // 🔐 Send cookies for Passport sessions
  headers: {
    'Content-Type': 'application/json',
  },
});

// ———————————————
// 📡 REQUEST INTERCEPTOR: logs and timestamps every request
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] 🚀 [Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    // attach timestamp for measuring duration
    (config as any).metadata = { startTime: new Date().getTime() };
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ [Request Error]', error.message);
    return Promise.reject(error);
  }
);

// 📩 RESPONSE INTERCEPTOR: logs outcome & duration
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const metadata = (response.config as any).metadata;
    const duration = metadata ? Date.now() - metadata.startTime : null;
    console.log(
      `✅ [Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}` +
      (duration != null ? ` (took ${duration} ms)` : '')
    );
    return response;
  },
  (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { metadata?: any };
    const metadata = config.metadata;
    const duration = metadata ? Date.now() - metadata.startTime : null;
    const status = error.response?.status;
    console.error(
      `❗ [Response Error] ${status || '??'} ${config.method?.toUpperCase()} ${config.url}` +
      (duration != null ? ` (after ${duration} ms)` : ''),
      error.message
    );
    return Promise.reject(error);
  }
);