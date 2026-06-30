import { HttpsProxyAgent } from 'https-proxy-agent';

// 从环境变量读取代理配置
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

// 创建代理 Agent（如果配置了代理）
export const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

// 导出代理配置状态（用于调试）
export const isProxyConfigured = !!proxyAgent;
export const proxyEndpoint = proxyUrl;
