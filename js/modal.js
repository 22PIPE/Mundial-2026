// ─── Modales de resultado y confirmación ──────
// Modal para ingresar el marcador y modal de confirmación
// "¿Finalizó el partido?" antes de avanzar el ganador.

import { saveToFirebase } from './data.js';
import { modoEdicion, renderAll } from './render.js';

// ─── UI refs ──────────────────────────────────
const resultModal    = document.getElementById('resultModal');
const form           = document.getElementById('form');
const team1Name      = document.getElementById('team1Name');
const team2Name      = document.getElementById('team2Name');
const team1NamePen   = document.getElementById('team1NamePen');
const team2NamePen   = document.getElementById('team2NamePen');
const team1Score     = document.getElementById('team1Score');
const team2Score     = document.getElementById('team2Score');
const team1Penalties = document.getElementById('team1Penalties');
const team2Penalties = document.getElementById('team2Penalties');
const cancelBtn      = document.getElementById('cancelBtn');
const finishModal    = document.getElementById('finishModal');
const finishYesBtn   = document.getElementById('finishYesBtn');
const finishNoBtn    = document.getElementById('finishNoBtn');

let currentMatch = null;

// ─── Modal resultado ──────────────────────────
export function openResultForm(match, container) {
  currentMatch={match,container};
  team1Name.textContent=team1NamePen.textContent=match.team1;
  team2Name.textContent=team2NamePen.textContent=match.team2;
  team1Score.value    = match.score1!==null?match.score1:'';
  team2Score.value    = match.score2!==null?match.score2:'';
  team1Penalties.value= match.pen1!==null?match.pen1:'';
  team2Penalties.value= match.pen2!==null?match.pen2:'';
  const clearBtn = document.getElementById("clearResultBtn");

const tieneMarcador =
    match.score1 !== null ||
    match.score2 !== null ||
    match.pen1 !== null ||
    match.pen2 !== null;

clearBtn.style.display = tieneMarcador ? "inline-block" : "none";
  resultModal.style.display='flex';
  document.body.style.overflow='hidden';
}
function closeResultForm() {
    resultModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Datos temporales del marcador antes de la confirmación
let pendingScore = null;

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!modoEdicion) return;
  const s1=parseInt(team1Score.value);
  const s2=parseInt(team2Score.value);
  const p1=team1Penalties.value===''?null:parseInt(team1Penalties.value);
  const p2=team2Penalties.value===''?null:parseInt(team2Penalties.value);
  if (isNaN(s1)||isNaN(s2)) { alert('Ingresa goles válidos.'); return; }

  // Guardar datos temporales y mostrar modal de confirmación
  pendingScore = { s1, s2, p1, p2 };
  closeResultForm();
  finishModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
});

// Usuario dice: SÍ, finalizó el partido
finishYesBtn.addEventListener('click', async () => {
  if (!pendingScore) return;
  const { s1, s2, p1, p2 } = pendingScore;
  currentMatch.match.score1   = s1;
  currentMatch.match.score2   = s2;
  currentMatch.match.pen1     = p1;
  currentMatch.match.pen2     = p2;
  currentMatch.match.finished = true;  // ← marca como finalizado
  pendingScore = null;
  finishModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  renderAll();
  await saveToFirebase();
  currentMatch = null;
  pendingScore = null;
});

// Usuario dice: NO, es marcador parcial
finishNoBtn.addEventListener('click', async () => {
  if (!pendingScore) return;
  const { s1, s2, p1, p2 } = pendingScore;
  currentMatch.match.score1   = s1;
  currentMatch.match.score2   = s2;
  currentMatch.match.pen1     = p1;
  currentMatch.match.pen2     = p2;
  currentMatch.match.finished = false; // ← NO finalizado, sigue en vivo
  pendingScore = null;
  finishModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  renderAll();
  await saveToFirebase();
  currentMatch = null;
  pendingScore = null;
});
cancelBtn.addEventListener("click", closeResultForm);

document.getElementById("clearResultBtn").addEventListener("click", async () => {

    if (!currentMatch) return;

    if (!confirm("¿Deseas borrar completamente este marcador?")) return;

    currentMatch.match.score1 = null;
    currentMatch.match.score2 = null;
    currentMatch.match.pen1 = null;
    currentMatch.match.pen2 = null;

    currentMatch.match.finished = false;
    currentMatch.match.autoStarted = false;

    pendingScore = null;

    renderAll();

    await saveToFirebase();

    closeResultForm();

});

resultModal.addEventListener('click', e=>{
    if(e.target===resultModal) closeResultForm();
});

finishModal.addEventListener('click', e=>{
    if(e.target===finishModal){
        finishModal.style.display='none';
        document.body.style.overflow='auto';
    }
});
