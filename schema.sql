-- Script SQL para crear las tablas en Neon PostgreSQL
-- Compatible con el schema existente mostrado en la imagen

-- Tabla de usuarios (simplificada para usuarios anónimos)
CREATE TABLE IF NOT EXISTS user_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de threads/conversaciones
CREATE TABLE IF NOT EXISTS chat_thread (
    id VARCHAR(255) PRIMARY KEY, -- Thread ID de OpenAI
    user_id UUID REFERENCES user_account(id) ON DELETE CASCADE,
    title VARCHAR(500) DEFAULT 'Nuevo chat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS chat_message (
    id VARCHAR(255) PRIMARY KEY, -- Message ID de OpenAI
    thread_id VARCHAR(255) REFERENCES chat_thread(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_chat_thread_user_id ON chat_thread(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_thread_id ON chat_message(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_thread_updated_at ON chat_thread(updated_at DESC);

-- Nota: Este script es compatible con tu schema existente en Neon
-- Si ya tienes las tablas creadas, no es necesario ejecutarlo
