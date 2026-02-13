import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/threads/[threadId] - Obtener mensajes de un thread
export async function GET(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const client = await pool.connect();
  
  try {
    const threadId = params.threadId;

    const result = await client.query(
      `SELECT id, role, content, created_at
       FROM chat_message
       WHERE thread_id = $1
       ORDER BY created_at ASC`,
      [threadId]
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Error al obtener mensajes' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// PATCH /api/threads/[threadId] - Renombrar thread
export async function PATCH(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const client = await pool.connect();
  
  try {
    const threadId = params.threadId;
    const { title } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Título requerido' },
        { status: 400 }
      );
    }

    await client.query(
      'UPDATE chat_thread SET title = $1, updated_at = NOW() WHERE id = $2',
      [title.trim(), threadId]
    );

    return NextResponse.json({ success: true, title: title.trim() });
  } catch (error: any) {
    console.error('Error renaming thread:', error);
    return NextResponse.json(
      { error: 'Error al renombrar thread' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// DELETE /api/threads/[threadId] - Eliminar thread
export async function DELETE(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const client = await pool.connect();
  
  try {
    const threadId = params.threadId;

    // Eliminar thread (los mensajes se eliminan en cascada)
    await client.query('DELETE FROM chat_thread WHERE id = $1', [threadId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: 'Error al eliminar thread' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
