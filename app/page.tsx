'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, Menu, X, User, Headset } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import HelpTooltip from './components/HelpTooltip';

interface ChatThread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar threads al inicio
  useEffect(() => {
    loadThreads();
  }, []);

  // Cargar mensajes cuando cambia el thread actual
  useEffect(() => {
    if (currentThreadId) {
      loadMessages(currentThreadId);
    }
  }, [currentThreadId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadThreads = async () => {
    try {
      const response = await fetch('/api/threads');
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/threads/${threadId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createNewThread = async () => {
    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Error creating thread');

      const newThread: ChatThread = await response.json();
      setThreads((prev) => [newThread, ...prev]);
      setCurrentThreadId(newThread.id);
      setMessages([]);
      setSidebarOpen(false); // Cerrar sidebar en mobile
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear nuevo chat');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentThreadId || isLoading) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/threads/${currentThreadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) throw new Error('Error sending message');

      // Recargar mensajes para obtener los IDs reales de la BD
      await loadMessages(currentThreadId);

      // Actualizar lista de threads (updated_at cambió)
      await loadThreads();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar mensaje');
      // Remover el mensaje temporal en caso de error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const renameThread = async (threadId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) throw new Error('Error renaming thread');

      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, title: newTitle } : t))
      );
      setEditingId(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al renombrar chat');
    }
  };

  const deleteThread = async (threadId: string) => {
    if (!confirm('¿Eliminar este chat?')) return;

    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error deleting thread');

      setThreads((prev) => prev.filter((t) => t.id !== threadId));

      if (currentThreadId === threadId) {
        setCurrentThreadId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar chat');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay para cerrar sidebar en mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header con botón cerrar en mobile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm text-koa-green font-semibold flex items-center gap-1.5">
                <span className="inline-block w-4 h-4 bg-koa-green rounded flex items-center justify-center text-white text-xs">✓</span>
                Sesión activa
              </div>
              <div className="text-xs text-gray-400 mt-1">Usuario: demo</div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Powered by Mentor-IA */}
        <div className="mx-4 my-3 p-3 bg-gradient-to-r from-koa-green-light to-green-50 rounded-lg border border-koa-mint">
          <div className="text-koa-green font-semibold text-sm">
            🎓 Powered by Mentor-IA
          </div>
          <div className="text-koa-green text-xs mt-1">
            Recursos Humanos KOA
          </div>
        </div>

        {/* Nuevo chat button */}
        <div className="px-4 mb-4">
          <button
            onClick={createNewThread}
            className="w-full flex items-center justify-center gap-2 bg-koa-mint hover:bg-koa-green text-koa-gray-dark hover:text-white py-2.5 px-4 rounded-lg transition-colors shadow-sm font-semibold"
          >
            <Plus size={18} />
            Nuevo chat
          </button>
        </div>

        {/* Lista de Chats */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="text-sm font-semibold text-koa-gray-medium mb-2">CHATS</div>
          {threads.map((thread) => (
            <div key={thread.id} className="mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentThreadId(thread.id);
                    setSidebarOpen(false); // Cerrar sidebar en mobile
                  }}
                  className={`
                    flex-1 text-left px-3 py-2.5 rounded-lg text-sm transition-all
                    ${
                      currentThreadId === thread.id
                        ? 'bg-koa-green-light text-koa-green border-l-4 border-koa-mint shadow-sm'
                        : 'bg-white text-koa-gray-dark border border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  {currentThreadId === thread.id && (
                    <span className="text-koa-green mr-2">🟢</span>
                  )}
                  {thread.title}
                </button>
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === thread.id ? null : thread.id)
                  }
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <MoreVertical size={16} className="text-koa-gray-medium" />
                </button>
              </div>

              {/* Menú de opciones */}
              {openMenuId === thread.id && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {editingId === thread.id ? (
                    <div>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-koa-mint"
                        placeholder="Nuevo nombre"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => renameThread(thread.id, editTitle)}
                          className="flex-1 bg-koa-mint hover:bg-koa-green text-koa-gray-dark hover:text-white px-3 py-2 rounded-lg text-sm transition-colors font-semibold"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 bg-gray-300 hover:bg-gray-400 px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(thread.id);
                          setEditTitle(thread.title);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                      >
                        <Edit2 size={14} />
                        Renombrar
                      </button>
                      <button
                        onClick={() => deleteThread(thread.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg text-sm mt-1 transition-colors"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header con logo KOA */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            
            {/* Logo Coca-Cola ANDINA */}
<div className="flex items-center">
  <img 
    src="/logo-koa.png" 
    alt="Coca-Cola Andina" 
    className="h-8 lg:h-10 w-auto"
  />
</div>
            
            <div className="hidden lg:block text-lg font-semibold text-koa-gray-dark ml-4">
              Asistente de Recursos Humanos
            </div>
          </div>
          
          <HelpTooltip />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
          {!currentThreadId ? (
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-koa-green to-koa-mint flex items-center justify-center shadow-lg">
                <Headset size={36} strokeWidth={2} className="text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-koa-gray-dark mb-3">
                Soy tu asistente virtual de Coca-Cola Andina 
              </h2>
              
              <p className="text-koa-gray-medium text-base mb-4 leading-relaxed">
                Estoy aquí para ayudarte con información sobre 
Recursos Humanos y políticas corporativas.
              </p>
              
              <div className="bg-white border border-gray-200 rounded-xl p-5 max-w-lg mx-auto mb-4 shadow-sm">
                <p className="text-base font-bold text-koa-gray-dark mb-4 flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  ¿Qué puedo hacer por ti?
                </p>
                <ul className="text-sm text-koa-gray-dark text-left space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="inline-block px-3 py-1 bg-koa-green-light text-koa-green rounded-full text-xs font-semibold border border-koa-mint whitespace-nowrap">Vacaciones</span>
                    <span className="flex-1">- Responder consultas sobre políticas y normativas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-block px-3 py-1 bg-koa-green-light text-koa-green rounded-full text-xs font-semibold border border-koa-mint whitespace-nowrap">Normativas</span>
                    <span className="flex-1">- Buscar información en documentación corporativa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-block px-3 py-1 bg-koa-green-light text-koa-green rounded-full text-xs font-semibold border border-koa-mint whitespace-nowrap">Beneficios</span>
                    <span className="flex-1">- Mantener conversaciones naturales en español</span>
                  </li>
                </ul>
                
                <p className="text-sm font-semibold text-koa-gray-medium mt-5 mb-2 text-left flex items-center gap-2">
                  <span className="text-base">💡</span>
                  Ejemplos de preguntas:
                </p>
                <ul className="text-sm text-koa-green text-left space-y-1.5">
                  <li className="hover:opacity-70 cursor-pointer border-l-3 border-transparent hover:border-koa-mint pl-3 transition-all">
                    ¿Cuál es la jornada laboral oficial?
                  </li>
                  <li className="hover:opacity-70 cursor-pointer border-l-3 border-transparent hover:border-koa-mint pl-3 transition-all">
                    ¿Cada cuánto debo cambiar mi contraseña?
                  </li>
                  <li className="hover:opacity-70 cursor-pointer border-l-3 border-transparent hover:border-koa-mint pl-3 transition-all">
                    ¿Cuántos días de vacaciones tengo?
                  </li>
                </ul>
              </div>
              
              <p className="text-koa-gray-medium text-sm">
                📝 Crea un nuevo chat desde la barra lateral para comenzar
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-koa-green to-koa-mint flex items-center justify-center shadow-lg">
                <Headset size={36} strokeWidth={2} className="text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-koa-gray-dark mb-3">
                Soy tu asistente virtual de Coca-Cola Andina
              </h2>
              
              <p className="text-koa-gray-medium text-base mb-6 leading-relaxed">
                Estoy aquí para ayudarte con información sobre 
Recursos Humanos y políticas corporativas.
              </p>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg mx-auto mb-4 shadow-sm">
                <p className="text-base font-bold text-koa-gray-dark mb-4 flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  ¿Qué puedo hacer por ti?
                </p>
                <ul className="text-sm text-koa-gray-dark text-left space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="inline-block px-3 py-1 bg-koa-green-light text-koa-green rounded-full text-xs font-semibold border border-koa-mint whitespace-nowrap">Vacaciones</span>
                    <span className="flex-1">- Responder consultas sobre políticas y normativas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-block px-3 py-1 bg-koa-green-light text-koa-green rounded-full text-xs font-semibold border border-koa-mint whitespace-nowrap">Normativas</span>
                    <span className="flex-1">- Buscar información en documentación corporativa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-block px-3 py-1 bg-koa-green-light text-koa-green rounded-full text-xs font-semibold border border-koa-mint whitespace-nowrap">Beneficios</span>
                    <span className="flex-1">- Mantener conversaciones naturales en español</span>
                  </li>
                </ul>
                
                <p className="text-sm font-semibold text-koa-gray-medium mt-5 mb-2 text-left flex items-center gap-2">
                  <span className="text-base">💡</span>
                  Ejemplos de preguntas:
                </p>
                <ul className="text-sm text-koa-green text-left space-y-1.5">
                  <li className="hover:opacity-70 cursor-pointer border-l-3 border-transparent hover:border-koa-mint pl-3 transition-all">
                    ¿Cuál es la jornada laboral oficial?
                  </li>
                  <li className="hover:opacity-70 cursor-pointer border-l-3 border-transparent hover:border-koa-mint pl-3 transition-all">
                    ¿Cada cuánto debo cambiar mi contraseña?
                  </li>
                  <li className="hover:opacity-70 cursor-pointer border-l-3 border-transparent hover:border-koa-mint pl-3 transition-all">
                    ¿Cuántos días de vacaciones tengo?
                  </li>
                </ul>
              </div>
              
              <p className="text-koa-gray-medium text-sm">
                Escribe tu mensaje abajo para comenzar
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-6 flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className="flex gap-3 max-w-3xl">
                    {msg.role === 'assistant' && (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-koa-green to-koa-mint flex items-center justify-center flex-shrink-0 shadow-md">
                        <Headset size={22} strokeWidth={2.5} className="text-white" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-5 py-3.5 ${
                        msg.role === 'user'
                          ? 'bg-koa-green-light text-koa-gray-dark border border-koa-mint shadow-sm'
                          : 'bg-white border border-gray-200 shadow-sm'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none text-koa-gray-dark">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm lg:text-base">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-koa-green to-koa-mint flex items-center justify-center flex-shrink-0 shadow-md">
                        <User size={22} strokeWidth={2.5} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="mb-6 flex justify-start">
                  <div className="flex gap-3 max-w-3xl">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-koa-green to-koa-mint flex items-center justify-center flex-shrink-0 shadow-md">
                      <Headset size={22} strokeWidth={2.5} className="text-white" />
                    </div>
                    <div className="rounded-2xl px-5 py-3.5 bg-white border border-gray-200 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-koa-mint rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-koa-mint rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-koa-mint rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        {currentThreadId && (
          <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-4">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-koa-mint focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-koa-mint hover:bg-koa-green disabled:bg-gray-300 disabled:cursor-not-allowed text-koa-gray-dark hover:text-white rounded-full transition-colors shadow-sm font-semibold"
              >
                {isLoading ? '...' : '➤'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
