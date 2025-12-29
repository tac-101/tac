import { z } from 'zod'

const envSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  
  // WhatsApp Integration (Optional)
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  
  // Twilio Integration (Optional)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // Sentry Configuration (Optional)
  SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  
  // Upstash Redis (Optional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // OpenRouter AI (Optional)
  OPENROUTER_API_KEY: z.string().optional(),
  
  // Perplexity AI (Optional)
  PERPLEXITY_API_KEY: z.string().optional(),
  
  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXTAUTH_SECRET: z.string().min(1, 'NextAuth secret is required'),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Test Environment Variables
  TEST_ADMIN_EMAIL: z.string().email().optional(),
  TEST_ADMIN_PASSWORD: z.string().optional(),
  TEST_BASE_URL: z.string().url().optional(),
})

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      throw new Error(`❌ Invalid environment variables:\n${missingVars}`)
    }
    throw error
  }
}

// Export validated environment
export const env = validateEnv()

// Type for the validated environment
export type Env = z.infer<typeof envSchema>

// Helper function to check if required integrations are configured
export const integrations = {
  whatsapp: {
    enabled: !!(env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID),
    config: {
      accessToken: env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
      verifyToken: env.WHATSAPP_VERIFY_TOKEN,
    }
  },
  twilio: {
    enabled: !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN),
    config: {
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      phoneNumber: env.TWILIO_PHONE_NUMBER,
    }
  },
  sentry: {
    enabled: !!env.SENTRY_DSN,
    config: {
      dsn: env.SENTRY_DSN,
      org: env.SENTRY_ORG,
      project: env.SENTRY_PROJECT,
      authToken: env.SENTRY_AUTH_TOKEN,
    }
  },
  redis: {
    enabled: !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
    config: {
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    }
  },
  ai: {
    openrouter: {
      enabled: !!env.OPENROUTER_API_KEY,
      config: { apiKey: env.OPENROUTER_API_KEY }
    },
    perplexity: {
      enabled: !!env.PERPLEXITY_API_KEY,
      config: { apiKey: env.PERPLEXITY_API_KEY }
    }
  }
}

// Development helper to log integration status
if (env.NODE_ENV === 'development') {
  console.log('🔧 TAC Environment Configuration:')
  console.log(`  • Supabase: ✅ Configured`)
  console.log(`  • WhatsApp: ${integrations.whatsapp.enabled ? '✅' : '❌'} ${integrations.whatsapp.enabled ? 'Enabled' : 'Disabled'}`)
  console.log(`  • Twilio: ${integrations.twilio.enabled ? '✅' : '❌'} ${integrations.twilio.enabled ? 'Enabled' : 'Disabled'}`)
  console.log(`  • Sentry: ${integrations.sentry.enabled ? '✅' : '❌'} ${integrations.sentry.enabled ? 'Enabled' : 'Disabled'}`)
  console.log(`  • Redis: ${integrations.redis.enabled ? '✅' : '❌'} ${integrations.redis.enabled ? 'Enabled' : 'Disabled'}`)
  console.log(`  • AI Services: ${integrations.ai.openrouter.enabled || integrations.ai.perplexity.enabled ? '✅' : '❌'} ${integrations.ai.openrouter.enabled || integrations.ai.perplexity.enabled ? 'Enabled' : 'Disabled'}`)
}
