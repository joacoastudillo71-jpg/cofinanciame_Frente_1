import { CRMService, LeadPayload } from './crm.interface';

export class KommoCRMAdapter implements CRMService {
  async sendLead(payload: LeadPayload): Promise<boolean> {
    console.log('--- [KommoCRMAdapter] Iniciando sincronización real de Lead hacia Kommo CRM ---');

    const domain = process.env.KOMMO_DOMAIN;
    const token = process.env.KOMMO_ACCESS_TOKEN;

    // Validación de seguridad y entorno
    if (!domain || !token) {
      console.error('[KommoCRMAdapter] Error: Faltan variables de entorno (KOMMO_DOMAIN o KOMMO_ACCESS_TOKEN).');
      return false;
    }

    // 1. Mapeo de Datos
    // Nota: Usamos payload.lead.fullName ya que es el campo definido en nuestro LeadCaptureModal
    const leadName = `Interés: ${payload.context.projectSlug} - Unidad ${payload.context.unitIdentifier}`;
    const price = payload.context.price ? Number(payload.context.price) : 0;

    // Payload para el endpoint /api/v4/leads/unsorted/forms
    // Este endpoint garantiza que el lead caiga en la bandeja "Leads Entrantes" (Unsorted)
    const kommoPayload = [
      {
        source_name: "CoFinancia.me",
        source_uid: `showcase_${payload.context.projectSlug}`,
        metadata: {
          ip: "127.0.0.1",
          form_id: "cofinancia_3d_form",
          form_name: "Cotizador Interactivo 3D",
          form_page: "https://cofinancia.me",
          form_sent_at: Math.floor(Date.now() / 1000)
        },
        _embedded: {
          leads: [
            {
              name: leadName,
              price: price,
            }
          ],
          contacts: [
            {
              first_name: payload.lead.fullName,
              custom_fields_values: [
                {
                  field_code: 'EMAIL',
                  values: [{ value: payload.lead.email }],
                },
                {
                  field_code: 'PHONE',
                  values: [{ value: payload.lead.phone }],
                },
              ],
            },
          ],
        },
      },
    ];

    const url = `https://${domain}/api/v4/leads/unsorted/forms`;

    try {
      // 2. Petición HTTP (usando fetch nativo de Node.js v18+)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(kommoPayload),
      });

      // 3. Manejo de errores de API
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Kommo API (Unsorted) rechazó la petición. Status: ${response.status}. Detalles: ${errorBody}`);
      }

      console.log(`✅ Lead "${leadName}" enviado exitosamente a la bandeja Unsorted de Kommo.`);
      console.log('--- [KommoCRMAdapter] Fin de transacción ---');

      return true;
      
    } catch (error) {
      console.error('[KommoCRMAdapter] Excepción crítica durante la comunicación con Kommo:', error);
      return false;
    }
  }
}
