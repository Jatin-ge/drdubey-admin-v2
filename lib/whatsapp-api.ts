const WHATSAPP_API_BASE = "https://graph.facebook.com";
const API_VERSION = "v22.0";

function getToken() {
  return process.env.WHATSAPP_API_TOKEN || '';
}
function getPhoneId() {
  return process.env.WHATSAPP_PHONE_ID || '';
}
function getWabaId() {
  return process.env.WHATSAPP_WABA_ID || '';
}

interface WhatsAppTemplate {
  name: string;
  category: string;
  language: string;
  headerType?: string;
  headerContent?: string;
  bodyContent: string;
  footerContent?: string;
  buttons?: Array<{
    type: string;
    text: string;
    url?: string;
    phoneNumber?: string;
  }>;
}

export const whatsappApi = {
  async createMessageTemplate(template: WhatsAppTemplate) {
    try {
      const components = [];

      // Add Header if provided
      if (template.headerType && template.headerType !== "NONE") {
        if (template.headerType === "TEXT") {
          components.push({
            type: "HEADER",
            format: "TEXT",
            text: template.headerContent
          });
        } else {
          components.push({
            type: "HEADER",
            format: template.headerType, // IMAGE, VIDEO, DOCUMENT
            example: {
              header_handle: [template.headerContent] // Must be a valid uploaded media ID
            }
          });
        }
      }

      // Add Body (required)
      components.push({
        type: "BODY",
        text: template.bodyContent
      });

      // Add Footer if provided
      if (template.footerContent) {
        components.push({
          type: "FOOTER",
          text: template.footerContent
        });
      }

      // Add Buttons if provided
      if (template.buttons && template.buttons.length > 0) {
        components.push({
          type: "BUTTONS",
          buttons: template.buttons.map(btn => {
            const baseButton = {
              text: btn.text.substring(0, 25) // Max 25 chars
            };

            switch (btn.type) {
              case 'QUICK_REPLY':
                return {
                  ...baseButton,
                  type: 'QUICK_REPLY'
                };
              case 'URL':
                return {
                  ...baseButton,
                  type: 'URL',
                  url: btn.url
                };
              case 'PHONE_NUMBER':
                return {
                  ...baseButton,
                  type: 'PHONE_NUMBER',
                  phone_number: btn.phoneNumber
                };
              default:
                return null;
            }
          }).filter(Boolean)
        });
      }

      const payload = {
        name: template.name.toLowerCase().replace(/\s+/g, '_'),
        language: template.language,
        category: template.category,
        components
      };

      console.log("Creating template with payload:", JSON.stringify(payload, null, 2));

      const url = `${WHATSAPP_API_BASE}/${API_VERSION}/${getWabaId()}/message_templates`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Template creation failed:", data);
        throw new Error(data.error?.message || 'Failed to create WhatsApp template');
      }

      return data;
    } catch (error) {
      console.error("[WHATSAPP_TEMPLATE_CREATE]", error);
      throw error;
    }
  },

  async deleteMessageTemplate(name: string) {
    const url = `${WHATSAPP_API_BASE}/${API_VERSION}/${getWabaId()}/message_templates`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete WhatsApp template');
    }

    return response.json();
  },

  async uploadMedia(file: File, type: string) {
    try {
      const uploadUrl = `${WHATSAPP_API_BASE}/${API_VERSION}/${getPhoneId()}/media`;

      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('file', file);
      formData.append('type', type.toLowerCase());
      formData.append('is_reusable', 'true');

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error?.message || 'Failed to upload media');
      }

      // Poll media status until it's available (max 5 tries, 2s interval)
      const mediaId = uploadData.id;
      const verifyUrl = `${WHATSAPP_API_BASE}/${API_VERSION}/${mediaId}`;
      let attempts = 0;

      while (attempts < 5) {
        const verifyResponse = await fetch(verifyUrl, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        });

        if (verifyResponse.ok) {
          return mediaId;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }

      throw new Error("Media not yet available after upload");
    } catch (error) {
      console.error("Media upload error:", error);
      throw error;
    }
  }

};
