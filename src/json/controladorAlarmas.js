import { createAlarma, subscribeAlarmas, getAlarmaById, updateAlarma, getAllAlarmas } from "./crudAlarmas.js";
let map;
let markerAlarma = null; // marcador global para la alarma actual
let grupoMarcadores = null;
// Inicializar el mapa
function initMap() {
    //Ubicacion ecuador CAYAMBE
    const ecuadorLat = 0.04103;
    const ecuadorLng = -78.14636;

    // Definir capas base
    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       
    });
    const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
       
    });

    const baseLayers = {
        "OpenStreetMap": openStreetMap,
        "Satélite Esri": esriSat
    };

    map = L.map('map', { zoomControl: false, layers: [openStreetMap] }).setView([ecuadorLat, ecuadorLng], 7);

    L.control.layers(baseLayers).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.doubleClickZoom.disable();
    map.touchZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    document.getElementById('loading').style.display = 'none';
}


window.addEventListener('load', () => {
    initMap();
    cargarYRenderizarAlarmas();
});
window.addEventListener('resize', function () {
    if (map) {
        map.invalidateSize();
    }
});



// Función para suscribirse y renderizar alarmas
function cargarYRenderizarAlarmas() {
    subscribeAlarmas(renderizarAlarmas);
}

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

    if (window.idAlarmaEditar) {
        // EDITAR
        updateAlarma(window.idAlarmaEditar, alarma).then((ok) => {
            if (ok) {
                alert("Ubicación actualizada correctamente");
                closeLocationModal();
                form.reset();
                window.idAlarmaEditar = null;
            } else {
                alert("Error al actualizar la ubicación");
            }
        });
    } else {
        // CREAR
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
}

window.capturarDatosForm = capturarDatosForm;

// Importar Nav.html en el contenedor correspondiente
fetch('Nav.html')
.then(response => response.text())
.then(html => {
  document.getElementById('nav-container').innerHTML = html;
});

// Función para renderizar tarjetas de alarmas en el contenedor
function renderizarAlarmas(alarmasObj) {
    // Función para mostrar un punto en el mapa
    function mostrarPuntoEnMapa(lat, lng, popupHtml = null) {
        if (!map) return;
        if (map._grupoMarcadoresLayer) {
            map.removeLayer(map._grupoMarcadoresLayer);
        }
        if (markerAlarma) {
            map.removeLayer(markerAlarma);
        }
        markerAlarma = L.marker([lat, lng]).addTo(map);
        if (popupHtml) {
            markerAlarma.bindPopup(popupHtml).openPopup();
        }
        map.setView([lat, lng], 15);
    }

    window.abrirModalEditar = async function(id) {
        openLocationModal();
        if (typeof getAlarmaById === 'function') {
            const alarma = await getAlarmaById(id);
            if (alarma) {
                document.getElementById('locationName').value = alarma.name || '';
                document.getElementById('locationDescription').value = alarma.description || '';
                document.getElementById('locationIp').value = alarma.ip || '';
                document.getElementById('locationLat').value = alarma.lat || '';
                document.getElementById('locationLng').value = alarma.lng || '';
                window.idAlarmaEditar = id;
                console.log("ID de la alarma a editar:", id);
            }
        } else {
            console.error('No se pudo cargar la alarma');
        }
    }

    const contenedor = document.getElementById('contenedor-alarmas');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    if (!alarmasObj) return;
    Object.entries(alarmasObj).forEach(([id, alarma]) => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'info-card';
        tarjeta.innerHTML = `
            <ul style="font-size:0.95em; color:#333; list-style:none; padding:0;">
                <li><b>Nombre:</b> ${alarma.name || ''}</li>
                <li><b>Info:</b> ${alarma.description || ''}</li>
                <li><b>IP:</b> ${alarma.ip || ''}</li>
                <li><b>Fecha:</b> ${alarma.timestamp ? new Date(alarma.timestamp).toLocaleString() : ''}</li>
            </ul>
            <div style="display:flex; justify-content:flex-end; align-items:right; gap:8px; margin-bottom:8px;">
                <button title="Ver ubicación" style="background:none; border:none; cursor:pointer; font-size:1.3em; padding:4px;">
                    <svg height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" />
                    </svg>
                </button>
                <button title="Editar" style="background:none; border:none; cursor:pointer; font-size:1.3em; padding:4px;" onclick="abrirModalEditar('${id}')">
                    <svg height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                </button>
            </div>
        `;
        // Botón "Ver ubicación"
        const verUbicacionBtn = tarjeta.querySelector('button[title="Ver ubicación"]');
        if (verUbicacionBtn) {
            verUbicacionBtn.addEventListener('click', () => {
                if (alarma.lat && alarma.lng) {
                    mostrarPuntoEnMapa(parseFloat(alarma.lat), parseFloat(alarma.lng), `<b>${alarma.name || ''}</b><br>${alarma.description || ''}`);
                } else {
                    alert('No hay coordenadas para esta alarma');
                }
            });
        }
        contenedor.appendChild(tarjeta);
    });
}

//Crea una funcion usando getAllAlarmas para mostrar las ubicaciones en el mapa al cargar el documento
window.addEventListener('load', () => {
    getAllAlarmas().then(alarmas => {
        if (!map) return;
        // Guardar las ubicaciones en la variable global grupoMarcadores
        grupoMarcadores = alarmas
            .filter(alarma => alarma.lat && alarma.lng)
            .map(alarma => ({
                lat: alarma.lat,
                lng: alarma.lng,
                name: alarma.name || '',
                description: alarma.description || ''
            }));
        // Mostrar por consola todas las ubicaciones usadas
        console.log('Ubicaciones usadas en el mapa:', grupoMarcadores);
        // Limpiar marcadores anteriores si existen
        if (map._grupoMarcadoresLayer) {
            map.removeLayer(map._grupoMarcadoresLayer);
        }
        // Crear grupo de marcadores
        const layerGroup = L.layerGroup();
        grupoMarcadores.forEach(ubi => {
            const marker = L.marker([parseFloat(ubi.lat), parseFloat(ubi.lng)])
                .bindPopup(`<b>${ubi.name}</b><br>${ubi.description}`);
            layerGroup.addLayer(marker);
        });
        layerGroup.addTo(map);
        map._grupoMarcadoresLayer = layerGroup;
        // NO mover la vista, mantener centrado en Ecuador
    });
});