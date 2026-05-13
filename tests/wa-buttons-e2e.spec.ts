import { test, expect } from '@playwright/test'

// End-to-end test for WhatsApp template buttons + formatting. Hits the
// LOCAL dev server (running on :4521) which uses the prod Mongo + Meta
// credentials, so the test templates DO get created against the real
// WhatsApp Business Account. Each test row is deleted at the end of its
// own step — total Meta footprint is 2 creates + 2 deletes.

const ADMIN_URL = 'http://localhost:4521'
const EMAIL = 'dheeraj23july@gmail.com'
const PASSWORD = 'Dubay&127'

async function signIn(page: any) {
  await page.goto(`${ADMIN_URL}/sign-in`, { waitUntil: 'networkidle' })
  const usernameInput = page.locator('input[type="text"]').first()
  if (await usernameInput.isVisible({ timeout: 5000 })) {
    await usernameInput.fill(EMAIL)
    await page.locator('input[type="password"]').first().fill(PASSWORD)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/admin**', { timeout: 15000 })
  }
}

async function deleteById(page: any, id: string) {
  return await page.evaluate(async (templateId: string) => {
    const res = await fetch(`/api/wa-templates/${templateId}`, {
      method: 'DELETE',
    })
    return { status: res.status, body: await res.text() }
  }, id)
}

test('WA template buttons: create QUICK_REPLY-only, then delete', async ({ page }) => {
  test.setTimeout(120000)
  await signIn(page)

  const stamp = Date.now()
  const payload = {
    metaName: `_test_buttons_qr_${stamp}`,
    name: `Test QR ${stamp}`,
    nameHi: null,
    category: 'UTILITY',
    language: 'en',
    bodyEn: 'Hello {{1}}, do you want to book your appointment?',
    bodyHi: '',
    headerType: 'NONE',
    headerText: '',
    headerMediaUrl: '',
    footerText: 'Dr. Dheeraj Dubay Clinic',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Yes, book me' },
      { type: 'QUICK_REPLY', text: 'Maybe later' },
    ],
    skipMetaSubmit: false,
    isActive: true,
  }

  const created = await page.evaluate(async (body: any) => {
    const res = await fetch('/api/wa-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return { status: res.status, body: await res.json() }
  }, payload)

  console.log('TEST 1 — QR-only — POST status:', created.status)
  console.log('TEST 1 — DB row metaStatus:', created.body.metaStatus, '| metaError:', created.body.metaError)
  expect(created.status).toBe(200)
  // Meta should either accept (PENDING) or reject with a clear reason (REJECTED).
  // 'DRAFT' would mean Meta env vars missing — which would be a setup bug.
  expect(['PENDING', 'REJECTED']).toContain(created.body.metaStatus)
  expect(created.body.buttonsJson).toContain('QUICK_REPLY')

  const del = await deleteById(page, created.body.id)
  console.log('TEST 1 — cleanup DELETE status:', del.status)
  expect(del.status).toBe(200)
})

test('WA template buttons: create mixed CTA (URL + PHONE + bold body), then delete', async ({ page }) => {
  test.setTimeout(120000)
  await signIn(page)

  const stamp = Date.now()
  const payload = {
    metaName: `_test_buttons_mixed_${stamp}`,
    name: `Test Mixed ${stamp}`,
    nameHi: null,
    category: 'UTILITY',
    language: 'en',
    bodyEn: 'Confirm your appointment with *Dr. Dubay*. _Reply YES to confirm._',
    bodyHi: '',
    headerType: 'NONE',
    headerText: '',
    headerMediaUrl: '',
    footerText: 'Dr. Dheeraj Dubay Clinic',
    buttons: [
      { type: 'URL', text: 'Book Online', url: 'https://www.drdubay.in/booking/jaipur' },
      { type: 'PHONE_NUMBER', text: 'Call Clinic', phone_number: '+918955373205' },
    ],
    skipMetaSubmit: false,
    isActive: true,
  }

  const created = await page.evaluate(async (body: any) => {
    const res = await fetch('/api/wa-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return { status: res.status, body: await res.json() }
  }, payload)

  console.log('TEST 2 — mixed CTA — POST status:', created.status)
  console.log('TEST 2 — DB row metaStatus:', created.body.metaStatus, '| metaError:', created.body.metaError)
  console.log('TEST 2 — buttonsJson:', created.body.buttonsJson)
  expect(created.status).toBe(200)
  expect(['PENDING', 'REJECTED']).toContain(created.body.metaStatus)
  expect(created.body.buttonsJson).toContain('URL')
  expect(created.body.buttonsJson).toContain('PHONE_NUMBER')
  expect(created.body.buttonsJson).toContain('+918955373205')

  const del = await deleteById(page, created.body.id)
  console.log('TEST 2 — cleanup DELETE status:', del.status)
  expect(del.status).toBe(200)
})

test('WA template buttons: skipMetaSubmit saves as DRAFT (zero Meta calls)', async ({ page }) => {
  test.setTimeout(60000)
  await signIn(page)

  const stamp = Date.now()
  const payload = {
    metaName: `_test_buttons_draft_${stamp}`,
    name: `Test Draft ${stamp}`,
    nameHi: null,
    category: 'UTILITY',
    language: 'en',
    bodyEn: 'Draft test {{1}}',
    bodyHi: '',
    headerType: 'NONE',
    headerText: '',
    headerMediaUrl: '',
    footerText: '',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Yes' },
    ],
    skipMetaSubmit: true,
    isActive: true,
  }

  const created = await page.evaluate(async (body: any) => {
    const res = await fetch('/api/wa-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return { status: res.status, body: await res.json() }
  }, payload)

  console.log('TEST 3 — draft — POST status:', created.status, '| metaStatus:', created.body.metaStatus)
  expect(created.status).toBe(200)
  // The whole point: when skipMetaSubmit is true, Meta is never contacted.
  expect(created.body.metaStatus).toBe('DRAFT')
  expect(created.body.buttonsJson).toContain('QUICK_REPLY')

  // Cleanup (DB only — no Meta hit since the row never went to Meta)
  const del = await deleteById(page, created.body.id)
  console.log('TEST 3 — cleanup DELETE status:', del.status)
  expect(del.status).toBe(200)
})

test('WA template buttons: validation rejects invalid input', async ({ page }) => {
  await signIn(page)

  // Try to create with a URL button that has no URL
  const r = await page.evaluate(async () => {
    const res = await fetch('/api/wa-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metaName: 'should_never_reach_meta_invalid',
        name: 'X',
        category: 'UTILITY',
        language: 'en',
        bodyEn: 'x',
        buttons: [{ type: 'URL', text: 'Click' }],  // missing url
        skipMetaSubmit: true,
      }),
    })
    return { status: res.status, body: await res.json() }
  })

  console.log('TEST 4 — validation — status:', r.status, '| error:', r.body.error)
  expect(r.status).toBe(400)
  expect(r.body.error).toContain('URL is required')
})
