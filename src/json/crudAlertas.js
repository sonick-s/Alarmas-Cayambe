// src/services/alertsService.js

import { ref, push, set, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { db } from "./firebaseConfig.js";

// Ruta base para alerts
const alertsRef = ref(db, 'alerts');

/**
 * Crear una nueva alerta
 * @param {Object} alertData 
 * @returns {Promise<string|null>}
 */
export async function createAlert(alertData) {
  try {
    const newAlertRef = push(alertsRef);
    await set(newAlertRef, alertData);
    console.log("Alerta creada con ID:", newAlertRef.key);
    return newAlertRef.key;
  } catch (error) {
    console.error("Error creando alerta:", error);
    return null;
  }
}

export async function getAllAlerts() {
  try {
    const snapshot = await get(alertsRef);
    if (snapshot.exists()) {
      console.log("Alertas obtenidas:", JSON.stringify(snapshot.val(), null, 2));

      return snapshot.val();
    } else {
      console.log("No hay alertas disponibles");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo alertas:", error);
    return null;
  }
}

export async function getLatest10Alerts() {
  try {
    const snapshot = await get(alertsRef);
    if (snapshot.exists()) {
      const alertsObj = snapshot.val();
      
      const alertsArray = Object.entries(alertsObj).map(([id, alert]) => ({
        id,
        ...alert,
      }));
      
      alertsArray.sort((a, b) => b.timestamp - a.timestamp);
      
      const latest10 = alertsArray.slice(0, 10);
      
      console.log("Últimas 10 alertas:", latest10);
      return latest10;
    } else {
      console.log("No hay alertas disponibles");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo alertas:", error);
    return null;
  }
}


/**
 * Escuchar cambios en todas las alertas (leer en tiempo real)
 * @param {function(Object):void} callback
 */
export function subscribeAlerts(callback) {
  try {
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Datos de alertas actualizados:", data);
      callback(data);
    });
  } catch (error) {
    console.error("Error suscribiendo a alertas:", error);
  }
}

/**
 * Actualizar una alerta
 * @param {string} alertId 
 * @param {Object} updates 
 * @returns {Promise<boolean>}
 */
export async function updateAlert(alertId, updates) {
  try {
    const alertToUpdateRef = ref(db, `alerts/${alertId}`);
    await update(alertToUpdateRef, updates);
    console.log(`Alerta ${alertId} actualizada con`, updates);
    return true;
  } catch (error) {
    console.error(`Error actualizando alerta ${alertId}:`, error);
    return false;
  }
}

/**
 * Eliminar una alerta
 * @param {string} alertId 
 * @returns {Promise<boolean>}
 */
export async function deleteAlert(alertId) {
  try {
    const alertToDeleteRef = ref(db, `alerts/${alertId}`);
    await remove(alertToDeleteRef);
    console.log(`Alerta ${alertId} eliminada`);
    return true;
  } catch (error) {
    console.error(`Error eliminando alerta ${alertId}:`, error);
    return false;
  }
}
