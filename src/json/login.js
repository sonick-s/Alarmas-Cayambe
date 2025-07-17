// Configuración de Firebase (proyecto alarmasmart-204e2)
const firebaseConfig = {
  apiKey: "AIzaSyAsG8KqXW8-kyEgKfoFmHRD9SLcsplXXEg",
  authDomain: "alarmasmart-204e2.firebaseapp.com",
  databaseURL: "https://alarmasmart-204e2-default-rtdb.firebaseio.com",
  projectId: "alarmasmart-204e2",
  storageBucket: "alarmasmart-204e2.firebasestorage.app",
  messagingSenderId: "949843163488",
  appId: "1:949843163488:web:331c275413ad01250dc605",
  measurementId: "G-3F4M51TM9H"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Proveedor de autenticación de Google
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Login con email y contraseña
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      redirigirDashboard();
    })
    .catch((error) => {
      alert('Error de inicio de sesión: ' + error.message);
    });
});

// Login con Google
document.getElementById('googleLogin').addEventListener('click', function() {
  firebase.auth().signInWithPopup(googleProvider)
    .then((result) => {
      redirigirDashboard();
    })
    .catch((error) => {
      alert('Error de inicio de sesión con Google: ' + error.message);
    });
});

function redirigirDashboard() {
  window.location.href = 'src/html/agregarAlarma.html';
}

// Verificar estado de autenticación
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log('Usuario autenticado:', user.email);
  } else {
    console.log('No hay usuario autenticado');
  }
});
 