import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const API_BASE = 'https://graph.facebook.com/v22.0'

function extractBody(components) {
  if (!Array.isArray(components)) return ''
  const body = components.find(c => c.type === 'BODY')
  return body?.text || ''
}

function extractVariables(text) {
  const matches = text.match(/\{\{\d+\}\}/g)
  return matches ? Array.from(new Set(matches)) : []
}

function mapLanguage(metaLang) {
  if (metaLang === 'hi' || metaLang === 'hi_IN') return 'hi'
  return 'en'
}

function mapCategory(metaCategory) {
  if (metaCategory && ['MARKETING', 'UTILITY', 'AUTHENTICATION'].includes(metaCategory)) {
    return metaCategory
  }
  return 'UTILITY'
}

function mapStatus(metaStatus, fallback) {
  if (metaStatus === 'APPROVED') return 'APPROVED'
  if (metaStatus === 'REJECTED') return 'REJECTED'
  if (metaStatus === 'PENDING') return 'PENDING'
  return fallback || 'PENDING'
}

function extractHeader(components) {
  const h = components?.find(c => c.type === 'HEADER')
  if (!h) return { headerType: 'NONE', headerMediaUrl: null, headerText: null }
  const fmt = (h.format || '').toUpperCase()
  if (fmt === 'TEXT') {
    return { headerType: 'TEXT', headerMediaUrl: null, headerText: h.text || null }
  }
  if (fmt === 'IMAGE' || fmt === 'VIDEO' || fmt === 'DOCUMENT') {
    const url = h.example?.header_handle?.[0] || null
    return { headerType: fmt, headerMediaUrl: url, headerText: null }
  }
  return { headerType: 'NONE', headerMediaUrl: null, headerText: null }
}

function extractFooter(components) {
  return components?.find(c => c.type === 'FOOTER')?.text || null
}

function extractButtonsJson(components) {
  const b = components?.find(c => c.type === 'BUTTONS')
  if (!b?.buttons || b.buttons.length === 0) return null
  return JSON.stringify(b.buttons)
}

async function main() {
  const TOKEN = process.env.WHATSAPP_API_TOKEN
  const WABA_ID = process.env.WHATSAPP_WABA_ID

  if (!TOKEN || !WABA_ID) {
    console.error('❌ Missing WHATSAPP_API_TOKEN or WHATSAPP_WABA_ID in .env')
    process.exit(1)
  }

  console.log('🔄 Fetching templates from Meta...')

  const res = await fetch(
    `${API_BASE}/${WABA_ID}/message_templates?limit=200&fields=name,status,language,category,components`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error(`❌ Meta API error (${res.status}):`, err)
    process.exit(1)
  }

  const data = await res.json()
  const metaTemplates = data.data || []
  console.log(`✅ Found ${metaTemplates.length} templates on Meta`)

  const dbTemplates = await db.whatsAppTemplate.findMany()
  const dbMetaNames = new Set(
    dbTemplates.map(t => t.metaName).filter(n => !!n)
  )
  console.log(`📦 Found ${dbTemplates.length} templates in DB (${dbMetaNames.size} linked to Meta)`)

  const metaMap = new Map()
  for (const t of metaTemplates) metaMap.set(t.name, t)

  let synced = 0
  let updated = 0
  let imported = 0

  // Update existing matched templates
  for (const tmpl of dbTemplates) {
    if (!tmpl.metaName && tmpl.metaStatus === 'DRAFT') continue

    const metaEntry = metaMap.get(tmpl.metaName || '')
    if (!metaEntry) continue

    const newStatus = mapStatus(metaEntry.status, tmpl.metaStatus)
    const isApproved = metaEntry.status === 'APPROVED'
    const header = extractHeader(metaEntry.components)
    const footerText = extractFooter(metaEntry.components)
    const buttonsJson = extractButtonsJson(metaEntry.components)

    const componentsChanged =
      header.headerType !== tmpl.headerType ||
      header.headerMediaUrl !== tmpl.headerMediaUrl ||
      header.headerText !== tmpl.headerText ||
      footerText !== tmpl.footerText ||
      buttonsJson !== tmpl.buttonsJson

    if (newStatus !== tmpl.metaStatus || isApproved !== tmpl.isApproved || componentsChanged) {
      await db.whatsAppTemplate.update({
        where: { id: tmpl.id },
        data: {
          metaStatus: newStatus,
          isApproved,
          metaError: metaEntry.status === 'REJECTED' ? 'Rejected by Meta' : null,
          headerType: header.headerType,
          headerMediaUrl: header.headerMediaUrl,
          headerText: header.headerText,
          footerText,
          buttonsJson,
        },
      })
      updated++
      console.log(`   ↻ Updated: ${tmpl.metaName} → ${newStatus}${componentsChanged ? ' (+ components)' : ''}`)
    }
    synced++
  }

  // Import new templates from Meta
  for (const meta of metaTemplates) {
    if (dbMetaNames.has(meta.name)) continue

    const bodyText = extractBody(meta.components)
    if (!bodyText) {
      console.log(`   ⊘ Skipped (no body): ${meta.name}`)
      continue
    }

    const language = mapLanguage(meta.language)
    const category = mapCategory(meta.category)
    const status = mapStatus(meta.status, 'PENDING')
    const isApproved = meta.status === 'APPROVED'
    const header = extractHeader(meta.components)
    const footerText = extractFooter(meta.components)
    const buttonsJson = extractButtonsJson(meta.components)

    await db.whatsAppTemplate.create({
      data: {
        name: meta.name,
        nameHi: null,
        category,
        language,
        bodyEn: language === 'en' ? bodyText : '',
        bodyHi: language === 'hi' ? bodyText : '',
        variables: extractVariables(bodyText),
        metaName: meta.name,
        isApproved,
        isActive: true,
        metaStatus: status,
        metaSubmittedAt: new Date(),
        headerType: header.headerType,
        headerMediaUrl: header.headerMediaUrl,
        headerText: header.headerText,
        footerText,
        buttonsJson,
      },
    })
    imported++
    console.log(`   ✚ Imported: ${meta.name} (${language}, ${status}, header=${header.headerType})`)
  }

  console.log('\n📊 Summary:')
  console.log(`   Meta templates: ${metaTemplates.length}`)
  console.log(`   DB templates:   ${dbTemplates.length}`)
  console.log(`   Synced:         ${synced}`)
  console.log(`   Updated:        ${updated}`)
  console.log(`   Imported new:   ${imported}`)

  await db.$disconnect()
}

main().catch(async (e) => {
  console.error('❌ Sync failed:', e)
  await db.$disconnect()
  process.exit(1)
})
