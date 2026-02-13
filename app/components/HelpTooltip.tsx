'use client';

import { useState, useRef, useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';

/**
 * Componente HelpTooltip para mostrar la base de conocimiento
 * - Desktop: hover para mostrar
 * - Móvil: tap para mostrar/ocultar
 * - Click fuera cierra el tooltip
 */
export default function HelpTooltip() {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Cerrar con tecla Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative">
      {/* Botón de ayuda - MISMO ESTILO que el ícono de usuario original */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => {
          if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            setIsOpen(true);
          }
        }}
        onMouseLeave={() => {
          if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            setIsOpen(false);
          }
        }}
        className="w-11 h-11 rounded-full bg-gradient-to-br from-koa-green to-koa-mint flex items-center justify-center shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-koa-mint focus:ring-offset-2 hover:shadow-lg"
        aria-label="Ver base de conocimiento"
        aria-expanded={isOpen}
      >
        <BookOpen size={22} strokeWidth={2.5} className="text-white" />
      </button>
      
      {/* Tooltip */}
      {isOpen && (
        <div 
          ref={tooltipRef}
          className="absolute right-0 top-14 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 p-4 sm:p-5 z-50"
          role="tooltip"
        >
          {/* Flecha del tooltip */}
          <div className="hidden sm:block absolute -top-2 right-5 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
          
          {/* Header del tooltip */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-koa-green font-semibold text-base flex items-center gap-2">
              <span>📚</span> 
              <span>Base de conocimiento demo</span>
            </h3>
            {/* Botón cerrar - visible solo en móvil */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Lista de documentos */}
          <p className="text-koa-gray-medium text-sm leading-relaxed mb-3">
            <span className="font-semibold text-koa-gray-dark">21 documentos de RRHH: </span>
            Manual del Colaborador · Vacaciones · Teletrabajo · Licencias Médicas · Código de Conducta · Seguridad TI · Onboarding · Organigrama · Ética · Beneficios · Bonos · Evaluación de Desempeño · Proceso Disciplinario · Compliance · Remuneraciones · Offboarding · Acoso Laboral · Plan de Carrera · Asistencia y Horarios · Casos Resueltos
          </p>
          
          {/* Mensaje destacado */}
          <div className="bg-koa-green-light rounded-lg p-3 border border-koa-mint">
            <p className="text-koa-green text-xs flex items-start gap-2">
              <span className="text-base flex-shrink-0">✨</span>
              <span className="italic">Contenido demostrativo — Con documentación corporativa real, las respuestas serán aún más precisas y completas.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
