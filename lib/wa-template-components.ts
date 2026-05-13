// Builds the Meta WhatsApp Cloud API `components` payload for a template
// from our DB shape. Used by both create and submit-to-Meta routes so the
// HEADER / BODY / FOOTER / BUTTONS shape stays consistent.

import { parseButtonsJson, buildButtonsComponent } from './wa-template-buttons'

export type TemplateLike = {
  headerType?: string | null
  headerText?: string | null
  headerMediaUrl?: string | null
  footerText?: string | null
  buttonsJson?: string | null
}

export function buildMetaComponents(
  bodyText: string,
  template: TemplateLike,
) {
  const components: Array<Record<string, unknown>> = []

  const headerType = (template.headerType || 'NONE').toUpperCase()
  if (headerType === 'TEXT' && template.headerText?.trim()) {
    components.push({
      type: 'HEADER',
      format: 'TEXT',
      text: template.headerText.trim(),
    })
  } else if (
    ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType) &&
    template.headerMediaUrl?.trim()
  ) {
    components.push({
      type: 'HEADER',
      format: headerType,
      example: {
        header_handle: [template.headerMediaUrl.trim()],
      },
    })
  }

  components.push({
    type: 'BODY',
    text: bodyText.trim(),
  })

  if (template.footerText?.trim()) {
    components.push({
      type: 'FOOTER',
      text: template.footerText.trim(),
    })
  }

  const buttons = parseButtonsJson(template.buttonsJson)
  const buttonsComponent = buildButtonsComponent(buttons)
  if (buttonsComponent) {
    components.push(buttonsComponent)
  }

  return components
}
