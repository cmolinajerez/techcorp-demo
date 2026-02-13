# 🤖 Asistente InterSystems - Demo Mentor-IA

Demo conversacional completa usando **Next.js + Neon PostgreSQL + OpenAI Assistants API**. Interfaz profesional con múltiples chats, persistencia en base de datos y tu asistente de OpenAI configurado.

## ✨ Características

- 💬 Chat conversacional con OpenAI Assistants API
- 📁 Múltiples conversaciones persistentes
- 💾 Base de datos Neon PostgreSQL
- ✏️ Renombrar y eliminar chats
- 👤 Usuarios anónimos (sin registro)
- 📱 Responsive design
- ⚡ Ultra rápido (Next.js 14)
- 🎨 UI profesional

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: Neon PostgreSQL (serverless)
- **IA**: OpenAI Assistants API
- **Deploy**: Vercel (frontend + API) + Neon (database)

## 📋 Prerequisitos

- Node.js 18+
- Cuenta de OpenAI con API Key
- **Assistant ID** de tu asistente configurado
- Cuenta de Neon (gratis): [neon.tech](https://neon.tech)

## 🛠️ Instalación

### 1. Clonar/Descomprimir

```bash
tar -xzf mentor-ia-demo.tar.gz
cd mentor-ia-demo
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Base de Datos en Neon

#### Opción A: Usar tu BD existente
Si ya tienes las tablas `chat_thread`, `chat_message`, `user_account` en Neon, solo necesitas la connection string.

#### Opción B: Crear nueva BD
1. Ve a [neon.tech](https://neon.tech) y crea un proyecto
2. Copia la connection string
3. En el SQL Editor de Neon, ejecuta el script `schema.sql`:

```bash
# El archivo schema.sql contiene:
# - CREATE TABLE user_account
# - CREATE TABLE chat_thread  
# - CREATE TABLE chat_message
# - Índices de performance
```

### 4. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env`:

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ASSISTANT_ID=asst_...

# Neon PostgreSQL (copia desde Neon dashboard)
DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Probar localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy en Vercel

### Paso 1: Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <tu-repo-url>
git push -u origin main
```

### Paso 2: Deploy en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. "Add New Project"
3. Importa tu repositorio
4. Configura variables de entorno:
   - `OPENAI_API_KEY`
   - `OPENAI_ASSISTANT_ID`
   - `DATABASE_URL` (de Neon)
   - `NEXT_PUBLIC_APP_URL` (tu dominio de Vercel)
5. Deploy

### Paso 3: Configurar dominio personalizado

En Vercel:
- Settings → Domains
- Agregar `demo.mentor-ia.cl`

En v2networks (DNS de mentor-ia.cl):
```
Tipo: CNAME
Nombre: demo
Valor: cname.vercel-dns.com
```

## 📁 Estructura del Proyecto

```
mentor-ia-demo/
├── app/
│   ├── api/
│   │   └── threads/
│   │       ├── route.ts                    # GET/POST threads
│   │       └── [threadId]/
│   │           ├── route.ts                # GET/PATCH/DELETE thread
│   │           └── messages/
│   │               └── route.ts            # POST mensaje
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                            # UI principal
├── lib/
│   ├── db.ts                               # Pool de PostgreSQL
│   └── user.ts                             # Gestión usuarios anónimos
├── schema.sql                              # Schema de BD
├── .env.example
└── README.md
```

## 🎯 Cómo Funciona

### Usuarios Anónimos

```typescript
// Cada navegador obtiene un user_id automáticamente
// Se guarda en cookie: session_id
// Usuario en BD: "demo-{uuid}"
```

### Flujo de Conversación

```
1. Usuario crea chat
   → POST /api/threads
   → Crea thread en OpenAI
   → Guarda en tabla chat_thread

2. Usuario envía mensaje
   → POST /api/threads/{id}/messages
   → Agrega mensaje a thread OpenAI
   → Guarda en chat_message
   → Ejecuta assistant run
   → Espera respuesta (polling)
   → Guarda respuesta en chat_message

3. Persistencia
   → Todo se guarda en Neon PostgreSQL
   → Compartido entre dispositivos (mismo session_id)
```

### Schema de Base de Datos

```sql
user_account
├── id (UUID, PK)
├── username (VARCHAR)
├── email (VARCHAR, nullable)
└── full_name (VARCHAR, nullable)

chat_thread
├── id (VARCHAR, PK) -- Thread ID de OpenAI
├── user_id (UUID, FK)
├── title (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

chat_message
├── id (VARCHAR, PK) -- Message ID de OpenAI
├── thread_id (VARCHAR, FK)
├── role (VARCHAR: 'user'|'assistant')
├── content (TEXT)
└── created_at (TIMESTAMP)
```

## 🔧 Configuración de Neon

### Free Tier (Suficiente para demo)

```
✅ 0.5 GB storage
✅ 10 GB bandwidth/mes
✅ Serverless (escala a 0)
✅ Sin cold starts en Vercel
```

### Connection Pooling (Opcional, para alta carga)

Si tienes muchos usuarios concurrentes, habilita connection pooling en Neon y usa la pooled connection string.

## 🐛 Troubleshooting

### Error: "relation chat_thread does not exist"

→ Ejecuta `schema.sql` en Neon SQL Editor

### Error: "no pg_hba.conf entry for host"

→ Verifica que tu DATABASE_URL tenga `?sslmode=require`

### Error: "too many clients"

→ Usa connection pooling o verifica que `pool.connect()` tenga `.release()`

### Los chats no aparecen

→ Verifica en Neon SQL Editor:
```sql
SELECT * FROM chat_thread;
SELECT * FROM user_account;
```

### Timeout al enviar mensaje

→ El assistant puede tardar. Timeout está en 120s, puedes aumentarlo en la API route.

## 📊 Comparativa vs Versión Anterior

| Aspecto | Streamlit (Antes) | Next.js (Ahora) |
|---------|-------------------|-----------------|
| **Performance** | 2-5s | <1s |
| **Costo** | $7-28/mes | $0/mes (free tiers) |
| **Persistencia** | PostgreSQL local | Neon (serverless) |
| **Escalabilidad** | Limitada | Excelente |
| **Mobile** | Regular | Perfecto |
| **Deploy** | 2 servicios | 1 click |

## 🔒 Seguridad

- ✅ API Keys en server-side
- ✅ SSL/TLS en todas las conexiones
- ✅ HTTPS obligatorio en producción
- ✅ Cookie httpOnly para session_id
- ✅ Validación de inputs
- ✅ Prepared statements (SQL injection proof)

## 💰 Costos Estimados

```
Vercel Free Tier:        $0/mes
Neon Free Tier:          $0/mes
OpenAI API:              ~$3-10/mes (según uso)
──────────────────────────────────
Total:                   ~$3-10/mes
```

**vs Streamlit + Render:**
```
Render Backend:          $7-21/mes
PostgreSQL Addon:        $7/mes
──────────────────────────────────
Total antes:             $14-28/mes

Ahorro:                  ~$10-20/mes
```

## 📝 Notas Importantes

### Límites de Neon Free Tier

- 0.5 GB storage (suficiente para ~100k mensajes)
- Si superas, upgrade a $19/mes

### Rate Limits OpenAI

- Depende de tu tier en OpenAI
- Maneja errores 429 en producción

### Session ID

- Se guarda en cookie por 1 año
- Si usuario borra cookies, pierde acceso a sus chats
- Para persistencia entre dispositivos, necesitarías autenticación

## 🚀 Próximas Mejoras

- [ ] Exportar conversaciones
- [ ] Búsqueda en historial
- [ ] Streaming de respuestas
- [ ] Rate limiting por IP
- [ ] Analytics de uso
- [ ] Multi-idioma

## 📞 Soporte

### Documentación Útil

- [Neon Docs](https://neon.tech/docs)
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants)
- [Vercel Deployment](https://vercel.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 👤 Autor

**Carla Molina** - [Mentor-IA](https://mentor-ia.cl)

---

**¿Listo para desplegar?** Sigue los pasos y tendrás tu demo funcionando en ~30 minutos 🚀
#   t e c h c o r p - d e m o  
 #   t e c h c o r p - d e m o  
 