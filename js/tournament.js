// ─── Lógica del torneo ─────────────────────────
// Orden cronológico, propagación de ganadores a la siguiente ronda,
// y el auto-inicio (0-0) cuando comienza un partido.

import { auth } from './firebase.js';
import { ADMIN_EMAIL } from './config.js';
import { shortCode } from './utils.js';
import {
  dieciseisavos, octavos, cuartos, semifinales, tercerPuesto, final,
  datosFirebaseCargados, saveToFirebase
} from './data.js';
import { renderAll } from './render.js';

// ─── Orden cronológico automático ─────────────
// Convierte date:'Sáb 04/07' + time:'4:00 PM' en un objeto Date (año 2026).
// Si a un partido todavía no le has puesto fecha/hora (null), queda al final.
function parseDateTimeStr(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const m = dateStr.match(/(\d{2})\/(\d{2})/);
  const t = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m || !t) return null;
  const day = +m[1], month = +m[2] - 1;
  let hour = +t[1] % 12;
  if (t[3].toUpperCase() === 'PM') hour += 12;
  const minute = +t[2];
  return new Date(2026, month, day, hour, minute);
}
function sortByDateTime(arr) {
  arr.sort((a, b) => {
    const da = parseDateTimeStr(a.date, a.time);
    const db = parseDateTimeStr(b.date, b.time);
    if (!da && !db) return 0;
    if (!da) return 1;   // sin fecha → al final
    if (!db) return -1;
    return da - db;
  });
  return arr;
}
// Llama esto cada vez que quieras reordenar todas las rondas que ya tengan
// fecha/hora asignada. Las rondas sin fechas (ej. cuartos sin definir aún)
// simplemente no se mueven porque parseDateTimeStr devuelve null.
export function sortAllRounds() {
  [dieciseisavos, octavos, cuartos, semifinales, tercerPuesto, final].forEach(sortByDateTime);
}
// Nota: no se llama aquí a nivel de módulo (causaba un error de dependencia
// circular con data.js). renderAll() ya invoca sortAllRounds() antes de
// pintar, así que el orden inicial sigue garantizado igual.

// ─── Auto 0-0 al comenzar el partido ─────────
function parseMatchDateTime(match) {
  if (!match.date || !match.time) return null;
  const m = match.date.match(/(\d{2})\/(\d{2})/);
  const t = match.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m || !t) return null;
  let day = +m[1], month = +m[2] - 1;
  let hour = +t[1] % 12;
  if (t[3].toUpperCase() === 'PM') hour += 12;
  const minute = +t[2];
  if (!datosFirebaseCargados) return;
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return;

  const now = new Date();
  return new Date(now.getFullYear(), month, day, hour, minute);
}

// Calcula la nueva hora de un partido marcado "Retrasado" cuando el admin
// definió una hora nueva (la fecha es opcional: si no se puso, se asume hoy).
// Si no hay hora nueva definida, devuelve null (sigue pausado indefinidamente).
function parseEstadoDateTime(match) {
  if (!match.estadoManualHora) return null;
  const t = match.estadoManualHora.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!t) return null;
  let hour = +t[1] % 12;
  if (t[3].toUpperCase() === 'PM') hour += 12;
  const minute = +t[2];

  if (!datosFirebaseCargados) return;
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return;

  const now = new Date();
  if (match.estadoManualFecha) {
    const m = match.estadoManualFecha.match(/(\d{2})\/(\d{2})/);
    if (m) {
      const day = +m[1], month = +m[2] - 1;
      return new Date(now.getFullYear(), month, day, hour, minute);
    }
  }
  // Sin fecha (o fecha en formato libre) → se asume el mismo día de hoy.
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
}

// Revisa partidos "Retrasado" con hora nueva definida y, al llegar esa hora,
// los reactiva automáticamente (0-0) y los devuelve a estado automático.
// "Suspendido" nunca se auto-reanuda: siempre requiere confirmación manual.
function checkRetrasados() {
  const now = new Date();
  let changed = false;
  // Se arma aquí adentro (no a nivel de módulo) para evitar el mismo error
  // de dependencia circular con data.js que ya tenían mapeado en este archivo.
  const todasLasRondas = [dieciseisavos, octavos, cuartos, semifinales, tercerPuesto, final];

  todasLasRondas.forEach(ronda => {
    ronda.forEach(match => {
      if (match.estadoManual !== 'retrasado') return;
      const nuevaHora = parseEstadoDateTime(match);
      if (!nuevaHora) return;

      if (now >= nuevaHora) {
        if (match.score1 === null) match.score1 = 0;
        if (match.score2 === null) match.score2 = 0;
        match.autoStarted = true;
        match.estadoManual = null;
        match.estadoManualFecha = null;
        match.estadoManualHora = null;
        changed = true;
      }
    });
  });

  return changed;
}

// Revisa cada minuto si hay partidos que deben iniciarse con 0-0
export async function checkAutoStart() {

  const now = new Date();
  let changed = false;

  dieciseisavos.forEach(match => {
    if (match.autoStarted) return;
    if (match.finished) return;
    if (match.score1 !== null || match.score2 !== null) return;
    if (match.estadoManual) return; // retrasado/suspendido: pausa el auto-inicio

    const gameTime = parseMatchDateTime(match);
    if (!gameTime) return;

    if (now >= gameTime) {
      match.score1 = 0;
      match.score2 = 0;
      match.autoStarted = true;
      changed = true;
    }
  });

  if (checkRetrasados()) changed = true;

  if (changed) {
    renderAll();
    try{
      await saveToFirebase();
    } catch(_) {}
    // Si no hubo permisos, evitamos reintentar continuamente desde este navegador.
    dieciseisavos.forEach(m=>{ if(m.score1===0&&m.score2===0&&m.autoStarted){} });
  }
}

// ─── Lógica de avance ─────────────────────────
// Solo avanza si el partido está marcado como finalizado
function getAdvancing(match, type='ganador') {
  if (!match.finished) return null; // ← CAMBIO CLAVE: requiere finished=true
  if (match.score1 === null || match.score2 === null) return null;
  if (match.score1 > match.score2) return {team:match.team1, flag:match.flag1};
  if (match.score2 > match.score1) return {team:match.team2, flag:match.flag2};
  if (match.pen1 !== null && match.pen2 !== null) {
    if (type === 'ganador') {
      if (match.pen1 > match.pen2) return {team:match.team1, flag:match.flag1};
      if (match.pen2 > match.pen1) return {team:match.team2, flag:match.flag2};
    } else {
      if (match.pen1 < match.pen2) return {team:match.team1, flag:match.flag1};
      if (match.pen2 < match.pen1) return {team:match.team2, flag:match.flag2};
    }
  }
  return null;
}

function updateNextRound(nextRound, prevRound) {
  nextRound.forEach(nm => {
    const [s1,s2] = nm.srcMatches;
    const m1=prevRound.find(m=>m.id===s1);
    const m2=prevRound.find(m=>m.id===s2);
    const adv1=getAdvancing(m1,nm.type||'ganador');
    const adv2=getAdvancing(m2,nm.type||'ganador');

    const prevIsRound = prevRound !== dieciseisavos;

    if(adv1){
      nm.team1=adv1.team; nm.flag1=adv1.flag;
    }else if(prevIsRound){
      nm.team1=null; nm.flag1=null;
    }else{
      nm.team1=`Ganador ${shortCode(m1.team1)} vs ${shortCode(m1.team2)}`; nm.flag1=null;
    }

    if(adv2){
      nm.team2=adv2.team; nm.flag2=adv2.flag;
    }else if(prevIsRound){
      nm.team2=null; nm.flag2=null;
    }else{
      nm.team2=`Ganador ${shortCode(m2.team1)} vs ${shortCode(m2.team2)}`; nm.flag2=null;
    }

    if (!nm.team1||!nm.team2) { nm.score1=nm.score2=nm.pen1=nm.pen2=null; nm.finished=false; }
  });
}
export function propagateAll() {
  updateNextRound(octavos,      dieciseisavos);
  updateNextRound(cuartos,      octavos);
  updateNextRound(semifinales,  cuartos);
  updateNextRound(tercerPuesto, semifinales);
  updateNextRound(final,        semifinales);
}
