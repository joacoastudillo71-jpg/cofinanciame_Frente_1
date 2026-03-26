// Ruta: shared/schema.ts
import { pgTable, serial, text, varchar, timestamp, integer, real, doublePrecision, index, pgPolicy, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Tabla Principal: Proyectos
export const projects = pgTable('projects', {
    id: serial('id').primaryKey(),
    tenantId: varchar('tenant_id').notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
    // --- Módulo Preview (Venta en Planos) ---
    isPreview: boolean('is_preview').default(false).notNull(),
    previewMetadata: jsonb('preview_metadata').$type<{
        totalFloors?: number;
        unitTypes?: string[]; // Ej: ['Suites', 'Monoambientes', 'Locales']
        expectedLaunchDate?: string;
        threeDModelUrl?: string; // Para el .glb en el mapa
        // --- Fase 4: Landing Page Copy (Personalización) ---
        heroSubtitle?: string;
        section1Title?: string;
        section1Desc?: string;
        locationTitle?: string;
        locationDesc?: string;
        ctaTitle?: string;
        ctaDesc?: string;
        ctaButtonText?: string;
    }>(),
}, (table) => [
    pgPolicy('tenant_isolation', {
        as: 'permissive',
        for: 'all',
        to: 'public',
        using: sql`((SELECT auth.uid()) = tenant_id)`
    })
]);

// Tabla: Unidades (FloorUnit) con control de estados
export const units = pgTable('units', {
    id: serial('id').primaryKey(),
    projectId: integer('project_id').references(() => projects.id).notNull(),
    identifier: varchar('identifier', { length: 50 }).notNull(),
    label: varchar('label', { length: 255 }),
    type: varchar('type', { length: 50 }).default('commercial'),
    status: varchar('status', { length: 20 }).default('Disponible'),
    area: real('area'),
    rooms: integer('bedrooms'),
    bathrooms: real('bathrooms'),
    price: real('price'),
    // --- Nuevas columnas para Información Premium (Fase 4) ---
    habitableArea: real('habitable_area'),
    terraceArea: real('terrace_area'),
    parkingCount: integer('parking_count'),
    parkingArea: real('parking_area'),
    // --- Nuevas columnas (Penthouse Dúplex & Bodegas) ---
    storageCount: integer('storage_count'),
    storageArea: real('storage_area'),
    isDuplex: boolean('is_duplex').default(false),
    duplexLevel: varchar('duplex_level', { length: 20 }), // 'inferior' o 'superior'
}, (table) => [
    index('unit_project_id_idx').on(table.projectId),
    pgPolicy('tenant_isolation_units', {
        as: 'permissive',
        for: 'all',
        to: 'public',
        using: sql`EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.tenant_id = (SELECT auth.uid()))`
    })
]);

// Tabla: Assets (Renders, Planos SVG)
export const assets = pgTable('assets', {
    id: serial('id').primaryKey(),
    projectId: integer('project_id').references(() => projects.id).notNull(),
    category: varchar('category', { length: 50 }),
    name: varchar('name', { length: 255 }),
    label: varchar('label', { length: 255 }),
    r2Url: varchar('r2_url', { length: 500 }).notNull(),
    type: varchar('type', { length: 50 }),
    // --- NUEVAS COLUMNAS: JERARQUÍA VISTAS 360° (Fase 6) ---
    vrCategory: varchar('vr_category', { length: 100 }),
    vrEntityName: varchar('vr_entity_name', { length: 100 }),
    vrAreaName: varchar('vr_area_name', { length: 100 }),
    // --- NUEVAS COLUMNAS: MÓDULO DE UBICACIÓN (MAPA 3D - Fase 7) ---
    geoLat: doublePrecision('geo_lat'),                      // Latitud
    geoLng: doublePrecision('geo_lng'),                      // Longitud
    geoAlt: doublePrecision('geo_alt').default(0),           // Altitud en metros
    geoRotation: doublePrecision('geo_rotation').default(0), // Rotación/Heading en grados
    geoScale: doublePrecision('geo_scale').default(1),       // Escala del modelo 3D
    metadata: jsonb('metadata').$type<{
        cameraViews?: {
            ciudad?: { zoom?: number; tilt?: number; heading?: number };
            sector?: { zoom?: number; tilt?: number; heading?: number };
            barrio?: { zoom?: number; tilt?: number; heading?: number };
        };
    }>().default({}),
}, (table) => [
    index('asset_project_id_idx').on(table.projectId),
    pgPolicy('tenant_isolation_assets', {
        as: 'permissive',
        for: 'all',
        to: 'public',
        using: sql`EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.tenant_id = (SELECT auth.uid()))`
    })
]);

export const projectRelations = relations(projects, ({ many }) => ({
    assets: many(assets),
    units: many(units),
}));
export const assetRelations = relations(assets, ({ one }) => ({
    project: one(projects, { fields: [assets.projectId], references: [projects.id] }),
}));
export const unitRelations = relations(units, ({ one }) => ({
    project: one(projects, { fields: [units.projectId], references: [projects.id] }),
}));

// --- ESQUEMAS DE VALIDACIÓN (ZOD) ---
export const insertUnitSchema = createInsertSchema(units);
export const selectUnitSchema = createSelectSchema(units);
export const patchUnitSchema = insertUnitSchema.partial().extend({
    label: z.string().optional(),
    type: z.string().optional(),
    storageCount: z.number().int().optional().nullable(),
    storageArea: z.number().optional().nullable(),
    isDuplex: z.boolean().optional(),
    duplexLevel: z.string().optional().nullable(),
});

// --- ESQUEMAS PROYECTOS ---
export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);
export const patchProjectSchema = insertProjectSchema.partial().extend({
    isPreview: z.boolean().optional(),
    previewMetadata: z.any().optional(),
});

// --- TABLA DE USUARIOS Y AUTENTICACIÓN (FASE F) ---
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 20 }).$type<'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VENDEDOR'>().notNull(),
    resetToken: text('reset_token'),
    resetTokenExpiry: timestamp('reset_token_expiry'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const patchUserSchema = insertUserSchema.partial();
