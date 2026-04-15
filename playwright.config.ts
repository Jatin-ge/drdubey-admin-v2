import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'https://admin.drdubay.in',
    headless: true,
  },
})
