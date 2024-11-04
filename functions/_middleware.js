export async function onRequest({ request, next, env }) {
  // 处理 API 请求
  if (request.url.includes('/api/')) {
    // 将 API 请求转发到 Worker
    const workerUrl = new URL(request.url)
    workerUrl.hostname = env.WORKER_HOSTNAME
    return fetch(workerUrl.toString(), request)
  }
  
  // 继续处理页面请求
  return next()
} 