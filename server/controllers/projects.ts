import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { projects, units, assets } from '../../shared/schema';

export const projectsRouter = Router();

// Endpoint: GET /api/projects (Listado general con Assets integrados)
projectsRouter.get('/', async (req, res) => {
  try {
    const allProjects = await db.query.projects.findMany({
      with: { assets: true }
    });
    return res.json(allProjects);
  } catch (error) {
    console.error('Error crítico al obtener la lista de proyectos:', error);
    return res.status(500).json({ error: 'Error interno del servidor al listar proyectos' });
  }
});

// Endpoint: POST /api/projects
projectsRouter.post('/', async (req, res) => {
  try {
    const { name, description, slug, isPreview, previewMetadata } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'El nombre y slug (ubicación) son obligatorios' });
    }

    const [newProject] = await db.insert(projects).values({
      name,
      description,
      slug,
      isPreview: isPreview === true || isPreview === 'true',
      previewMetadata: previewMetadata || null,
      tenantId: 'default-tenant'
    }).returning();

    return res.status(201).json(newProject);
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    return res.status(500).json({ error: 'Error al crear el proyecto en base de datos' });
  }
});

// Endpoint Maestro: GET /api/projects/:slug
projectsRouter.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const [project] = await db.select().from(projects).where(eq(projects.slug, slug));

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado en la base de datos' });
    }

    const [projectUnits, projectAssets] = await Promise.all([
      db.select().from(units).where(eq(units.projectId, project.id)),
      db.select().from(assets).where(eq(assets.projectId, project.id))
    ]);

    const projectConfig = {
      ...project,
      units: projectUnits,
      assets: projectAssets
    };

    return res.json(projectConfig);
  } catch (error) {
    console.error('[API Maestro] Error fetching project:', error);
    return res.status(500).json({ error: 'Error interno del servidor al obtener el proyecto' });
  }
});

// Endpoint: PATCH /api/projects/:id
projectsRouter.patch('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const updateData = req.body;

    const [updatedProject] = await db.update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning();

    if (!updatedProject) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error('[API Projects] Error actualizando proyecto:', error);
    return res.status(500).json({ error: 'Error al actualizar el proyecto' });
  }
});

// Endpoint: GET /api/projects/:projectId/units
projectsRouter.get('/:projectId/units', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId)) return res.status(400).json({ error: 'ID de proyecto inválido' });

    const projectUnits = await db.select().from(units).where(eq(units.projectId, projectId));
    return res.json(projectUnits);
  } catch (error) {
    console.error('Error al obtener unidades:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});
