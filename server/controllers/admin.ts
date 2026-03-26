import { Router } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { assets, units, users } from '../../shared/schema';
import * as bcrypt from 'bcrypt';
import type { AuthRequest } from '../middleware/auth';

export const adminRouter = Router();

// Endpoint: GET /api/admin/users
adminRouter.get('/users', async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt
    }).from(users).orderBy(desc(users.createdAt));
    return res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error fetching users' });
  }
});

// Endpoint: POST /api/admin/users
adminRouter.post('/users', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'Missing required fields' });
    
    // Check if exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) return res.status(400).json({ error: 'Email already registered' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db.insert(users).values({ email, passwordHash, role }).returning({
      id: users.id, email: users.email, role: users.role
    });
    return res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Internal server error creating user' });
  }
});

// Endpoint: POST /api/admin/users/:id/reset-password
adminRouter.post('/users/:id/reset-password', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: 'Missing new password' });
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Internal server error resetting password' });
  }
});

// Endpoint: PATCH /api/admin/users/:id/role
adminRouter.patch('/users/:id/role', async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (authReq.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only SUPER_ADMIN can modify roles' });
    }

    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    if (!['ADMIN', 'EDITOR', 'VENDEDOR'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    
    if (targetUser.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot modify the role of a SUPER_ADMIN' });
    }

    const [updatedUser] = await db.update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning({ id: users.id, email: users.email, role: users.role });
      
    return res.json({ message: 'Role updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Internal server error updating role' });
  }
});

const upload = multer({ storage: multer.memoryStorage() });

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

// Endpoint: POST /api/admin/assets
adminRouter.post('/assets', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const projectId = parseInt(req.body.projectId, 10);
    const category = req.body.category || 'RenderCategory';
    const name = req.body.name || null;
    const label = req.body.label;

    if (!file || isNaN(projectId)) {
      return res.status(400).json({ error: 'File y projectId son obligatorios' });
    }

    const fileKey = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const publicDomain = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');
    const r2Url = publicDomain ? `${publicDomain}/${fileKey}` : `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${fileKey}`;

    const vrCategory = req.body.vrCategory;
    const vrEntityName = req.body.vrEntityName;
    const vrAreaName = req.body.vrAreaName;

    const geoLat = req.body.geoLat ? parseFloat(req.body.geoLat) : null;
    const geoLng = req.body.geoLng ? parseFloat(req.body.geoLng) : null;
    const geoAlt = req.body.geoAlt ? parseFloat(req.body.geoAlt) : 0;
    const geoRotation = req.body.geoRotation ? parseFloat(req.body.geoRotation) : 0;
    const geoScale = req.body.geoScale ? parseFloat(req.body.geoScale) : 1;

    const [newAsset] = await db.insert(assets).values({
      projectId,
      category,
      name,
      label: label || null,
      r2Url,
      type: file.mimetype,
      vrCategory: vrCategory || null,
      vrEntityName: vrEntityName || null,
      vrAreaName: vrAreaName || null,
      geoLat,
      geoLng,
      geoAlt,
      geoRotation,
      geoScale,
    }).returning();

    return res.status(201).json(newAsset);

  } catch (error) {
    console.error('Error en la carga de assets a R2:', error);
    return res.status(500).json({ error: 'Error interno en la tubería de subida' });
  }
});

// Endpoint: DELETE /api/admin/assets/:id
adminRouter.delete('/assets/:id', async (req, res) => {
  try {
    const assetId = parseInt(req.params.id);
    
    const [assetToDelete] = await db.select().from(assets).where(eq(assets.id, assetId));
    if (!assetToDelete) {
      return res.status(404).json({ error: 'Asset no encontrado en la base de datos' });
    }

    try {
      const fileUrl = assetToDelete.r2Url;
      if (fileUrl) {
         const fileKey = fileUrl.split('/').pop();
         if (fileKey) {
           await s3Client.send(new DeleteObjectCommand({
             Bucket: process.env.R2_BUCKET_NAME,
             Key: fileKey,
           }));
         }
      }
    } catch (s3Error) {
      console.error('[R2] Error eliminando archivo físico:', s3Error);
    }

    await db.delete(assets).where(eq(assets.id, assetId));
    
    return res.status(200).json({ message: 'Asset eliminado correctamente, incluyendo de Cloudflare R2' });
  } catch (error) {
    console.error('[API Assets] Error eliminando asset:', error);
    return res.status(500).json({ error: 'Error interno del servidor al eliminar el asset' });
  }
});

// Endpoint: PATCH /api/admin/assets/:id
adminRouter.patch('/assets/:id', async (req, res) => {
  try {
    const assetId = parseInt(req.params.id);
    const updateData = { ...req.body };

    const floatFields = ['geoLat', 'geoLng', 'geoAlt', 'geoRotation', 'geoScale'] as const;
    floatFields.forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== null) {
        updateData[field] = parseFloat(updateData[field]);
      }
    });

    const [updatedAsset] = await db.update(assets)
      .set(updateData)
      .where(eq(assets.id, assetId))
      .returning();

    return res.status(200).json(updatedAsset);
  } catch (error) {
    console.error('[API Assets] Error actualizando asset:', error);
    return res.status(500).json({ error: 'Error al actualizar el asset' });
  }
});

// Endpoint: PATCH /api/admin/units/:id
adminRouter.patch('/units/:id', async (req, res) => {
  try {
    const unitId = parseInt(req.params.id);
    const rawData = req.body;

    const updateData: Partial<typeof units.$inferInsert> = {};
    const floatFields = ['area', 'bathrooms', 'price', 'habitableArea', 'terraceArea', 'parkingArea', 'storageArea'] as const;
    const intFields = ['rooms', 'parkingCount', 'projectId', 'storageCount'] as const;

    floatFields.forEach(field => {
      if (rawData[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = parseFloat(rawData[field] || 0);
      }
    });

    intFields.forEach(field => {
      if (rawData[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = parseInt(rawData[field] || 0);
      }
    });

    const finalUpdate: Partial<typeof units.$inferInsert> = {
      rooms: updateData.rooms,
      bathrooms: updateData.bathrooms,
      area: updateData.area,
      price: updateData.price,
      habitableArea: updateData.habitableArea,
      terraceArea: updateData.terraceArea,
      parkingCount: updateData.parkingCount,
      parkingArea: updateData.parkingArea,
      storageCount: updateData.storageCount,
      storageArea: updateData.storageArea,
      isDuplex: rawData.isDuplex === true || rawData.isDuplex === 'true',
      duplexLevel: rawData.duplexLevel || null,
      label: rawData.label,
      type: rawData.type,
      status: rawData.status,
    };

    const [updatedUnit] = await db.update(units)
      .set(finalUpdate)
      .where(eq(units.id, unitId))
      .returning();

    return res.status(200).json(updatedUnit);
  } catch (error) {
    console.error('[API Units] Error actualizando unidad:', error);
    return res.status(500).json({ error: 'Error al actualizar la unidad' });
  }
});

// Endpoint: DELETE /api/admin/units/:id
adminRouter.delete('/units/:id', async (req, res) => {
  try {
    const unitId = parseInt(req.params.id);

    const result = await db.delete(units).where(eq(units.id, unitId)).returning();
    if (result.length === 0) {
      return res.status(404).json({ error: 'Unidad no encontrada' });
    }

    return res.status(200).json({ message: 'Unidad eliminada correctamente' });
  } catch (error) {
    console.error('[API Units] Error eliminando unidad:', error);
    return res.status(500).json({ error: 'Error interno del servidor al eliminar la unidad' });
  }
});
