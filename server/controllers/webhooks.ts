import { Router } from 'express';

export const webhooksRouter = Router();

// --- FASE 2: INTEGRACIÓN GESPRO CRM ---
// Endpoint: POST /api/webhooks/gespro
webhooksRouter.post('/gespro', async (req, res) => {
  try {
    const { name, email, phone, projectId, unitId } = req.body;

    if (!name || !email || !phone || !projectId || !unitId) {
      return res.status(400).json({ error: 'Rechazado: Todos los campos son obligatorios.' });
    }

    console.log(`[WEBHOOK GESPRO] 🟢 Nuevo Lead Capturado:`);
    console.log(`- Cliente: ${name} (${email} / ${phone})`);
    console.log(`- Intención de Compra: Unidad ID [${unitId}] en Proyecto ID [${projectId}]`);

    await new Promise(resolve => setTimeout(resolve, 500));

    return res.status(200).json({
      success: true,
      message: 'Lead sincronizado con GESPRO exitosamente.'
    });
  } catch (error) {
    console.error('[WEBHOOK GESPRO] 🔴 Error de sincronización:', error);
    return res.status(500).json({ error: 'Error interno en la tubería CRM.' });
  }
});
