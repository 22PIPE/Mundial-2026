# Copa Mundial 2026 — Bracket Tracker

Aplicación de seguimiento del bracket del Mundial 2026, con sincronización en tiempo real vía Firebase Firestore y autenticación con Google.

## Estructura del proyecto

```
Mundial-2026/
│
├── index.html          # Estructura HTML (sin lógica)
├── css/
│   └── styles.css      # Todos los estilos
├── js/
│   ├── app.js           # Punto de entrada: conecta todo y arranca la app
│   ├── config.js        # Config de Firebase + constantes (ADMIN_EMAIL)
│   ├── firebase.js      # Inicialización de Firebase (app, db, auth)
│   ├── data.js           # Datos iniciales de cada ronda + guardado/lectura en Firestore
│   ├── tournament.js     # Orden cronológico, avance de ganadores, auto-inicio 0-0
│   ├── render.js         # Pintado del DOM + indicador de sincronización
│   ├── modal.js           # Modal de resultado + modal de confirmación "¿Finalizó?"
│   ├── auth.js            # Login con Google, menú admin, reinicio del torneo
│   └── utils.js            # Helpers genéricos (shortCode)
├── img/
│   └── Copa.png         # ← Copiá tu imagen acá
└── README.md
```

## Cómo correr el proyecto localmente

Como `index.html` usa `<script type="module">`, **no podés abrirlo con doble clic** (file://). Los navegadores bloquean los imports de módulos ES en ese modo. Necesitás un servidor local. Opciones:

**Opción 1 — Con Node.js (si ya lo tenés instalado por lo de Firebase Functions):**
```bash
npx live-server Mundial-2026
```

**Opción 2 — Con Python (viene preinstalado en la mayoría de sistemas):**
```bash
cd Mundial-2026
python3 -m http.server 8000
```
Luego abrí `http://localhost:8000` en el navegador.

**Opción 3 — Con el CLI de Firebase (si ya lo tenés instalado):**
```bash
firebase serve
```

## Antes de reemplazar tu versión actual

1. Copiá tu `Copa.png` dentro de `img/`
2. Corré el proyecto local con cualquiera de las opciones de arriba
3. Probá contra tu Firebase real:
   - Login con Google (como admin)
   - Ver como invitado (solo lectura)
   - Marcar un resultado y confirmar con el modal "¿Finalizó el partido?"
   - Verificar que el ganador avance a la siguiente ronda
   - Verificar que el orden cronológico de Dieciseisavos se mantenga
4. Si todo funciona igual que antes, ya podés reemplazar tu HTML monolítico por esta carpeta

## Próximos pasos pendientes (de conversaciones anteriores)

- Aplicar el orden cronológico a Octavos, Cuartos, Semifinales y Final una vez se conozcan esas fechas (ya está soportado en `tournament.js`, solo falta cargar las fechas en `data.js`)
- Retomar la integración con API-Football vía Firebase Cloud Functions (pausada por restricciones del plan gratuito)
