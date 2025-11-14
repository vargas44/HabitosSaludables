# Versión 1.3 Estable

## HabitFlow v1.3 - Versión Estable

Esta es la versión 1.3 estable de HabitFlow, una aplicación completa de seguimiento de hábitos saludables con integración de base de datos PostgreSQL.

### Características Principales

- Sistema de autenticación de usuarios (login y registro)
- Gestión CRUD completa de hábitos saludables
- Seguimiento de progreso numérico con vista detallada
- Estadísticas detalladas por día, semana y mes
- Perfil de usuario editable con todas las funcionalidades
- Exportación de datos en JSON y PDF
- Zona horaria de Argentina agregada
- Modo oscuro/claro
- Diseño responsive

### Fecha de Lanzamiento
Noviembre 2025

### Notas de Versión v1.3

#### Nuevas Características
- **Integración con PostgreSQL**: Migración completa de MySQL a PostgreSQL
- **API REST Backend**: Servidor Express.js con endpoints REST para todas las operaciones
- **Sincronización en Tiempo Real**: Los datos se sincronizan automáticamente con la base de datos PostgreSQL
- **Persistencia de Datos**: Todos los datos se guardan en PostgreSQL con fallback a LocalStorage
- **Servidor de Archivos Estáticos**: El servidor Express sirve los archivos HTML, CSS y JS
- **Normalización de Fechas**: Sistema robusto de normalización de fechas para compatibilidad entre servidor y cliente

#### Mejoras
- **Carga de Completaciones**: Las completaciones se cargan correctamente desde la base de datos
- **Estadísticas Mejoradas**: Las estadísticas ahora cargan datos directamente desde PostgreSQL
- **Botón de Completar**: Corregido con delegación de eventos para funcionar correctamente
- **Recarga Automática**: Los datos se recargan automáticamente al navegar entre páginas
- **Logs de Depuración**: Sistema completo de logs para facilitar el debugging
- **Manejo de Errores**: Mejor manejo de errores con fallback a LocalStorage cuando la API no está disponible

#### Correcciones Técnicas
- Normalización de formato de fechas (YYYY-MM-DD) para compatibilidad entre PostgreSQL y frontend
- Delegación de eventos para botones dinámicos
- Sincronización de datos entre múltiples instancias de HabitsManager
- Carga asíncrona correcta de hábitos y completaciones en estadísticas

### Notas de Versión v1.2

#### Nuevas Características
- **Vista Detallada de Hábitos**: Modal completo para ver y gestionar el progreso de cada hábito
- **Seguimiento de Progreso Numérico**: Actualización de progreso con valores numéricos (ej: 31/50 minutos)
- **Controles de Progreso**: Botones para sumar y restar progreso con valores personalizables
- **Barra de Progreso en Tiempo Real**: Actualización automática de la barra de progreso en la lista de hábitos
- **Favicon Personalizado**: Icono de la aplicación agregado y reemplazo del nombre por el icono en la interfaz

#### Mejoras
- Interfaz más intuitiva con vista detallada de hábitos
- Mejor visualización del progreso diario
- Detección automática de unidades (minutos, horas, km, etc.)
- Sincronización automática entre vista detallada y lista de hábitos
- Icono de la aplicación visible en todas las páginas

### Historial de Versiones

#### v1.0 (Octubre 2025)
- Primera versión estable
- Funcionalidad completa de gestión de hábitos
- Sistema de autenticación multi-usuario
- Estadísticas con gráficos interactivos
- Perfil de usuario con edición completa

#### v1.1 (Noviembre 2025)
- Exportación a PDF con diseño atractivo
- Zona horaria de Argentina
- Mejoras en la interfaz de exportación

#### v1.2 (Noviembre 2025)
- Vista detallada de hábitos con seguimiento numérico
- Controles de progreso mejorados
- Barra de progreso en tiempo real
- Favicon personalizado e integrado en la interfaz

#### v1.3 (Noviembre 2025)
- Migración completa a PostgreSQL
- API REST backend con Express.js
- Sincronización automática con base de datos
- Correcciones en carga de completaciones y estadísticas
- Mejoras en botón de completar hábito
- Sistema de normalización de fechas
- Servidor de archivos estáticos integrado
