const isDev = import.meta.env.DEV;

export const API_BASE_URL = (() => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    console.error('API URL not configured!');
    return isDev ? 'http://localhost:8787' : 'https://api.shuqian112.workers.dev';
  }
  return url;
})();

// 添加调试信息
if (isDev) {
  console.log('Running in development mode');
  console.log('API URL:', API_BASE_URL);
}