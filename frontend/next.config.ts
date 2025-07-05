import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 添加 CSP 配置以允许 Privy SDK 工作
  async headers() {
    return [
      {
        // 匹配所有路由
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.privy.io https://*.privy.io https://verify.walletconnect.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: https:;
              connect-src 'self' https://*.privy.io https://mainnet.evm.nodes.onflow.org https://eth-mainnet.g.alchemy.com https://verify.walletconnect.com wss://relay.walletconnect.com;
              frame-src https://auth.privy.io https://*.privy.io;
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ]
  },
  
  // 优化构建
  experimental: {
    optimizePackageImports: ['@privy-io/react-auth']
  },
  
  // 环境变量配置
  env: {
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  }
};

export default nextConfig;
