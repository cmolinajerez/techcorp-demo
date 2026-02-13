import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import pool from '@/lib/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

if (!ASSISTANT_ID) {
  throw new Error('OPENAI_ASSISTANT_ID no está configurado');
}

export async function POST(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const client = await pool.connect();
  
  try {
    const { message } = await req.json();
    const threadId = params.threadId;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    // 1. Agregar mensaje del usuario al thread de OpenAI
    const userMessage = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message.trim(),
    });

    // 2. Guardar mensaje del usuario en BD
    await client.query(
      `INSERT INTO chat_message (id, thread_id, role, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userMessage.id, threadId, 'user', message.trim()]
    );

    // 3. Crear y ejecutar run con el assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID!,
    });

    // 4. Esperar a que el run complete (polling)
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    
    const startTime = Date.now();
    const timeout = 120000; // 120 segundos (2 minutos)

    while (runStatus.status !== 'completed') {
      if (Date.now() - startTime > timeout) {
        return NextResponse.json(
          { error: 'Timeout esperando respuesta del asistente' },
          { status: 408 }
        );
      }

      if (
        runStatus.status === 'failed' ||
        runStatus.status === 'cancelled' ||
        runStatus.status === 'expired'
      ) {
        return NextResponse.json(
          { error: `Run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}` },
          { status: 500 }
        );
      }

      // Esperar 1 segundo antes de verificar nuevamente
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    // 5. Obtener los mensajes del thread
    const messages = await openai.beta.threads.messages.list(threadId);

    // 6. Obtener la respuesta del asistente (el primer mensaje del assistant con este run_id)
    const assistantMessage = messages.data.find(
      (msg) => msg.role === 'assistant' && msg.run_id === run.id
    );

    if (!assistantMessage || !assistantMessage.content[0]) {
      return NextResponse.json(
        { error: 'No se recibió respuesta del asistente' },
        { status: 500 }
      );
    }

    const content = assistantMessage.content[0];
    let responseText = '';

    if (content.type === 'text') {
      responseText = content.text.value;
    } else {
      return NextResponse.json(
        { error: 'Tipo de respuesta no soportado' },
        { status: 500 }
      );
    }

    // 7. Guardar respuesta del assistant en BD
    await client.query(
      `INSERT INTO chat_message (id, thread_id, role, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [assistantMessage.id, threadId, 'assistant', responseText]
    );

    // 8. Actualizar timestamp del thread
    await client.query(
      'UPDATE chat_thread SET updated_at = NOW() WHERE id = $1',
      [threadId]
    );

    return NextResponse.json({
      content: responseText,
      messageId: assistantMessage.id,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Error al enviar mensaje' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
