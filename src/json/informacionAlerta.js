import { getAllAlerts } from "./crudAlertas.js";

async function mostrarAlertas() {
  try {
    const alertitas = await getAllAlerts();
    return alertitas;
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    document.getElementById('alertsOutput').textContent = 'Error al obtener alertas.';
    return []; // Devuelve arreglo vacío si falla
  }
}

//Desde aqui empieza la funcion para mostrarla en las targetas y en el mapa
let map;
let marker;

document.addEventListener("DOMContentLoaded", async function () {
    const alertData = await getAllAlerts();
    const alertas = [];

    for (const id in alertData) {
        if (alertData.hasOwnProperty(id)) {
          const alerta = alertData[id];
          alertas.push({
            id: `#${id}`, // Agrego # al id para que coincida con tu formato
            fecha: `${alerta.date}, ${alerta.time}`,
            ubicacion: alerta.address,
            lat: alerta.latitude.toString(),
            lng: alerta.longitude.toString(),
            contacto: "Desconocido",  // app movil no envia el contacto
            telefono: "N/A"           // app movil no envia el telefono
          });
        }
      }

  initMap([0.046045, -78.202168], 16);
  createDefaultMarker(alertas[0]);

  const contenedor = document.getElementById("contenedor-alertas");
  alertas.forEach(alerta => {
    const tarjeta = crearTarjetaAlerta(alerta);
    contenedor.appendChild(tarjeta);
  });

  // Función para inicializar el mapa
  function initMap(center, zoom) {
    map = L.map('map').setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  }

  // Función para crear un marcador por defecto
  function createDefaultMarker(alerta) {
    const lat = parseFloat(alerta.lat);
    const lng = parseFloat(alerta.lng);
    marker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`Alerta ${alerta.id}<br>${alerta.ubicacion}`)
      .openPopup();
  }

  // Función para crear la tarjeta de alerta en el DOM
  function crearTarjetaAlerta(alerta) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "alerta";

    tarjeta.innerHTML = `
      <h4>Alerta <span class="alerta-id">${alerta.id}</span></h4>
      <small>
        <p><strong>Hora:</strong> <span>${alerta.fecha}</span></p><br>
        <p><strong>Dirección:</strong> <span>${alerta.ubicacion}</span></p>
      </small>
      <button class="estado">Ver Evento</button>
    `;

    tarjeta.querySelector(".estado").addEventListener("click", () => {
      mostrarDetalle(alerta);
    });

    return tarjeta;
  }

  // Función para mostrar detalles y actualizar el mapa
  function mostrarDetalle(alerta) {
    document.getElementById("alerta-id2").textContent = alerta.id;
    document.getElementById("alerta-hora").textContent = alerta.fecha;
    document.getElementById("alerta-direccion").textContent = alerta.ubicacion;
    document.getElementById("alerta-coordenadas").textContent = alerta.lat + ", " + alerta.lng;
    document.getElementById("alerta-contacto").textContent = alerta.contacto;
    document.getElementById("alerta-telefono").textContent = alerta.telefono;

    const lat = parseFloat(alerta.lat);
    const lng = parseFloat(alerta.lng);

    
    const radarIcon = L.icon({
        iconUrl: '../assets/img/radar.gif',
        iconSize: [50, 50], // Tamaño del icono
        iconAnchor: [16, 16], // Ancla el icono en el centro
        popupAnchor: [0, -16] // Ajusta la posición del popup
    });
    
    map.setView([lat, lng], 16);
    marker.setLatLng([lat, lng])
      .setIcon(radarIcon)
      .setPopupContent(`Alerta ${alerta.id}<br>${alerta.ubicacion}`)
      .openPopup();
  }
  
  
});

