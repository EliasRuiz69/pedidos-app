@AGENTS.md
# Proyecto: App de Pedidos

## Stack Tecnológico

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Supabase (Base de datos y autenticación)
* Zustand (estado global)

## Arquitectura General

* Usar Server Components por defecto
* Usar Client Components solo cuando sea necesario
* Mantener la estructura actual del proyecto
* No crear carpetas nuevas sin justificación clara
* Toda lógica reutilizable debe ir en /lib
* Tipos centralizados en /types
* Estado global en /store

## Convenciones de Código

* Usar TypeScript estrictamente tipado (no usar any)
* Nombres claros, descriptivos y consistentes
* Componentes pequeños y reutilizables
* Evitar duplicación de lógica
* Separar lógica de UI
* Mantener funciones simples y legibles
* Usar async/await correctamente
* Manejar errores siempre con try/catch

## Testing y Calidad

* Generar pruebas para cada funcionalidad crítica
* Cubrir:

  * lógica de negocio
  * funciones de utilidades
  * flujo de pedidos
* Usar pruebas unitarias y de integración cuando aplique
* Verificar que el código compile sin errores
* Corregir automáticamente cualquier error detectado
* No dejar código incompleto

## Seguridad

* Validar todos los inputs del usuario
* No confiar en datos del cliente
* Usar políticas de seguridad (RLS) en Supabase
* Proteger endpoints y accesos sensibles
* No exponer claves privadas
* Usar variables de entorno para datos sensibles
* Sanitizar datos antes de guardarlos
* Prevenir vulnerabilidades comunes (inyecciones, XSS, etc.)

## Base de Datos

* Supabase es la única fuente de verdad
* Diseñar tablas normalizadas
* Usar relaciones claras (foreign keys)
* Mantener consistencia de datos
* No duplicar información innecesaria
* Usar campos de tiempo como created_at

## UI / UX

### Filosofía de Diseño
* Estética: **utilitaria-refinada** — funcional como una app de trabajo, pero visualmente cuidada
* Cada pantalla debe tener una intención clara y una jerarquía visual obvia
* Diseño memorable: evitar interfaces genéricas o "de plantilla"

### Visual & Estilo
* Mobile-first siempre
* Tema oscuro como base, con acentos en color naranja/ámbar (#F97316) para acciones clave
* Tipografía: display font con carácter (ej. Sora, DM Sans, o similar) — nunca Inter o Arial
* Usar CSS variables para colores y espaciado consistente
* Fondos con profundidad: gradientes sutiles, sombras, no colores sólidos planos

### Composición & Layout
* Layouts asimétricos cuando aporten claridad (no por defecto simétrico)
* Jerarquía visual clara: lo más importante ocupa más espacio
* Generoso uso de espacio negativo en pantallas de detalle
* Densidad controlada en listados (pedidos, productos)

### Animaciones & Feedback
* Micro-interacciones en botones, cards y transiciones de estado
* Staggered reveals en listas (carga escalonada de items)
* Estados claros y visibles: loading skeleton, error con mensaje, éxito con confirmación
* Transiciones suaves entre páginas (no cambios bruscos)

### Componentes
* Cards de producto con imagen, nombre, precio y CTA visible sin scroll
* Botones de acción primaria grandes y fáciles de tocar (mínimo 44px altura)
* Formularios simples, un campo a la vez cuando sea posible
* Badge de estado en pedidos (pendiente, en proceso, entregado) con color semántico

### Lo que NUNCA hacer
* No usar gradientes purple/violeta genéricos
* No usar layouts de cuadrícula uniforme sin intención
* No dejar pantallas sin estado de carga o error
* No usar más de 2 familias tipográficas

## Flujo de Desarrollo

* Implementar funcionalidades de forma incremental
* Evitar sobreingeniería
* Priorizar claridad sobre optimización prematura
* Mantener código fácil de leer y modificar

## Funcionalidades del Proyecto

* Autenticación de usuarios
* Perfil de usuario con datos persistentes
* Catálogo de productos
* Carrito de compras
* Checkout sin pago online (contra entrega)
* Generación de pedidos
* Historial de pedidos por usuario
* Integración con WhatsApp para confirmación

## Reglas Importantes

* No crear archivos innecesarios
* No agregar dependencias sin justificación
* No romper la estructura existente
* No escribir código innecesariamente complejo
* No dejar tareas sin resolver

## Objetivo Final

Construir una aplicación escalable, segura, mantenible, lista para producción y fácil de extender
