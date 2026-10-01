# 🌤️ Sistema Meteorológico - Centro Climático

Aplicación web meteorológica interactiva, moderna y 100% adaptable (responsive) que proporciona información del clima en tiempo real, índice de radiación UV con recomendaciones de salud de la OMS, pronóstico extendido con gráfica de tendencias interactiva desarrollada con **Recharts**, y un sistema inteligente de alertas meteorológicas severas.

---

## 🚀 Características Principales

- **Clima en Tiempo Real**: Temperatura actual, sensación térmica, condición climática con iconos dinámicos oficiales de OpenWeather, porcentaje de humedad y velocidad/dirección del viento.
- **Geolocalización Automática**: Botón *“Usar ubicación actual”* que obtiene las coordenadas GPS con un solo clic.
- **Búsqueda Global de Ciudades**: Entrada de texto con autoejecución al presionar `Enter`.
- **Selector de Formato Horario (12h / 24h)**: Alternador en cabecera y chip interactivo en la tarjeta de información con persistencia en `localStorage`.
- **Selector de Unidades (°C / °F)**: Cambio instantáneo entre Celsius y Fahrenheit para todas las vistas y la gráfica sin recargar la página.
- **Medidor de Radiación UV OMS**:
  - Escala oficial de la Organización Mundial de la Salud (Bajo, Moderado, Alto, Muy Alto, Extremo).
  - Barra de progreso visual con código de colores según nivel de peligro.
  - Consejos de salud y fotoprotección personalizados según el índice en tiempo real.
- **Gráfica de Tendencia de Temperatura (Recharts)**:
  - Curva de temperatura suave interactiva (`AreaChart` con gradiente atmosférico).
  - Puntos de datos destacados con etiquetas de valor en cada pico.
  - Tooltip flotante personalizado con condición meteorológica, humedad y viento.
- **Carrusel de Pronóstico para los Próximos Días**:
  - Deslizador horizontal con controles de avance/retroceso.
  - **Soporte de gestos táctiles (Swipe)** para teléfonos móviles y tablets.
- **Sistema de Alertas Meteorológicas Severas**:
  - Detección automática de tormentas, ráfagas violentas, olas de calor extremo y frío polar.
  - Botón de demostración interactiva *“Simular Alerta”* para validar el banner de advertencia y sus recomendaciones de seguridad.
- **Diseño 100% Responsive**:
  - Diseñado y optimizado para pantallas ultracompactas (320px), teléfonos estándar, tablets y pantallas de escritorio.
  - Recálculo dinámico de dimensiones y gráficos ante rotaciones de pantalla o redimensionamientos de ventana.

---

## 📦 Despliegue en Netlify

El proyecto incluye la configuración lista para despliegues con un solo clic en **Netlify**:

### Opción 1: Conectar Repositorio de GitHub en Netlify
1. Sube tu código a un repositorio en **GitHub**.
2. Inicia sesión en [Netlify](https://www.netlify.com/) y selecciona **“Add new site” > “Import an existing project”**.
3. Selecciona tu repositorio de **GitHub**.
4. Netlify detectará automáticamente el archivo `netlify.toml` con la siguiente configuración predeterminada:
   - **Build command**: `npm run build`
   - **Publish directory**: `.` (o directorio raíz)
5. Haz clic en **“Deploy Site”** y tu aplicación estará en línea en segundos.

### Opción 2: Despliegue Manual por Arrastre (Netlify Drop)
1. Ve a [Netlify Drop](https://app.netlify.com/drop).
2. Arrastra la carpeta del proyecto (asegúrate de que contenga `index.html`, `styles.css`, `script.js`, `imagenes/`, `netlify.toml` y `_redirects`).
3. El sitio se desplegará instantáneamente con soporte de enrutamiento y CDN.

---

## 🐙 Despliegue en GitHub Pages

1. Sube los archivos a la rama principal (`main`) de tu repositorio en GitHub.
2. En GitHub, ve a la pestaña **Settings** de tu repositorio.
3. En la barra lateral izquierda, haz clic en **Pages**.
4. En **Build and deployment > Source**, selecciona **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`.
6. Haz clic en **Save**. En un par de minutos tu sitio estará disponible en `https://<tu-usuario>.github.io/<nombre-del-repo>/`.

---

## 💻 Ejecución en Desarrollo Local

### Requisitos Previos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

### Pasos
1. Clona el repositorio:
   ```bash
   git clone https://github.com/<tu-usuario>/<nombre-del-repo>.git
   cd <nombre-del-repo>
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm start
   # o
   npm run dev
   ```
4. Abre tu navegador web en:
   ```
   http://localhost:3000
   ```

---

## 📁 Estructura del Proyecto

```text
├── index.html        # Estructura principal semántica y accesible
├── styles.css        # Estilos modernos con Tailwind/CSS puro, variables y media queries responsive
├── script.js         # Lógica de APIs OpenWeather, UV Open-Meteo, Recharts, eventos y preferencias
├── server.js         # Servidor ligero Express para desarrollo y entornos Node.js
├── netlify.toml      # Configuración de build, redirects y headers para Netlify
├── _redirects        # Regla de redirección SPA estándar para Netlify
├── .gitignore        # Exclusión de node_modules, logs y archivos temporales para GitHub
├── package.json      # Metadatos, dependencias (React, Recharts, Express) y scripts de build
├── imagenes/         # Fondos atmosféricos e iconos del clima
└── metadata.json     # Metadatos de la aplicación
```

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT.
