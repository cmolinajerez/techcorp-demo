import { v4 as uuidv4 } from 'uuid';
import pool from './db';

/**
 * Obtiene o crea un usuario anónimo basado en un ID de sesión
 * Para demo sin login, todos los usuarios son "demo-{uuid}"
 */
export async function getOrCreateAnonymousUser(sessionId?: string) {
  const client = await pool.connect();
  
  try {
    let userId: string;

    if (sessionId) {
      // Verificar si existe un usuario con este session ID como username
      const result = await client.query(
        'SELECT id FROM user_account WHERE username = $1',
        [`demo-${sessionId}`]
      );

      if (result.rows.length > 0) {
        userId = result.rows[0].id;
      } else {
        // Crear nuevo usuario anónimo
        const insertResult = await client.query(
          'INSERT INTO user_account (username, email, full_name) VALUES ($1, $2, $3) RETURNING id',
          [`demo-${sessionId}`, null, 'Usuario Demo']
        );
        userId = insertResult.rows[0].id;
      }
    } else {
      // Crear usuario completamente nuevo
      const newSessionId = uuidv4();
      const insertResult = await client.query(
        'INSERT INTO user_account (username, email, full_name) VALUES ($1, $2, $3) RETURNING id',
        [`demo-${newSessionId}`, null, 'Usuario Demo']
      );
      userId = insertResult.rows[0].id;
    }

    return userId;
  } finally {
    client.release();
  }
}
