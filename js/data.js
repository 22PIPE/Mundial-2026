// ─── Datos del torneo + sincronización con Firestore ──────────
// Aquí viven los datos iniciales de cada ronda y todo lo relacionado
// con guardar/leer el estado en Firebase.

import { DOCREF, auth, setDoc, onSnapshot } from './firebase.js';
import { ADMIN_EMAIL } from './config.js';
import { setSyncState, renderAll } from './render.js';
import { checkAutoStart } from './tournament.js';

// ─── Estado de sincronización ──────────────────
export let ignorarSnapshot = false;
export function setIgnorarSnapshot(v) { ignorarSnapshot = v; }

export let datosFirebaseCargados = false;
export function setDatosFirebaseCargados(v) { datosFirebaseCargados = v; }

// ─── Datos iniciales ──────────────────────────
export let dieciseisavos = [
  // Dom 28/06
  {id:9,  team1:'Sudáfrica',     flag1:'https://flagcdn.com/w40/za.png',     team2:'Canadá',            flag2:'https://flagcdn.com/w40/ca.png',   date:'Dom 28/06',time:'2:00 PM',  score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  // Lun 29/06
  {id:5,  team1:'Brasil',        flag1:'https://flagcdn.com/w40/br.png',     team2:'Japón',             flag2:'https://flagcdn.com/w40/jp.png',   date:'Lun 29/06',time:'12:00 PM', score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  {id:11, team1:'Alemania',      flag1:'https://flagcdn.com/w40/de.png',     team2:'Paraguay',          flag2:'https://flagcdn.com/w40/py.png',   date:'Lun 29/06',time:'3:30 PM',  score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  {id:7,  team1:'Países Bajos',  flag1:'https://flagcdn.com/w40/nl.png',     team2:'Marruecos',         flag2:'https://flagcdn.com/w40/ma.png',   date:'Lun 29/06',time:'8:00 PM',  score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  // Mar 30/06
  {id:15, team1:'Noruega',       flag1:'https://flagcdn.com/w40/no.png',     team2:'Costa de Marfil',   flag2:'https://flagcdn.com/w40/ci.png',   date:'Mar 30/06',time:'12:00 PM', score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  {id:4,  team1:'Francia',       flag1:'https://flagcdn.com/w40/fr.png',     team2:'Suecia',            flag2:'https://flagcdn.com/w40/se.png',   date:'Mar 30/06',time:'4:00 PM',  score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  {id:1,  team1:'México',        flag1:'https://flagcdn.com/w40/mx.png',     team2:'Ecuador',           flag2:'https://flagcdn.com/w40/ec.png',   date:'Mar 30/06',time:'8:00 PM',  score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  // Mié 01/07
  {id:6,  team1:'Inglaterra',    flag1:'https://flagcdn.com/w40/gb-eng.png', team2:'RD Congo',          flag2:'https://flagcdn.com/w40/cd.png',   date:'Mié 01/07',time:'11:00 AM', score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  {id:12, team1:'Bélgica',       flag1:'https://flagcdn.com/w40/be.png',     team2:'Senegal',           flag2:'https://flagcdn.com/w40/sn.png',   date:'Mié 01/07',time:'3:00 PM',  score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  {id:8,  team1:'EE. UU.',       flag1:'https://flagcdn.com/w40/us.png',     team2:'Bosnia-Herzegovina',flag2:'https://flagcdn.com/w40/ba.png',   date:'Mié 01/07',time:'7:00 PM',  score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  // Jue 02/07
  {id:2,  team1:'España',        flag1:'https://flagcdn.com/w40/es.png',     team2:'Austria',           flag2:'https://flagcdn.com/w40/at.png',   date:'Jue 02/07',time:'2:00 PM',  score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  {id:10, team1:'Portugal',      flag1:'https://flagcdn.com/w40/pt.png',     team2:'Croacia',           flag2:'https://flagcdn.com/w40/hr.png',   date:'Jue 02/07',time:'6:00 PM',  score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  {id:14, team1:'Suiza',         flag1:'https://flagcdn.com/w40/ch.png',     team2:'Argelia',           flag2:'https://flagcdn.com/w40/dz.png',   date:'Jue 02/07',time:'10:00 PM', score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  // Vie 03/07
  {id:16, team1:'Australia',     flag1:'https://flagcdn.com/w40/au.png',     team2:'Egipto',            flag2:'https://flagcdn.com/w40/eg.png',   date:'Vie 03/07',time:'1:00 PM',  score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  {id:3,  team1:'Argentina',     flag1:'https://flagcdn.com/w40/ar.png',     team2:'Cabo Verde',        flag2:'https://flagcdn.com/w40/cv.png',   date:'Vie 03/07',time:'5:00 PM',  score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false},
  {id:13, team1:'Colombia',      flag1:'https://flagcdn.com/w40/co.png',     team2:'Ghana',             flag2:'https://flagcdn.com/w40/gh.png',   date:'Vie 03/07',time:'8:30 PM',  score1:null,score2:null,pen1:null,pen2:null,finished:false,autoStarted:false}
];
export let octavos = [
  {id:101,srcMatches:[11,4], team1:null,flag1:null,team2:null,flag2:null,date:'Sáb 04/07',time:'4:00 PM',score1:null,score2:null,pen1:null,pen2:null,finished:false},
  {id:102,srcMatches:[9,7],  team1:null,flag1:null,team2:null,flag2:null,date:'Sáb 04/07',time:'12:00 PM',score1:null,score2:null,pen1:null,pen2:null,finished:false},
  {id:103,srcMatches:[10,2], team1:null,flag1:null,team2:null,flag2:null,date:'Lun 06/07',time:'2:00 PM',score1:null,score2:null,pen1:null,pen2:null,finished:false},
  {id:104,srcMatches:[8,12], team1:null,flag1:null,team2:null,flag2:null,date:'Lun 06/07',time:'7:00 PM',score1:null,score2:null,pen1:null,pen2:null,finished:false},
  {id:105,srcMatches:[5,15], team1:null,flag1:null,team2:null,flag2:null,date:'Dom 05/07',time:'3:00 PM',score1:null,score2:null,pen1:null,pen2:null,finished:false},
  {id:106,srcMatches:[1,6],  team1:null,flag1:null,team2:null,flag2:null,date:'Dom 05/07',time:'7:00 PM',score1:null,score2:null,pen1:null,pen2:null,finished:false},
  {id:107,srcMatches:[3,16], team1:null,flag1:null,team2:null,flag2:null,date:'Mar 07/07',time:'11:00 AM',score1:null,score2:null,pen1:null,pen2:null,finished:false},
  {id:108,srcMatches:[14,13],team1:null,flag1:null,team2:null,flag2:null,date:'Mar 07/07',time:'3:00 PM',score1:null,score2:null,pen1:null,pen2:null,finished:false},
];
export let cuartos = [
  {id:201,srcMatches:[101,102],team1:null,flag1:null,team2:null,flag2:null,score1:null,score2:null,pen1:null,pen2:null,finished:false},
  {id:202,srcMatches:[103,104],team1:null,flag1:null,team2:null,flag2:null,score1:null,score2:null,pen1:null,pen2:null,finished:false},
  {id:203,srcMatches:[105,106],team1:null,flag1:null,team2:null,flag2:null,score1:null,score2:null,pen1:null,pen2:null,finished:false},
  {id:204,srcMatches:[107,108],team1:null,flag1:null,team2:null,flag2:null,score1:null,score2:null,pen1:null,pen2:null,finished:false}
];
export let semifinales = [
  {id:301,srcMatches:[201,202],team1:null,flag1:null,team2:null,flag2:null,score1:null,score2:null,pen1:null,pen2:null,finished:false},
  {id:302,srcMatches:[203,204],team1:null,flag1:null,team2:null,flag2:null,score1:null,score2:null,pen1:null,pen2:null,finished:false}
];
export let tercerPuesto = [
  {id:401,srcMatches:[301,302],type:'perdedor',team1:null,flag1:null,team2:null,flag2:null,score1:null,score2:null,pen1:null,pen2:null,finished:false}
];
export let final = [
  {id:501,srcMatches:[301,302],type:'ganador',team1:null,flag1:null,team2:null,flag2:null,score1:null,score2:null,pen1:null,pen2:null,finished:false}
];

// ─── Firestore: guardar ───────────────────────
function cleanMatch(m) {
  return {
    id:m.id, team1:m.team1??null, flag1:m.flag1??null,
    team2:m.team2??null, flag2:m.flag2??null,
    score1:m.score1??null, score2:m.score2??null,
    pen1:m.pen1??null, pen2:m.pen2??null,
    finished: m.finished ?? false,
    autoStarted: m.autoStarted ?? false,
    date:m.date??null,
    time:m.time??null,
    ...(m.srcMatches?{srcMatches:m.srcMatches}:{}),
    ...(m.type?{type:m.type}:{})
  };
}

export async function saveToFirebase() {
  setSyncState('saving');
  ignorarSnapshot = true;
  try {
    await setDoc(DOCREF, {
      dieciseisavos: dieciseisavos.map(cleanMatch),
      octavos:       octavos.map(cleanMatch),
      cuartos:       cuartos.map(cleanMatch),
      semifinales:   semifinales.map(cleanMatch),
      tercerPuesto:  tercerPuesto.map(cleanMatch),
      final:         final.map(cleanMatch)
    });
    setSyncState('online');
  } catch(e) {
    console.error('Error guardando:', e);
    if (e?.code==='permission-denied' || e?.code==='permission-denied') {
      setSyncState('online');
    } else {
      setSyncState('offline');
    }
  }
  setTimeout(() => { ignorarSnapshot = false; }, 1500);
}

// ─── Firestore: escuchar ──────────────────────
function mergeFromCloud(cloudArr, localArr) {
  cloudArr.forEach(cm => {
    const lm = localArr.find(x => x.id === cm.id);
    if (!lm) return;
    lm.team1=cm.team1??lm.team1; lm.flag1=cm.flag1??lm.flag1;
    lm.team2=cm.team2??lm.team2; lm.flag2=cm.flag2??lm.flag2;
    lm.score1=cm.score1??null;   lm.score2=cm.score2??null;
    lm.pen1=cm.pen1??null;       lm.pen2=cm.pen2??null;
    lm.finished = cm.finished ?? false;
    lm.autoStarted = cm.autoStarted ?? lm.autoStarted ?? false;
  });
}

export function startListening() {
  onSnapshot(DOCREF, snap => {
    if (ignorarSnapshot) return;
    if (snap.exists()) {
      const data = snap.data();
      const map  = { dieciseisavos, octavos, cuartos, semifinales, tercerPuesto, final };
      Object.keys(map).forEach(k => {
        if (Array.isArray(data[k])) mergeFromCloud(data[k], map[k]);
      });
      datosFirebaseCargados = true;
      renderAll();

      const user = auth.currentUser;
      if (user && user.email === ADMIN_EMAIL) {
        checkAutoStart();
      }
    }
    setSyncState('online');
  }, err => {
    console.error(err);
    setSyncState('offline');
  });
}
