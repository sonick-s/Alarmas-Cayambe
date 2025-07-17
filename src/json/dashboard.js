// dashboard.js (Cargar Firebase desde otro archivo)

// Importar Firebase desde firebaseConfig.js
import { auth, db } from "./firebaseConfig.js";
import { ref, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

console.log("Firebase cargado correctamente:", auth, db);

let map = null;
let currentUser = null;
let markers = new L.LayerGroup();

// Verificar autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        document.getElementById('operatorInfo').textContent = `Operador: ${user.email}`;
        initializeMap();
        loadAlerts();
    } else {
        window.location.href = 'index.html';
    }
});

const defaultIcon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

const selectedIcon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png",
    iconSize: [30, 45], // Hacerlo un poco más grande
    iconAnchor: [15, 45],
    popupAnchor: [1, -34]
});

// Cargar alertas desde Firebase Realtime Database
function loadAlerts() {
    const alertsList = document.getElementById('alertsList');
    const alertsRef = ref(db, "alerts");
    const contactsRef = ref(db, "contactos");


    onValue(alertsRef, (alertsSnapshot) => {
        if (!alertsSnapshot.exists()) {
            console.log("No hay alertas en la base de datos.");
            alertsList.innerHTML = "<p>No hay alertas activas</p>";
            return;
        }

        alertsList.innerHTML = '';
        markers.clearLayers();

        //Obtener contactos
        onValue(contactsRef, (contactsSnapshot) => {
            const contactsData = Object.values(contactsSnapshot.val() || {})[0] || {};  // Almacena los contactos

        alertsSnapshot.forEach((childSnapshot) => {
            const alertData = childSnapshot.val();
            console.log("Alerta recibida:", alertData);

            const lat = parseFloat(alertData.latitude);
            const lng = parseFloat(alertData.longitude);

            if (isNaN(lat) || isNaN(lng)) {
                console.error("Coordenadas inválidas para la alerta:", alertData);
                return; // Omitir si las coordenadas no son válidas
            }

             // Tomar el primer contacto de emergencia (si existe)
            const firstContactKey = Object.keys(contactsData)[0]; // Suponiendo que hay un solo contacto
            const contactInfo = firstContactKey ? contactsData[firstContactKey] : { nombre: "Desconocido", numero: "N/A" };
            const alert = {
                id: childSnapshot.key,
                time: alertData.time,
                date: alertData.date,
                address: alertData.address,
                coords: [lat,lng],
                contact: contactInfo.nombre,
                phone: contactInfo.numero    // Si no hay datos de teléfono
            };

            const alertElement = createAlertElement(alert);
            alertsList.appendChild(alertElement);
            const marker = L.marker(alert.coords)
            .bindPopup(`<b>Alerta #${alert.id}</b><br>${alert.address}`)
            .addTo(markers);

            marker.on('click', () => {
                showAlertDetails(alert);
                map.setView(alert.coords, 20); // Centrar el mapa en la alerta
            });
    });
}, (error) => {
    console.error("Error al obtener alertas:", error);
});
}, (error) => {
    console.error("Error al obtener alertas:", error);
    });
}

// Crear elemento de alerta
function createAlertElement(alert) {
    const div = document.createElement('div');
    div.className = 'alert-item';
    div.innerHTML = `
        <div class="alert-id">Alerta #${alert.id}</div>
        <div class="alert-time">${alert.date}, ${alert.time}</div>
        <div class="alert-address">${alert.address}</div>
        <button class="attend-alert-btn" data-id="${alert.id}">Alerta Atendida</button>
    `;
    
    div.onclick = (e) => {
        if (!e.target.classList.contains('attend-alert-btn')) {
        showAlertDetails(alert);
        map.setView(alert.coords, 20);
        }
    };
    
    div.querySelector('.attend-alert-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        attendAlert(alert.id,div);
    });
    
    return div;
}

// Mostrar detalles de la alerta
function showAlertDetails(alert) {
    const detailsContent = document.querySelector('.details-content');
    detailsContent.innerHTML = `
        <p><strong>ID:</strong> ${alert.id}</p>
        <p><strong>Hora:</strong> ${alert.date}, ${alert.time}</p>
        <p><strong>Dirección:</strong> ${alert.address}</p>
        <p><strong>Coordenadas:</strong> ${alert.coords.join(', ')}</p>
        <p><strong>Contacto de Emergencia:</strong> ${alert.contact}</p>
        <p><strong>Teléfono:</strong> ${alert.phone}</p>
        <button id="deactivateAlertBtn" class="deactivate-alert-btn">Desactivar Alerta</button>
    `;

// Asignar evento al botón "Desactivar Alerta"
setTimeout(() => {
    const deactivateBtn = document.getElementById('deactivateAlertBtn');
    if (deactivateBtn) {
        deactivateBtn.onclick = () => {
            deactivateAlert(); // Llamar a la función para desactivar la alerta
        };
    } else {
        console.error("El botón para desactivar la alerta no se encontró en el DOM.");
    }
}, 0);
}

// Función para desactivar una alerta (actualizar estado en Firebase)
function deactivateAlert() {
const rootRef = ref(db);
const updateData = {
    emergencyState: false,
    ledState: 0
};

update(rootRef, updateData)
    .then(() => {
        console.log(`Alerta desactivada correctamente.`);
        alert(`La alerta ha sido desactivada.`);
        // Opcional: Actualiza visualmente el estado de la alerta o elimina el detalle
        const detailsContent = document.querySelector('.details-content');
        detailsContent.innerHTML = '<p>Selecciona una alerta para ver más detalles.</p>';
    })
    .catch((error) => {
        console.error(`Error al desactivar la alerta:`, error);
        alert('Error al desactivar la alerta. Intenta nuevamente.');
    });
}
// Función para marcar una alerta como atendida
function attendAlert(alertId, alertElement) {
    const alertRef = ref(db, `alerts/${alertId}`);
    remove(alertRef).then(() => {
        console.log(`Alerta ${alertId} eliminada correctamente.`);
        alertElement.remove(); // Eliminar de la lista de alertas visualmente
    }).catch((error) => {
        console.error("Error al eliminar la alerta:", error);
    });
}


// Configurar cierre de sesión
document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = '/src/html/index.html';
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
});
