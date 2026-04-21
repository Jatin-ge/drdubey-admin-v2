type TemplateButton = {
  type: string
  text?: string
  url?: string
  phone_number?: string
  example?: string[]
}

export type TemplateForSend = {
  metaName: string | null
  language: string
  headerType?: string | null
  headerMediaUrl?: string | null
  headerText?: string | null
  buttonsJson?: string | null
}

export function buildTemplatePayload(
  to: string,
  template: TemplateForSend,
  bodyParameters: string[] = [],
  headerOverrideUrl?: string | null,
  headerTextParams: string[] = [],
  buttonUrlParams: Record<number, string> = {}
) {
  const langCode = template.language === 'hi' ? 'hi' : 'en_US'

  const components: any[] = []

  const headerType = (template.headerType || 'NONE').toUpperCase()
  if (headerType === 'IMAGE' || headerType === 'VIDEO' || headerType === 'DOCUMENT') {
    const link = headerOverrideUrl || template.headerMediaUrl
    if (link) {
      const mediaKey = headerType.toLowerCase()
      components.push({
        type: 'header',
        parameters: [{ type: mediaKey, [mediaKey]: { link } }],
      })
    }
  } else if (headerType === 'TEXT' && headerTextParams.length > 0) {
    components.push({
      type: 'header',
      parameters: headerTextParams.map(t => ({ type: 'text', text: t })),
    })
  }

  if (bodyParameters.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyParameters.map(p => ({ type: 'text', text: p })),
    })
  }

  if (template.buttonsJson) {
    try {
      const buttons: TemplateButton[] = JSON.parse(template.buttonsJson)
      buttons.forEach((btn, idx) => {
        const t = (btn.type || '').toUpperCase()
        if (t === 'URL' && btn.url && btn.url.includes('{{')) {
          const param = buttonUrlParams[idx]
          if (param) {
            components.push({
              type: 'button',
              sub_type: 'url',
              index: String(idx),
              parameters: [{ type: 'text', text: param }],
            })
          }
        }
      })
    } catch {}
  }

  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: template.metaName,
      language: { code: langCode },
    },
  }

  if (components.length > 0) {
    payload.template.components = components
  }

  return payload
}

export function extractHeader(components: any[] | undefined) {
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

export function extractFooter(components: any[] | undefined): string | null {
  return components?.find(c => c.type === 'FOOTER')?.text || null
}

export function extractButtonsJson(components: any[] | undefined): string | null {
  const b = components?.find(c => c.type === 'BUTTONS')
  if (!b?.buttons || b.buttons.length === 0) return null
  return JSON.stringify(b.buttons)
}
