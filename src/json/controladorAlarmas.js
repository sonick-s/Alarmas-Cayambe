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

    // Mover el control de zoom a la parte inferior derecha
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.doubleClickZoom.disable();
    map.touchZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    document.getElementById('loading').style.display = 'none';
    loadLocations();
}

window.addEventListener('load', initMap);
window.addEventListener('resize', function () {
    if (map) {
        map.invalidateSize();
    }
});
