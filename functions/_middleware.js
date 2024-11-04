export async function onRequest({ request, env, next }) {
  // 处理 API 请求
  if (request.url.includes('/api/')) {
    const workerUrl = new URL(request.url)
    workerUrl.hostname = env.WORKER_HOSTNAME || `${env.WORKER_NAME}.workers.dev`
    return fetch(workerUrl.toString(), request)
  }
  
  // 继续处理页面请求
  return next()
} 