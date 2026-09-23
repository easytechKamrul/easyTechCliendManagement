import { IEntry } from '../models/Entry';

type NotificationEvent = 'created' | 'updated' | 'payment_received';

const phoneForWhatsApp = (phone: string) => phone.replace(/[^0-9]/g, '');

/**
 * Sends a client notification through the official Meta WhatsApp Cloud API using professional dynamic variables.
 */
export async function sendWhatsAppNotification(
  entry: IEntry,
  event: NotificationEvent,
  paymentAmount?: number
) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = phoneForWhatsApp(entry.phone || '');

  if (!entry.phone || !token || !phoneNumberId) {
    console.info('[whatsapp] Not sent: client phone number or WhatsApp configuration is missing.');
    return;
  }

  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  if (!templateName) {
    console.error('[whatsapp] Send failed: WHATSAPP_TEMPLATE_NAME is missing in environment variables.');
    return;
  }

  const totalReceived = entry.advance + entry.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingDue = Math.max(0, entry.deal - totalReceived);

  // Email-er design-er sathe mil rekhe variable mapping:
  // {{1}} -> client name
  // {{2}} -> status
  // {{3}} -> service name
  // {{4}} -> total deal amount
  // {{5}} -> remaining due amount
  const variableValues = [
    entry.client,                          // {{1}}
    entry.status,                          // {{2}}
    entry.service || 'Not set',            // {{3}}
    entry.deal,                            // {{4}}
    remainingDue                           // {{5}}
  ];

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US' },
      components: [
        {
          type: 'body',
          parameters: variableValues.map((val) => ({
            type: 'text',
            text: String(val)
          }))
        }
      ]
    }
  };

  try {
    const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || 'v22.0';
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`[whatsapp] Send failed for ${to}: ${await response.text()}`);
      return;
    }

    console.log(`[whatsapp] Notification sent to ${to}`);
  } catch (error) {
    console.error('[whatsapp] Send failed:', error);
  }
}