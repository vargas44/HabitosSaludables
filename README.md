# HabitFlow - Aplicación de Seguimiento de Hábitos Saludables

**Versión 1.2 Estable**

Una aplicación web responsive para el seguimiento y gestión de hábitos saludables, diseñada con un enfoque en la experiencia del usuario y la motivación constante.

## Características

### Funcionalidades Principales
- **Sistema de Autenticación**: Login y registro de usuarios
- **Gestión CRUD de Hábitos**: Crear, leer, actualizar y eliminar hábitos personalizados
- **Seguimiento Diario**: Marcar hábitos como completados y actualizar progreso numérico
- **Vista Detallada de Hábitos**: Modal completo para gestionar el progreso de cada hábito
- **Estadísticas Detalladas**: Análisis por día, semana y mes
- **Perfil de Usuario**: Edición completa de datos personales, objetivos y configuración
- **Exportación de Datos**: Exportar datos en formato JSON o PDF con diseño profesional
- **Gráficos Interactivos**: Visualización de progreso con Chart.js
- **Modo Oscuro/Claro**: Interfaz adaptable a las preferencias del usuario

### Diseño Responsive
- **Mobile First**: Optimizado para dispositivos móviles
- **Navegación Intuitiva**: Enlaces entre páginas principales
- **Grid Responsive**: Layout que se adapta a diferentes tamaños de pantalla
- **Touch Friendly**: Botones y elementos optimizados para touch

### Interfaz de Usuario
- **Material Design**: Iconos y componentes siguiendo las mejores prácticas
- **Tailwind CSS**: Estilos modernos y consistentes
- **Tema Personalizable**: Colores y estilos adaptables
- **Animaciones Suaves**: Transiciones fluidas entre estados

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Estilos modernos con Tailwind CSS
- **JavaScript ES6+**: Funcionalidad interactiva y gestión de estado
- **Chart.js**: Gráficos interactivos para estadísticas
- **LocalStorage**: Persistencia de datos en el navegador
- **Material Icons**: Iconografía consistente

## Estructura del Proyecto

```
proyecto/
├── index.html          # Redirección automática
├── login.html          # Página de login y registro
├── resumen.html        # Gestión CRUD de hábitos
├── estadisticas.html   # Estadísticas por día, semana y mes
├── perfil.html         # Perfil de usuario editable
├── favicon.svg         # Icono de la aplicación
├── js/
│   ├── auth.js         # Sistema de autenticación
│   ├── habits.js       # Gestión CRUD de hábitos
│   ├── statistics.js    # Cálculo y visualización de estadísticas
│   └── profile.js      # Gestión de perfil de usuario
├── database/
│   ├── schema.sql      # Schema completo de la base de datos
│   ├── init.sql        # Script de inicialización
│   ├── queries.sql     # Consultas SQL útiles
│   ├── migration_example.js  # Ejemplo de migración desde LocalStorage
│   ├── config.example.js    # Configuración de ejemplo
│   ├── API_EXAMPLE.md  # Ejemplos de API REST
│   ├── diagram.md      # Diagrama de relaciones
│   └── README.md       # Documentación de la base de datos
├── VERSION.md          # Información de versión
└── README.md           # Documentación
```

## Instalación y Uso

1. **Clonar o descargar** el proyecto
2. **Abrir** `login.html` en un navegador web moderno
3. **Registrarse** o iniciar sesión con un usuario existente
4. **¡Listo!** La aplicación funciona completamente offline

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- Soporte para LocalStorage
- Conexión a internet (solo para cargar CDN de Tailwind CSS y Chart.js)

## Guía de Uso

### 1. Autenticación (login.html)
- **Registrarse**: Completa el formulario con nombre, email y contraseña
- **Iniciar Sesión**: Usa tu email y contraseña para acceder
- Los datos se guardan localmente en el navegador

### 2. Gestión de Hábitos (resumen.html)
- **Crear Hábito**: Haz clic en "Nuevo Hábito" y completa el formulario
  - Nombre del hábito
  - Categoría (Salud, Ejercicio, Alimentación, Mental, Productividad)
  - Meta diaria
  - Descripción (opcional)
- **Ver Detalles**: Haz clic en el ícono de ojo para abrir la vista detallada del hábito
- **Actualizar Progreso**: En la vista detallada, usa los botones +/- y "Actualizar" para sumar progreso, o "Restar" para disminuirlo
- **Marcar Completado**: En la vista detallada, haz clic en "Marcar Completado" para completar el hábito automáticamente
- **Reiniciar Progreso**: En la vista detallada, haz clic en "Reiniciar" para resetear el progreso del día
- **Editar Hábito**: Haz clic en el ícono de editar junto al hábito
- **Eliminar Hábito**: Haz clic en el ícono de eliminar (con confirmación)
- **Completar Hábito**: Haz clic en el círculo para marcar como completado
- **Buscar y Filtrar**: Usa la barra de búsqueda y filtros para encontrar hábitos

### 3. Estadísticas (estadisticas.html)
- **Vista Diaria**: Estadísticas del día actual
- **Vista Semanal**: Progreso de la semana con gráfico y calendario
- **Vista Mensual**: Análisis completo del mes con gráficos y calendario
- Cambia entre vistas usando los botones en la parte superior

### 4. Perfil (perfil.html)
- **Editar Información Personal**: Nombre completo, email, biografía
- **Configurar Zona Horaria**: Selecciona tu zona horaria y ve la hora local
- **Gestionar Objetivos**: Agrega, edita o elimina objetivos personales con colores
- **Ver Estadísticas**: Resumen de tus hábitos y progreso
- **Exportar Datos**: Descarga todos tus datos en formato JSON
- **Eliminar Cuenta**: Opción para eliminar tu cuenta y todos los datos

## Características Técnicas

### Gestión de Estado
- **LocalStorage**: Persistencia automática de datos por usuario
- **Estado Reactivo**: Actualización en tiempo real de la interfaz
- **Sincronización**: Datos consistentes entre sesiones

### Autenticación
- **Sistema Simple**: Autenticación basada en LocalStorage
- **Multi-usuario**: Cada usuario tiene sus propios hábitos
- **Sesiones**: Mantiene la sesión activa hasta cerrar sesión

### Optimización
- **Carga Rápida**: CDN para librerías externas
- **Offline First**: Funciona completamente sin conexión después de la carga inicial
- **Responsive**: Adaptable a cualquier dispositivo

### Accesibilidad
- **Navegación por Teclado**: Soporte completo para teclado
- **Contraste**: Colores optimizados para legibilidad
- **Semántica**: HTML semántico para lectores de pantalla

## Personalización

### Temas
- **Modo Claro**: Interfaz clara y limpia
- **Modo Oscuro**: Reducción de fatiga visual
- **Cambio Dinámico**: Alternar entre temas sin recargar

### Datos
- **Por Usuario**: Cada usuario tiene sus propios hábitos
- **Persistencia Local**: Los datos se guardan en el navegador
- **Aislados**: Los datos de un usuario no afectan a otros

## Métricas y Estadísticas

### Vista Diaria
- **Hábitos Completados**: Total del día actual
- **Tasa de Cumplimiento**: Porcentaje de hábitos completados
- **Categorías Activas**: Número de categorías con hábitos completados
- **Lista Detallada**: Hábitos completados con detalles

### Vista Semanal
- **Días Completados**: Días con actividad de la semana
- **Tasa de Cumplimiento**: Porcentaje semanal
- **Total de Completaciones**: Suma de hábitos completados
- **Promedio Diario**: Promedio de hábitos por día
- **Gráfico de Barras**: Visualización del progreso diario
- **Calendario Semanal**: Vista de los 7 días

### Vista Mensual
- **Días Activos**: Días con actividad del mes
- **Tasa de Cumplimiento**: Porcentaje mensual
- **Total de Completaciones**: Suma del mes
- **Mejor Día**: Día con más hábitos completados
- **Gráfico de Líneas**: Evolución semanal del mes
- **Calendario Mensual**: Vista completa del mes

## Paleta de Colores

### Modo Claro
- **Primario**: #10B981 (Verde)
- **Fondo**: #F9FAFB (Gris claro)
- **Tarjetas**: #FFFFFF (Blanco)
- **Texto**: #1F2937 (Gris oscuro)

### Modo Oscuro
- **Fondo**: #111827 (Gris muy oscuro)
- **Tarjetas**: #1F2937 (Gris oscuro)
- **Texto**: #F9FAFB (Gris claro)
- **Bordes**: #374151 (Gris medio)

## Seguridad

**Nota**: Esta es una aplicación de demostración. En un entorno de producción:
- Las contraseñas deben estar hasheadas (no en texto plano)
- Se debe usar un backend seguro con autenticación adecuada
- Los datos sensibles deben estar encriptados
- Se debe implementar HTTPS

## Base de Datos

El proyecto incluye un schema completo de base de datos en la carpeta `database/`:

- **schema.sql**: Schema completo con todas las tablas necesarias
- **queries.sql**: Consultas SQL útiles para operaciones comunes
- **migration_example.js**: Ejemplo de migración desde LocalStorage
- **API_EXAMPLE.md**: Ejemplos de endpoints de API REST
- **diagram.md**: Diagrama de relaciones entre tablas

### Tablas Principales

- **users**: Información de usuarios
- **user_profiles**: Perfiles extendidos de usuarios
- **profile_goals**: Objetivos personales
- **habits**: Hábitos de los usuarios
- **habit_completions**: Completaciones diarias
- **daily_progress**: Progreso numérico diario
- **user_sessions**: Sesiones activas (opcional)

Ver `database/README.md` para documentación completa.

## Futuras Mejoras

- [ ] **Backend Real**: Implementar servidor con base de datos
- [ ] **API REST**: Crear endpoints para todas las operaciones
- [ ] **Sincronización en la Nube**: Backup automático
- [ ] **Notificaciones**: Recordatorios diarios
- [ ] **Objetivos**: Metas a largo plazo
- [ ] **Comunidad**: Compartir progreso
- [ ] **Widgets**: Integración con sistemas operativos
- [ ] **Analytics Avanzados**: Métricas más detalladas

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Soporte

Para soporte o preguntas:
- **Issues**: Reporta bugs o solicita features
- **Documentación**: Consulta esta guía

---

**HabitFlow** - Transforma tu vida un hábito a la vez
