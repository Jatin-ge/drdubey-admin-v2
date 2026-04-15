import { test, expect } from '@playwright/test'

const ADMIN_URL = 'https://admin.drdubay.in'

test('WhatsApp API test with authenticated session', async ({ page }) => {
  // Login
  await page.goto(`${ADMIN_URL}/sign-in`, { waitUntil: 'networkidle', timeout: 30000 })
  const usernameInput = page.locator('input[type="text"]').first()
  if (await usernameInput.isVisible({ timeout: 5000 })) {
    await usernameInput.fill('dheeraj23july@gmail.com')
    await page.locator('input[type="password"]').first().fill('Dubay&127')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/admin**', { timeout: 15000 })
  }

  // Now call the WhatsApp test API with the session cookie
  const testResp = await page.evaluate(async () => {
    const res = await fetch('/api/whatsapp/test')
    const text = await res.text()
    return { status: res.status, body: text }
  })

  console.log('=== /api/whatsapp/test (authenticated) ===')
  console.log('Status:', testResp.status)
  console.log('Body:', testResp.body)

  // Also test the send endpoint structure (dry check — won't actually send)
  const sendResp = await page.evaluate(async () => {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '918955373205',
        templateName: 'hello_world',
        language: 'en_US',
        parameters: []
      })
    })
    const text = await res.text()
    return { status: res.status, body: text }
  })

  console.log('\n=== /api/whatsapp/send (authenticated) ===')
  console.log('Status:', sendResp.status)
  console.log('Body:', sendResp.body)

  // Test bulk send endpoint
  const bulkResp = await page.evaluate(async () => {
    const res = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateName: 'hello_world',
        recipients: [{ phone: '918955373205', name: 'Test' }],
        language: 'en_US'
      })
    })
    const text = await res.text()
    return { status: res.status, body: text }
  })

  console.log('\n=== /api/send-whatsapp (authenticated) ===')
  console.log('Status:', bulkResp.status)
  console.log('Body:', bulkResp.body)

  // Test templates send
  const tmplResp = await page.evaluate(async () => {
    const res = await fetch('/api/templates/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'hello_world',
        phone: '918955373205'
      })
    })
    const text = await res.text()
    return { status: res.status, body: text }
  })

  console.log('\n=== /api/templates/send-message (authenticated) ===')
  console.log('Status:', tmplResp.status)
  console.log('Body:', tmplResp.body)
})
