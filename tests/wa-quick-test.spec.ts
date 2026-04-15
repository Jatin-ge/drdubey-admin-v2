import { test } from '@playwright/test'

test('Quick authenticated API test', async ({ page }) => {
  // Login
  await page.goto('https://admin.drdubay.in/sign-in', { waitUntil: 'networkidle', timeout: 30000 })

  // Check what's on the sign-in page
  const pageTitle = await page.title()
  console.log('Page title:', pageTitle)
  console.log('Current URL:', page.url())

  // Try to fill login
  const inputs = await page.locator('input').all()
  console.log('Number of inputs found:', inputs.length)

  for (const input of inputs) {
    const type = await input.getAttribute('type')
    const placeholder = await input.getAttribute('placeholder')
    console.log(`  Input: type=${type}, placeholder=${placeholder}`)
  }

  if (inputs.length >= 2) {
    await inputs[0].fill('dheeraj23july@gmail.com')
    await inputs[1].fill('Dubay&127')

    const submitBtn = page.locator('button[type="submit"]')
    console.log('Submit button visible:', await submitBtn.isVisible())
    await submitBtn.click()

    // Wait for navigation
    try {
      await page.waitForURL('**/admin**', { timeout: 10000 })
      console.log('After login URL:', page.url())

      // Now test API from authenticated context
      const result = await page.evaluate(async () => {
        try {
          const res = await fetch('/api/whatsapp/test')
          const contentType = res.headers.get('content-type')
          const text = await res.text()
          return {
            status: res.status,
            contentType,
            isJson: contentType?.includes('json'),
            bodyPreview: text.substring(0, 500)
          }
        } catch (e: any) {
          return { error: e.message }
        }
      })

      console.log('\n=== /api/whatsapp/test result ===')
      console.log(JSON.stringify(result, null, 2))

    } catch (e) {
      console.log('Login failed or redirect timeout')
      console.log('Current URL:', page.url())
      await page.screenshot({ path: '/tmp/login-failed.png' })
    }
  }
})
