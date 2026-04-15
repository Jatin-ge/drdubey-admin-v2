import { test, expect } from '@playwright/test'

const ADMIN_URL = 'https://admin.drdubay.in'
const LOGIN_EMAIL = 'dheeraj23july@gmail.com'
const LOGIN_PASS = 'Dubay&127'

test.describe('WhatsApp Debug Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto(`${ADMIN_URL}/sign-in`, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Fill login form
    const usernameInput = page.locator('input[type="text"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    
    if (await usernameInput.isVisible({ timeout: 5000 })) {
      await usernameInput.fill(LOGIN_EMAIL)
      await passwordInput.fill(LOGIN_PASS)
      await page.locator('button[type="submit"]').click()
      await page.waitForURL('**/admin**', { timeout: 15000 })
    }
  })

  test('1. WhatsApp status page loads and checks connection', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/admin/whatsapp`, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Capture the API test response
    const [testResponse] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/whatsapp/test'), { timeout: 10000 }).catch(() => null),
      page.reload({ waitUntil: 'networkidle' })
    ])
    
    if (testResponse) {
      const status = testResponse.status()
      const body = await testResponse.json().catch(() => ({}))
      console.log('=== /api/whatsapp/test ===')
      console.log('Status:', status)
      console.log('Response:', JSON.stringify(body, null, 2))
    } else {
      console.log('=== /api/whatsapp/test === NOT CALLED')
    }

    // Check page content
    const pageText = await page.textContent('body')
    console.log('Page has "Connected":', pageText?.includes('Connected') || false)
    console.log('Page has "Error":', pageText?.includes('Error') || pageText?.includes('error') || false)
    console.log('Page has "Offline":', pageText?.includes('Offline') || pageText?.includes('offline') || false)
    
    await page.screenshot({ path: '/tmp/wa-status.png', fullPage: true })
  })

  test('2. WhatsApp templates page loads', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/admin/wa-templates`, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Capture templates API response
    const responses: any[] = []
    page.on('response', async (resp) => {
      if (resp.url().includes('/api/wa-templates') || resp.url().includes('/api/templates')) {
        const body = await resp.json().catch(() => 'parse-error')
        responses.push({
          url: resp.url(),
          status: resp.status(),
          bodyPreview: JSON.stringify(body).substring(0, 300)
        })
      }
    })
    
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)
    
    console.log('=== Template API Responses ===')
    for (const r of responses) {
      console.log(`${r.status} ${r.url}`)
      console.log(r.bodyPreview)
      console.log('---')
    }
    
    await page.screenshot({ path: '/tmp/wa-templates.png', fullPage: true })
  })

  test('3. Test sending WhatsApp message via API directly', async ({ request }) => {
    // Test the /api/whatsapp/test endpoint directly
    console.log('=== Direct API Test: /api/whatsapp/test ===')
    const testResp = await request.get(`${ADMIN_URL}/api/whatsapp/test`)
    console.log('Status:', testResp.status())
    const testBody = await testResp.json().catch(() => testResp.text())
    console.log('Body:', JSON.stringify(testBody, null, 2))
    
    // Test sending a hello_world template to a known number
    console.log('\n=== Direct API Test: /api/whatsapp/send ===')
    const sendResp = await request.post(`${ADMIN_URL}/api/whatsapp/send`, {
      data: {
        phone: '918955373205',
        templateName: 'hello_world',
        languageCode: 'en_US',
        components: []
      }
    })
    console.log('Status:', sendResp.status())
    const sendBody = await sendResp.json().catch(async () => await sendResp.text())
    console.log('Body:', JSON.stringify(sendBody, null, 2))
  })

  test('4. Test bulk send API endpoint', async ({ request }) => {
    console.log('=== Direct API Test: /api/send-whatsapp ===')
    const resp = await request.post(`${ADMIN_URL}/api/send-whatsapp`, {
      data: {
        recipients: [{ phone: '918955373205' }],
        templateName: 'hello_world',
        language: 'en_US'
      }
    })
    console.log('Status:', resp.status())
    const body = await resp.json().catch(async () => await resp.text())
    console.log('Body:', JSON.stringify(body, null, 2))
  })

  test('5. Test templates/send endpoint', async ({ request }) => {
    console.log('=== Direct API Test: /api/templates/send ===')
    const resp = await request.post(`${ADMIN_URL}/api/templates/send`, {
      data: {
        templateName: 'hello_world',
        recipients: [{ phone: '918955373205' }],
        language: 'en_US'
      }
    })
    console.log('Status:', resp.status())
    const body = await resp.json().catch(async () => await resp.text())
    console.log('Body:', JSON.stringify(body, null, 2))
  })

  test('6. Patient WhatsApp button flow', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/admin/patients`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)
    
    // Find and click first patient row to go to profile
    const firstPatientLink = page.locator('a[href*="/admin/patients/"]').first()
    if (await firstPatientLink.isVisible({ timeout: 5000 })) {
      await firstPatientLink.click()
      await page.waitForLoadState('networkidle', { timeout: 15000 })
      
      // Look for WhatsApp button
      const waButton = page.locator('text=WhatsApp').first()
      const waButtonVisible = await waButton.isVisible({ timeout: 5000 }).catch(() => false)
      console.log('WhatsApp button visible on patient profile:', waButtonVisible)
      
      if (waButtonVisible) {
        await page.screenshot({ path: '/tmp/wa-patient.png', fullPage: true })
      }
    } else {
      console.log('No patient links found on patients page')
      await page.screenshot({ path: '/tmp/wa-patients-list.png', fullPage: true })
    }
  })
})
