import { test } from '@playwright/test'

test('WhatsApp end-to-end via admin UI', async ({ page }) => {
  // Login
  await page.goto('https://admin.drdubay.in/sign-in', { waitUntil: 'networkidle', timeout: 30000 })

  await page.locator('input[type="text"]').first().fill('dheeraj23july@gmail.com')
  await page.locator('input[type="password"]').first().fill('Dubay&127')
  await page.locator('button[type="submit"]').click()

  // Wait for any navigation (the sign-in does router.push('/') which middleware sends to /admin)
  await page.waitForTimeout(5000)
  console.log('After login URL:', page.url())

  // Navigate to WhatsApp status page
  await page.goto('https://admin.drdubay.in/admin/whatsapp', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(3000)
  console.log('WhatsApp page URL:', page.url())

  // Check if we're on the WhatsApp page or redirected to sign-in
  const currentUrl = page.url()
  if (currentUrl.includes('sign-in')) {
    console.log('FAILED: Still on sign-in page — login did not work')
    return
  }

  // Capture page text to see connection status
  const bodyText = await page.textContent('body') || ''

  // Check for key indicators
  console.log('\n=== PAGE CONTENT ANALYSIS ===')
  console.log('Has "Connected":', bodyText.includes('Connected') || bodyText.includes('connected'))
  console.log('Has "error":', bodyText.toLowerCase().includes('error'))
  console.log('Has "Missing env":', bodyText.includes('Missing env'))
  console.log('Has "Offline":', bodyText.includes('Offline') || bodyText.includes('offline'))
  console.log('Has phone ID:', bodyText.includes('803579519496166'))
  console.log('Has verified name:', bodyText.includes('verified') || bodyText.includes('Verified'))
  console.log('Has "Send Test":', bodyText.includes('Send Test') || bodyText.includes('Test Message'))

  // Extract and print status section
  const statusEl = page.locator('text=connected').or(page.locator('text=error')).or(page.locator('text=offline')).first()
  if (await statusEl.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Status element text:', await statusEl.textContent())
  }

  await page.screenshot({ path: '/tmp/wa-final.png', fullPage: true })
  console.log('\nScreenshot saved to /tmp/wa-final.png')
})
