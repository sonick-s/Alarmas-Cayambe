import { getAllAlerts, updateAlert } from "./crudAlertas.js";

async function mostrarAlertas() {
  try {
    const alertitas = await getAllAlerts();
    return alertitas;
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    document.getElementById('alertsOutput').textContent = 'Error al obtener alertas.';
    return [];
  }
}

    // Importar Nav.html en el contenedor correspondiente
    fetch('Nav.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('nav-container').innerHTML = html;
        });

document.addEventListener("DOMContentLoaded", function () {
  async function handleAlertUpdate() {
    const alertaId = document.getElementById("alerta-id2").textContent;

    if (!alertaId) {
      console.error("No se encontró el ID de la alerta.");
      alert("Error: No se encontró el ID de la alerta.");
      return;
    }

    console.log("ID de la alerta:", alertaId);

    const updates = {
      estado: false
    };

    console.log("Datos a actualizar:", updates);

    const result = await updateAlert(alertaId, updates);

    if (result) {
      console.log(`La alerta  ${alertaId} Ha sido atendida.`);
      alert(`La alerta con ID ${alertaId} ha sido atendida.`);
    } else {
      console.log(`Error al actualizar la alerta con ID ${alertaId}`);
      alert(`Error al atender la alerta ${alertaId}`);
    }
  }

  const alertaButton = document.getElementById("alerta-button");
  alertaButton.addEventListener("click", handleAlertUpdate);
});





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
        id: `#${alerta.id}`, // Agrego # al id para que coincida con tu formato
        fecha: `${alerta.date}, ${alerta.time}`,
        ubicacion: alerta.address,
        lat: alerta.latitude.toString(),
        lng: alerta.longitude.toString(),
        contacto: "Desconocido",  // app movil no envia el contacto
        telefono: "N/A"           // app movil no envia el telefono
      });
    }
  }

  initMap([0.04103, -78.14636], 7);
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
    }).addTo(map);
  }

  // Función para crear un marcador por defecto
  function createDefaultMarker(alerta) {
    const lat = parseFloat(alerta.lat);
    const lng = parseFloat(alerta.lng);
    const radarIcon = L.icon({
      iconUrl: '../assets/img/advertencia.gif',
      iconSize: [50, 50], // Tamaño del icono
      iconAnchor: [16, 16], // Ancla el icono en el centro
      popupAnchor: [0, -16] // Ajusta la posición del popup
    });
    marker = L.marker([lat, lng], { icon: radarIcon })
      .addTo(map)
      .bindPopup(`Alerta ${alerta.id}<br>${alerta.ubicacion}`)
      .openPopup();
  }

  // Función para crear la tarjeta de alerta en el DOM
  function crearTarjetaAlerta(alerta) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "alerta";

    tarjeta.innerHTML = `
    <div class="info-card">
    <ul style="font-size:0.95em; color:#333; list-style:none; padding:0;">
      <li><b>Evento:</b>${alerta.id}</li>
      <br>
      <li><b>Fecha:</b>${alerta.fecha}</li>
      <li><b>Ubicación:</b>${alerta.ubicacion}</li>
      <div style="display:flex; justify-content:flex-end; align-items:right; gap:8px; margin-bottom:8px;">
        <button class="estado" title="Ver Evento" style="background:none; border:none; cursor:pointer; font-size:1.3em; padding:4px;">
          <svg height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </button>
      </div>
    </ul>
    </div>
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
      iconUrl: '../assets/img/advertencia.gif',
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

