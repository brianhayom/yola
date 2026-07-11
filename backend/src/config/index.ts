import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // OpenAI-compatible API (same as Cline)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'yola-dev-secret-change-in-production',
    expiresIn: '7d',
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Tripay Payment Gateway
  tripay: {
    apiKey: process.env.TRIPAY_API_KEY || '',
    privateKey: process.env.TRIPAY_PRIVATE_KEY || '',
    merchantCode: process.env.TRIPAY_MERCHANT_CODE || '',
  },

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY || 'yola-encryption-key-32chars!!',

  // App URLs
  frontendUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
};