// ─── Punto de entrada ──────────────────────────
// Conecta todos los módulos y arranca la aplicación.
// Importamos auth.js y modal.js únicamente por su efecto secundario:
// registran sus event listeners al cargarse.
import './auth.js';
import './modal.js';

import { setSyncState } from './render.js';
import { startListening } from './data.js';
import { renderAll } from './render.js';
import { checkAutoStart } from './tournament.js';

const loginModal = document.getElementById('loginModal');

// —— Arranque ———————————————
setSyncState('saving');
startListening();
renderAll();

// Verificar auto-inicio cada minuto
setInterval(checkAutoStart, 60000);

loginModal.classList.add('hidden');
