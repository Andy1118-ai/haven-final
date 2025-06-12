import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Response } from 'express';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { action, email, password, name, phoneNumber } = await req.json();

    if (action === 'register') {
      // Validate input
      if (!email || !password || !name) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'User already exists' }),
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phoneNumber,
        },
      });

      // Create user preferences
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
        },
      });

      // Generate JWT token
      const token = sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return new Response(
        JSON.stringify({
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        }),
        { status: 201 }
      );
    }

    if (action === 'login') {
      // Validate input
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Missing email or password' }),
          { status: 400 }
        );
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401 }
        );
      }

      // Verify password
      const validPassword = await compare(password, user.password);

      if (!validPassword) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return new Response(
        JSON.stringify({
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
} 