import { Router } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cofinancia_super_secret_key_2026';

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // JWT payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

    res.json({ token, user: payload });
  } catch (error) {
    console.error('[Auth Login] Error:', error);
    res.status(500).json({ message: 'Error interno del servidor durante el login' });
  }
});

// Stubs para reset de contraseña (implementación a demanda por el Super Admin)
authRouter.post('/forgot-password', async (req, res) => {
  res.status(501).json({ message: 'Feature not implemented yet' });
});

authRouter.post('/reset-password', async (req, res) => {
  res.status(501).json({ message: 'Feature not implemented yet' });
});
