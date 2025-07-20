import { createAlarma} from "./crudAlarmas.js";
let map;
let locations = [];
let currentLayer = 'street';
let isSidebarOpen = false;
let editingLocationId = null;
let tempMarker = null;

// Inicializar el mapa
function initMap() {
    const ecuadorLat = -1.831239;
    const ecuadorLng = -78.183406;

    map = L.map('map', { zoomControl: false }).setView([ecuadorLat, ecuadorLng], 7);  // Desactiva los controles de zoom

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.doubleClickZoom.disable();
    map.touchZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    document.getElementById('loading').style.display = 'none';

}

function updateMarkers(alarmasData) {
    if (!window.markersLayer) {
        window.markersLayer = L.layerGroup().addTo(map);
    } else {
        window.markersLayer.clearLayers();
    }
    if (!alarmasData) return;
    Object.entries(alarmasData).forEach(([id, alarma]) => {
        if (alarma.lat && alarma.lng) {
            const popupHtml = `<b>${alarma.name}</b><br>${alarma.description || ''}` +
                `<br><b>IP:</b> ${alarma.ip || ''}` +
                `<br><b>Estado:</b> ${alarma.estado ? 'Activo' : 'Inactivo'}` +
                `<br><b>Fecha:</b> ${alarma.timestamp ? new Date(alarma.timestamp).toLocaleString() : ''}`;
            const marker = L.marker([parseFloat(alarma.lat), parseFloat(alarma.lng)])
                .bindPopup(popupHtml);
            window.markersLayer.addLayer(marker);
        }
    });
}

window.addEventListener('load', initMap);
window.addEventListener('resize', function () {
    if (map) {
        map.invalidateSize();
    }
});

// Importar Nav.html en el contenedor correspondiente
fetch('Nav.html')
.then(response => response.text())
.then(html => {
  document.getElementById('nav-container').innerHTML = html;
});



//Funciones para el Modal de agregar ubicaciones
function openLocationModal() {
    document.getElementById("locationModal").style.display = "block";
}
window.openLocationModal = openLocationModal;

function closeLocationModal() {
    document.getElementById("locationModal").style.display = "none";
}
window.closeLocationModal = closeLocationModal;

function capturarDatosForm(event){
    event.preventDefault();
    const form = document.getElementById("locationForm");
    const data = new FormData(form);
    const alarma = {};
    for (let [key, value] of data.entries()) {
        alarma[key] = value;
    }
    // Agregar fecha actual y estado false
    alarma.timestamp = new Date().toISOString();
    alarma.estado = false;
    console.log("Datos a guardar:", alarma);
    createAlarma(alarma).then((id) => {
        if (id) {
            alert("Ubicación guardada correctamente");
            closeLocationModal();
            form.reset();
        } else {
            alert("Error al guardar la ubicación");
        }
    });
}
window.capturarDatosForm = capturarDatosForm;