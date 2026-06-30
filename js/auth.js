// ─── Autenticación y menú admin ────────────────
// Login con Google, modo invitado, menú de administrador y reinicio del torneo.

import { auth, provider, DOCREF, signInWithPopup, signOut, onAuthStateChanged, deleteDoc } from './firebase.js';
import { ADMIN_EMAIL } from './config.js';
import { setModoEdicion, renderAll } from './render.js';
import { checkAutoStart } from './tournament.js';

// ─── UI refs ──────────────────────────────────
const loginModal = document.getElementById('loginModal');
const loginError = document.getElementById('loginError');

// ─── Auth ─────────────────────────────────────
function habilitarEdicion(valor) {
  setModoEdicion(valor);
  renderAll();
}
function actualizarMenuAdmin(user) {
  const menuGuest = document.getElementById('menuGuest');
  const menuAdmin = document.getElementById('menuAdmin');
  const adminLabel= document.getElementById('adminLabel');
  if (user && user.email === ADMIN_EMAIL) {
    menuGuest.classList.add('hidden');
    menuAdmin.classList.remove('hidden');
    document.getElementById('userPhoto').src = user.photoURL || '';
    document.getElementById('userName').textContent = user.displayName || user.email;
    adminLabel.textContent = '✏️ Admin';
    habilitarEdicion(true);
  } else {
    menuGuest.classList.remove('hidden');
    menuAdmin.classList.add('hidden');
    adminLabel.textContent = 'Admin';
    habilitarEdicion(false);
  }
}
onAuthStateChanged(auth, async user => {
  actualizarMenuAdmin(user);
  if (user) {
    loginModal.classList.add('hidden');
    await checkAutoStart();
  }
});

document.getElementById('googleLoginBtn').addEventListener('click', async () => {
  loginError.style.display = 'none';
  try {
    const result = await signInWithPopup(auth, provider);
    const user   = result.user;
    if (user.email !== ADMIN_EMAIL) {
      await signOut(auth);
      loginError.style.display = 'block';
      loginError.textContent   = `⛔ La cuenta ${user.email} no tiene permisos de edición.`;
      return;
    }
    loginModal.classList.add('hidden');
    } catch(e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      loginError.style.display='block';
      loginError.textContent='Error al iniciar sesión. Intenta de nuevo.';
      console.error(e);
    }
  }
});
document.getElementById('guestBtn').addEventListener('click', () => {
  loginModal.classList.add('hidden');
    habilitarEdicion(false);
});
document.getElementById('adminToggle').onclick = () => {
  const m = document.getElementById('adminMenu');
  m.style.display = m.style.display==='block' ? 'none' : 'block';
};
document.getElementById('openLogin').onclick = () => {
  document.getElementById('adminMenu').style.display = 'none';
  loginModal.classList.remove('hidden');
};
document.getElementById('logoutBtn').onclick = async () => {
  await signOut(auth);
  document.getElementById('adminMenu').style.display = 'none';
};
document.getElementById('resetBtn').onclick = async () => {
  if (!confirm('¿Reiniciar Mundial? Esto borrará todos los resultados en la nube.')) return;
  try {
    await deleteDoc(DOCREF);
    location.reload();
  } catch(e) {
    console.error('Error al reiniciar:', e);
    alert('Error al reiniciar. Revisa la consola.');
  }
};
