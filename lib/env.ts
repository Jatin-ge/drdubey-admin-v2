const required = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
] as const

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[ENV] Missing required environment variable: ${key}`)
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID || '',
  WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN || '',
  WHATSAPP_WABA_ID: process.env.WHATSAPP_WABA_ID || '',
}
