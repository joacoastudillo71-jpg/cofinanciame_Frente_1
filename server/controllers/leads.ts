import { Router } from 'express';
import { KommoCRMAdapter } from '../services/crm/kommoAdapter';
import { CRMService } from '../services/crm/crm.interface';

export const leadsRouter = Router();

// Instanciamos el adaptador
const crmService: CRMService = new KommoCRMAdapter();

// Endpoint: POST /api/leads
leadsRouter.post('/', async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !payload.lead || !payload.context) {
      return res.status(400).json({ error: 'Payload estructurado incorrectamente' });
    }

    const success = await crmService.sendLead(payload);

    if (success) {
      return res.status(200).json({ message: 'Lead procesado correctamente en el CRM' });
    } else {
      return res.status(502).json({ error: 'Error del CRM al procesar el lead' });
    }
  } catch (error) {
    console.error('[API Leads] Error en el servidor:', error);
    return res.status(500).json({ error: 'Error interno del servidor al procesar el webhook' });
  }
});
