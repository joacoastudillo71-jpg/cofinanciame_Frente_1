import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { units } from '../../shared/schema';

export const unitsRouter = Router();

// Endpoint: PATCH /api/units/:id/status
unitsRouter.patch('/:id/status', async (req, res) => {
  try {
    const unitId = parseInt(req.params.id, 10);
    const { status, price } = req.body;

    if (isNaN(unitId)) return res.status(400).json({ error: 'ID de unidad inválido' });

    if (!['Disponible', 'Reservado', 'Vendido'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const updatePayload: Partial<typeof units.$inferInsert> = { status };

    if (price !== undefined && price !== '') {
      const parsedPrice = parseInt(price, 10);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'El precio debe ser un número entero mayor o igual a 0' });
      }
      updatePayload.price = parsedPrice;
    } else if (price === '') {
      updatePayload.price = null;
    }

    const [updatedUnit] = await db.update(units)
      .set(updatePayload)
      .where(eq(units.id, unitId))
      .returning();

    if (!updatedUnit) return res.status(404).json({ error: 'Unidad no encontrada' });

    return res.json(updatedUnit);
  } catch (error) {
    console.error('Error al actualizar unidad:', error);
    return res.status(500).json({ error: 'Error al actualizar base de datos' });
  }
});

// Endpoint: POST /api/units (Fase 4 - Ensamblador de Datos)
unitsRouter.post('/', async (req, res) => {
  try {
    const {
      projectId, svgId: identifier, name: label, price, area, rooms, bathrooms, status,
      habitableArea, terraceArea, parkingCount, parkingArea, storageCount, storageArea, isDuplex, duplexLevel
    } = req.body;

    const [newUnit] = await db.insert(units).values({
      projectId: parseInt(projectId),
      identifier,
      label,
      status: status || 'Disponible',
      price: price ? parseInt(price.toString(), 10) : null,
      area: area ? parseInt(area.toString(), 10) : null,
      rooms: rooms ? parseInt(rooms) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      habitableArea: habitableArea ? parseFloat(habitableArea) : null,
      terraceArea: terraceArea ? parseFloat(terraceArea) : null,
      parkingCount: parkingCount ? parseInt(parkingCount) : null,
      parkingArea: parkingArea ? parseFloat(parkingArea) : null,
      storageCount: storageCount ? parseInt(storageCount) : null,
      storageArea: storageArea ? parseFloat(storageArea) : null,
      isDuplex: isDuplex === true || isDuplex === 'true' || false,
      duplexLevel: isDuplex ? (duplexLevel || null) : null,
    }).returning();

    return res.status(201).json(newUnit);
  } catch (error) {
    console.error('Error en Ensamblador de Datos (Crear Unidad):', error);
    return res.status(500).json({ error: 'Error al insertar la unidad en base de datos' });
  }
});
