import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import pool from '@/lib/db';
import { getOrCreateAnonymousUser } from '@/lib/user';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET /api/threads - Listar todos los threads del usuario
export async function GET(req: NextRequest) {
  const client = await pool.connect();
  
  try {
    // Obtener session ID de cookie/header
    const sessionId = req.cookies.get('session_id')?.value;
    const userId = await getOrCreateAnonymousUser(sessionId);

    const result = await client.query(
      `SELECT id, title, created_at, updated_at 
       FROM chat_thread 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Error al obtener threads' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// POST /api/threads - Crear nuevo thread
export async function POST(req: NextRequest) {
  const client = await pool.connect();
  
  try {
    // Obtener o crear usuario
    const sessionId = req.cookies.get('session_id')?.value;
    const userId = await getOrCreateAnonymousUser(sessionId);

    // Crear thread en OpenAI
    const thread = await openai.beta.threads.create();

    // Guardar en base de datos
    await client.query(
      `INSERT INTO chat_thread (id, user_id, title, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [thread.id, userId, 'Nuevo chat']
    );

    const response = NextResponse.json({
      id: thread.id,
      title: 'Nuevo chat',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Si no hay session_id, crear uno nuevo
    if (!sessionId) {
      // Extraer el session_id del username del usuario creado
      const userResult = await client.query(
        'SELECT username FROM user_account WHERE id = $1',
        [userId]
      );
      const username = userResult.rows[0].username;
      const newSessionId = username.replace('demo-', '');
      
      response.cookies.set('session_id', newSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 año
      });
    }

    return response;
  } catch (error: any) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Error al crear thread' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
