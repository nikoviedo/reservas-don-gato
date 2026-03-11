import type { WhatsappSettings } from "@/lib/types";

async function sendTemplate(
  settings: WhatsappSettings,
  to: string,
  templateName: string,
  lang: string,
  buttonUrl?: string
) {
  const components = buttonUrl
    ? [{ type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: buttonUrl }] }]
    : undefined;

  return fetch(`https://graph.facebook.com/v20.0/${settings.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: lang },
        ...(components ? { components } : {})
      }
    })
  });
}

async function sendText(settings: WhatsappSettings, to: string, body: string) {
  return fetch(`https://graph.facebook.com/v20.0/${settings.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    })
  });
}

export async function notifyWhatsapp(params: {
  settings: WhatsappSettings;
  staffMessage: string;
  customerPhone?: string;
  customerMessage: string;
  confirmUrl: string;
}) {
  const { settings } = params;
  if (!settings.phoneNumberId || !settings.accessToken) return { ok: false, error: "whatsapp_not_configured" };

  try {
    if (settings.staffTo) {
      if (settings.staffTemplateName) {
        await sendTemplate(settings, settings.staffTo, settings.staffTemplateName, settings.staffTemplateLang ?? "es_AR");
      } else {
        await sendText(settings, settings.staffTo, params.staffMessage);
      }
    }

    if (params.customerPhone) {
      if (settings.customerTemplateName) {
        await sendTemplate(
          settings,
          params.customerPhone,
          settings.customerTemplateName,
          settings.customerTemplateLang ?? "es_AR",
          params.confirmUrl
        );
      } else {
        await sendText(settings, params.customerPhone, `${params.customerMessage}\nConfirmar: ${params.confirmUrl}`);
      }
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
