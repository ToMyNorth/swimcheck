import { proxyAgent } from './lib/proxy-agent';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 仅在 Node.js 运行时生效
    if (proxyAgent) {
      console.log(`[Proxy] Using HTTPS proxy: ${process.env.HTTPS_PROXY}`);
      
      // 使用 undici 的 setGlobalDispatcher 设置全局代理
      try {
        const { setGlobalDispatcher, Agent } = await import('undici');
        
        // 创建支持代理的 Dispatcher
        const proxyDispatcher = new Agent({
          connect: {
            // 使用 HttpsProxyAgent 作为连接代理
            createConnection: (opts: any, oncreate: any) => {
              return (proxyAgent as any).connect(opts, oncreate);
            },
          },
        });
        
        setGlobalDispatcher(proxyDispatcher);
        console.log('[Proxy] Global dispatcher set successfully');
      } catch (error) {
        console.error('[Proxy] Failed to set global dispatcher:', error);
        
        // Fallback: patch global fetch
        const originalFetch = global.fetch;
        global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
          const urlString = typeof input === 'string' ? input : input.toString();
          
          if (urlString.startsWith('https://') && !urlString.includes('localhost')) {
            console.log(`[Proxy] Routing through proxy: ${urlString}`);
            
            const newInit: RequestInit & { dispatcher?: any } = {
              ...init,
              dispatcher: proxyAgent,
            };
            
            return originalFetch(input, newInit);
          }
          
          return originalFetch(input, init);
        };
      }
    } else {
      console.log('[Proxy] No proxy configured');
    }
  }
}
