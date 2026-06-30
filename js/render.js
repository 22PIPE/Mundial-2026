// ─── Render del bracket ────────────────────────
// Pinta los partidos en el DOM, maneja el estado de "modo edición"
// y el indicador de sincronización con Firebase.

import {
  dieciseisavos, octavos, cuartos, semifinales, tercerPuesto, final
} from './data.js';
import { sortAllRounds, propagateAll } from './tournament.js';
import { openResultForm } from './modal.js';

// ─── Modo edición (solo el admin puede editar) ─
export let modoEdicion = false;
export function setModoEdicion(valor) {
  modoEdicion = valor;
}

// ─── Sync indicator ───────────────────────────
const dot   = document.getElementById('syncDot');
const label = document.getElementById('syncLabel');

export function setSyncState(state) {
  dot.className = state;
  label.textContent = { online:'Sincronizado', saving:'Guardando…', offline:'Sin conexión' }[state] ?? '';
}

// ─── UI refs de las rondas ─────────────────────
const round32Div     = document.getElementById('round32');
const round16Div     = document.getElementById('round16');
const quartersDiv    = document.getElementById('quarterfinals');
const semifinalsDiv  = document.getElementById('semifinals');
const thirdPlaceDiv  = document.getElementById('thirdPlace');
const finalDiv       = document.getElementById('final');

// ─── Render ───────────────────────────────────
function getMatchDateInfo(match){
  if(!match.date&&!match.time) return {cls:'future',label:''};

  const m=match.date ? match.date.match(/(\d{2})\/(\d{2})/) : null;
  const t=match.time ? match.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i) : null;

  // Partidos de rondas posteriores sin fecha todavía
  if(!m||!t){
    if(match.finished) return {cls:'finished',label:'🔴 FINALIZADO'};
    if(match.score1!==null) return {cls:'live',label:'🟠 EN VIVO'};
    return {cls:'future',label:''};
  }

  let day=+m[1], month=+m[2]-1, hour=+t[1]%12;
  if(t[3].toUpperCase()==='PM') hour+=12;
  const minute=+t[2];
  const now=new Date();
  const game=new Date(now.getFullYear(),month,day,hour,minute);
  const start=new Date(game); start.setHours(0,0,0,0);
  const end=new Date(game);   end.setHours(23,59,59,999);

  // Si está explícitamente marcado como finalizado
  if(match.finished){
    return {cls:'finished',label:`🔴 FINALIZADO · ${String(day).padStart(2,'0')}/${String(month+1).padStart(2,'0')}`};
  }

  const liveEnd = new Date(game.getTime() + 3*60*60*1000);
  const today = now>=start && now<=end;

  if(today){
    if(now < game) return {cls:'today',label:`🟢 HOY · ${match.time}`};
    if(now < liveEnd){
      // Si tiene marcador (auto 0-0 o editado) y no finalizado: EN VIVO
      if(match.score1!==null) return {cls:'live',label:'🟠 EN VIVO'};
      return {cls:'live',label:'🟠 EN VIVO'};
    }
    // Pasó la ventana de 3h pero no se marcó como finalizado: en vivo aún
    if(match.score1!==null) return {cls:'live',label:'🟠 EN VIVO'};
    return {cls:'finished',label:`🔴 FINALIZADO · ${String(day).padStart(2,'0')}/${String(month+1).padStart(2,'0')}`};
  }

  // Partido pasado con marcador pero no finalizado = En vivo (actualización manual)
  if(now > game && match.score1!==null && !match.finished){
    return {cls:'live',label:'🟠 EN VIVO'};
  }

  return {cls:'future',label:`🕒 ${match.date} · ${match.time}`};
}

function renderMatches(container, matches) {
  container.querySelectorAll('.match').forEach(el=>el.remove());
  matches.forEach(match => {
    const div = document.createElement('div');
    div.className = 'match'+(modoEdicion?'':' disabled');
    div.dataset.id = match.id;
    const s1=(match.score1!==null&&match.team1)?match.score1:'-';
    const s2=(match.score2!==null&&match.team2)?match.score2:'-';
    const pen1=(match.pen1!==null&&match.pen2!==null)?`<span class="score-pen">(${match.pen1})</span>`:'';
    const pen2=(match.pen1!==null&&match.pen2!==null)?`<span class="score-pen">(${match.pen2})</span>`:'';
    // El ganador visual solo se muestra si el partido finalizó
    const w1=match.finished&&(match.score1!==null&&match.score2!==null)&&((match.score1>match.score2)||(match.score1===match.score2&&match.pen1!==null&&match.pen2!==null&&match.pen1>match.pen2));
    const w2=match.finished&&(match.score1!==null&&match.score2!==null)&&((match.score2>match.score1)||(match.score1===match.score2&&match.pen1!==null&&match.pen2!==null&&match.pen2>match.pen1));

    const dateInfo=getMatchDateInfo(match);
    const matchDate=dateInfo.label;
    div.innerHTML=`
${matchDate ? `<div class="match-date ${dateInfo.cls}">${matchDate}</div>` : ""}
      <div class="team">
        ${match.flag1?`<img class="flag" src="${match.flag1}" alt="${match.team1}"/>`:''}
        <span class="team-name">${match.team1||'Por definir'}</span>
        <span class="score ${w1?'winner':''}">${s1}</span>${pen1}
      </div>
      <div class="team">
        ${match.flag2?`<img class="flag" src="${match.flag2}" alt="${match.team2}"/>`:''}
        <span class="team-name">${match.team2||'Por definir'}</span>
        <span class="score ${w2?'winner':''}">${s2}</span>${pen2}
      </div>`;
    if (modoEdicion&&match.team1&&match.team2) {
      div.style.cursor='pointer';
      div.addEventListener('click',()=>openResultForm(match,container));
    }
    container.appendChild(div);
  });
}

export function renderAll() {
  sortAllRounds();
  propagateAll();
  renderMatches(round32Div,    dieciseisavos);
  renderMatches(round16Div,    octavos);
  renderMatches(quartersDiv,   cuartos);
  renderMatches(semifinalsDiv, semifinales);
  renderMatches(thirdPlaceDiv, tercerPuesto);
  renderMatches(finalDiv,      final);
}
