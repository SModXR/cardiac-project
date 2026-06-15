# 🏥 Sistema de Evaluación Cardíaca - Frontend

Sistema web para evaluación cardiovascular mediante dispositivo IoT (ESP32 + MAX30102) con análisis de frecuencia cardíaca y cálculo de IMC.

## 🌟 Características

- ✅ Evaluación individual en tiempo real
- ✅ Registro de pacientes para dataset de referencia
- ✅ Medición de BPM con ESP32 + MAX30102
- ✅ Análisis estadístico del dataset
- ✅ Cálculo y clasificación de IMC según OMS
- ✅ Diseño responsive y moderno
- ✅ Integración con Azure Functions

## 🚀 Despliegue Rápido

### Método 1: Portal de Azure (Más Fácil)

1. **Preparar Git**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Subir a GitHub**:
   - Usar GitHub Desktop o:
   ```bash
   gh repo create evaluacion-cardiaca-frontend --public --source=. --remote=origin --push
   ```

3. **Crear Static Web App**:
   - Ir a: https://portal.azure.com
   - Crear recurso → Static Web App
   - Conectar con GitHub
   - Configurar:
     - App location: `/`
     - Build preset: Custom
     - Output location: (vacío)

4. **Esperar despliegue automático** (2-3 minutos)

5. **Obtener URL** del sitio desplegado

Ver guía completa: [`GUIA_DESPLEGAR_STATIC_WEB_APP.md`](GUIA_DESPLEGAR_STATIC_WEB_APP.md)

### Método 2: Script Automatizado

```bash
# Verificar que todo esté listo
VERIFICAR_ANTES_DESPLEGAR.bat

# Desplegar
DESPLEGAR_AZURE_STATIC.bat
```

## 🧪 Desarrollo Local

```bash
# Instalar servidor HTTP simple (si no lo tienes)
python -m http.server 8000

# O usar el script incluido
INICIAR_SERVIDOR.bat

# Abrir navegador
http://localhost:8000
```

## 📁 Estructura

```
frontend-registro/
├── index.html              # Página de inicio
├── evaluacion.html         # Evaluación individual (principal)
├── admin.html              # Panel administrativo
├── registro.html           # Registro de pacientes
├── medicion.html           # Medición de BPM
├── analisis-pro.html       # Análisis estadístico
├── staticwebapp.config.json # Configuración Azure Static Web App
├── .gitignore              # Archivos a ignorar en Git
├── css/
│   ├── global.css          # Estilos globales
│   ├── style.css           # Estilos principales
│   └── analisis-pro.css    # Estilos de análisis
└── js/
    ├── evaluacion.js       # Lógica de evaluación
    ├── registro.js         # Lógica de registro
    ├── medicion.js         # Lógica de medición
    ├── analisis-pro.js     # Lógica de análisis
    ├── analisis.js         # Análisis simple
    └── main.js             # Scripts compartidos
```

## ⚙️ Configuración

### APIs de Azure Functions

Las URLs de las Azure Functions están configuradas en cada archivo JS:

```javascript
// evaluacion.js
const API_CREAR_SESION = "https://funccardiacproy-gqd8ead9bpewa2e3.eastus-01.azurewebsites.net/api/crearsesionevaluacion";
const API_OBTENER_SESION = "https://funccardiacproy-gqd8ead9bpewa2e3.eastus-01.azurewebsites.net/api/obtenersesionevaluacion";
const API_FINALIZAR = "https://funccardiacproy-gqd8ead9bpewa2e3.eastus-01.azurewebsites.net/api/finalizarevaluacion";
```

Si cambias las URLs de tus Functions, actualiza estos archivos:
- `js/evaluacion.js`
- `js/registro.js`
- `js/medicion.js`
- `js/analisis-pro.js`

### CORS en staticwebapp.config.json

Si cambias las URLs de Azure Functions, también actualiza:

```json
{
  "globalHeaders": {
    "content-security-policy": "default-src 'self' https://TU-NUEVA-URL.azurewebsites.net; ..."
  }
}
```

## 🔧 Solución de Problemas

### CSS/JS no cargan

**Problema**: Rutas absolutas vs relativas

**Solución**: Todas las rutas deben ser relativas:
```html
<!-- ✅ CORRECTO -->
<link rel="stylesheet" href="css/global.css">

<!-- ❌ INCORRECTO -->
<link rel="stylesheet" href="/css/global.css">
```

### API no responde

**Problema**: CORS o Azure Function no está desplegada

**Solución**:
1. Verificar que Azure Functions esté corriendo
2. Verificar URL en los archivos JS
3. Verificar CORS en Azure Functions
4. Abrir DevTools (F12) para ver errores

### "undefined" en clasificación IMC

**Problema**: Azure Function no está actualizada

**Solución**: El frontend tiene fallback para calcular la clasificación localmente. Para tener las recomendaciones completas:
```bash
cd ../RegistroPacientesFunction
func azure functionapp publish funccardiacproy
```

## 📊 Flujo de Uso

### Evaluación Individual (Página Principal)

```
1. Usuario abre /evaluacion.html
2. Llena formulario (nombre, edad, peso, altura)
3. Click "Iniciar Medición"
4. Sistema crea sesión en Azure
5. Usuario coloca dedo en ESP32 + MAX30102
6. ESP32 envía 24 lecturas de BPM (1 minuto)
7. Sistema calcula:
   - Promedio, mínimo, máximo de BPM
   - IMC y clasificación según OMS
   - Recomendaciones personalizadas
8. Muestra resultado final con métricas
```

### Panel Administrativo

```
1. Usuario abre /admin.html
2. Opciones disponibles:
   - Registro de Pacientes (dataset de referencia)
   - Medición de BPM (dataset de referencia)
   - Análisis Estadístico (visualización del dataset)
```

## 🎨 Clasificación del IMC

El sistema clasifica el IMC según estándares de la OMS:

| IMC | Clasificación | Color |
|-----|---------------|-------|
| < 18.5 | Bajo Peso | 🔵 Azul |
| 18.5 - 24.9 | Normal | 🟢 Verde |
| 25.0 - 29.9 | Sobrepeso | 🟡 Amarillo |
| 30.0 - 34.9 | Obesidad I | 🟠 Naranja |
| 35.0 - 39.9 | Obesidad II | 🔴 Rojo |
| ≥ 40.0 | Obesidad III | 🔴 Rojo oscuro |

## 🔒 Seguridad

- ✅ HTTPS habilitado automáticamente en Azure Static Web Apps
- ✅ Content Security Policy configurada
- ✅ CORS configurado para APIs específicas
- ✅ Headers de seguridad (X-Content-Type-Options, X-Frame-Options, etc.)

## 💰 Costos

**Azure Static Web Apps - Plan Free**:
- Precio: $0/mes
- 100 GB bandwidth/mes
- 0.5 GB storage
- 2 custom domains
- Perfecto para este proyecto ✅

## 📞 Soporte

Ver documentación completa:
- [`GUIA_DESPLEGAR_STATIC_WEB_APP.md`](GUIA_DESPLEGAR_STATIC_WEB_APP.md) - Guía de despliegue
- [`CLASIFICACION_IMC_IMPLEMENTADA.md`](../../CLASIFICACION_IMC_IMPLEMENTADA.md) - Detalles del IMC
- [`SOLUCION_UNDEFINED_IMC.md`](../../SOLUCION_UNDEFINED_IMC.md) - Troubleshooting IMC

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Azure Functions (C# .NET)
- **Base de Datos**: Azure Cosmos DB
- **Storage**: Azure Blob Storage
- **IoT**: Azure IoT Hub
- **Hosting**: Azure Static Web Apps
- **Hardware**: ESP32 + MAX30102

## ✅ Checklist de Despliegue

- [x] `staticwebapp.config.json` configurado
- [x] `.gitignore` creado
- [x] URLs de APIs configuradas
- [x] CORS configurado
- [x] Sin rutas absolutas problemáticas
- [ ] Repositorio Git creado
- [ ] Subido a GitHub
- [ ] Static Web App creada en Azure
- [ ] Despliegue completado
- [ ] Sitio verificado y funcionando

## 📝 Notas

- Este es un proyecto experimental/educativo
- Los resultados NO sustituyen valoración médica profesional
- Diseñado para evaluaciones puntuales, no monitoreo continuo
- El dispositivo ESP32 + MAX30102 es el principal, simuladores son opcionales

---

**Proyecto**: Sistema de Evaluación Cardíaca IoT  
**Versión**: 1.0  
**Fecha**: Junio 2026  
**Licencia**: Proyecto Académico

---

¡Gracias por usar el Sistema de Evaluación Cardíaca! 🏥💙
