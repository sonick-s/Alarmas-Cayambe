// Importar autenticación de Firebase desde la configuración centralizada
import { auth } from "./firebaseConfig.js";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Proveedor de autenticación de Google
const googleProvider = new GoogleAuthProvider();

// Login con email y contraseña
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      redirigirDashboard();
    })
    .catch((error) => {
      alert('Error de inicio de sesión: ' + error.message);
    });
});

// Login con Google
document.getElementById('googleLogin').addEventListener('click', function() {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      redirigirDashboard();
    })
    .catch((error) => {
      alert('Error de inicio de sesión con Google: ' + error.message);
    });
});

function redirigirDashboard() {
  window.location.href = 'src/html/vistaAlarmas.html';
}

// Verificar estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Usuario autenticado:', user.email);
  } else {
    console.log('No hay usuario autenticado');
  }
});