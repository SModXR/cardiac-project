const API_PACIENTES =
  "https://funccardiacproy-gqd8ead9bpewa2e3.eastus-01.azurewebsites.net/api/obtenerpacientes";

const API_CREAR_SESION =
  "https://funccardiacproy-gqd8ead9bpewa2e3.eastus-01.azurewebsites.net/api/crearsesionmedicion";

const API_FINALIZAR_SESION =
  "https://funccardiacproy-gqd8ead9bpewa2e3.eastus-01.azurewebsites.net/api/finalizarsesionmedicion";

// DOM Elements
const selectPaciente = document.getElementById("selectPaciente");
const btnIniciar = document.getElementById("btnIniciar");
const btnFinalizar = document.getElementById("btnFinalizar");
const formSesion = document.getElementById("formSesion");
const mensaje = document.getElementById("mensaje");

// Display Elements
const bpmValue = document.getElementById("bpmValue");
const statusBadge = document.getElementById("statusBadge");
const sesionId = document.getElementById("sesionId");
const pacienteNombre = document.getElementById("pacienteNombre");
const lecturaCount = document.getElementById("lecturaCount");

let pacientes = [];
let pacienteSeleccionado = null;
let sesionActiva = false;

document.addEventListener("DOMContentLoaded", cargarPacientes);

formSesion.addEventListener("submit", function(e) {
  e.preventDefault();
  crearSesionMedicion();
});

btnFinalizar.addEventListener("click", finalizarSesion);

selectPaciente.addEventListener("change", function() {
  const pacienteId = selectPaciente.value;
  pacienteSeleccionado = pacientes.find(p => p.PacienteId === pacienteId);
  
  if (pacienteSeleccionado && !sesionActiva) {
    btnIniciar.disabled = false;
    pacienteNombre.textContent = pacienteSeleccionado.Nombre;
  } else {
    btnIniciar.disabled = true;
  }
});

async function cargarPacientes() {
  try {
    const response = await fetch(API_PACIENTES);
    pacientes = await response.json();

    selectPaciente.innerHTML = `<option value="">Seleccione un paciente</option>`;

    pacientes.forEach(paciente => {
      const option = document.createElement("option");
      option.value = paciente.PacienteId;
      option.textContent = `${paciente.Nombre} - ${paciente.Edad} años - ${paciente.Sexo}`;
      selectPaciente.appendChild(option);
    });

  } catch (error) {
    console.error(error);
    selectPaciente.innerHTML = `<option value="">Error al cargar pacientes</option>`;
    mostrarMensaje("Error al cargar la lista de pacientes", "error");
  }
}

async function crearSesionMedicion() {
  if (!pacienteSeleccionado) return;

  mostrarMensaje("Creando sesion de medicion...", "info");

  try {
    const response = await fetch(API_CREAR_SESION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pacienteId: pacienteSeleccionado.PacienteId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      mostrarMensaje("No se pudo crear la sesion de medicion", "error");
      return;
    }

    // Update UI
    sesionActiva = true;
    sesionId.textContent = data.sesionId;
    pacienteNombre.textContent = pacienteSeleccionado.Nombre;
    lecturaCount.textContent = "0 / 24";
    statusBadge.textContent = "Sesion Activa";
    statusBadge.className = "status-badge status-active";

    // Disable/Enable controls
    selectPaciente.disabled = true;
    btnIniciar.disabled = true;
    btnFinalizar.disabled = false;

    mostrarMensaje(`✓ Sesion creada correctamente. ID: ${data.sesionId}. Conecte el dispositivo ESP32 con sensor MAX30102.`, "success");

  } catch (error) {
    console.error(error);
    mostrarMensaje("Error de conexion con Azure Function", "error");
  }
}

async function finalizarSesion() {
  mostrarMensaje("Finalizando sesion...", "info");

  try {
    const response = await fetch(API_FINALIZAR_SESION, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();

    if (!response.ok) {
      mostrarMensaje("No se pudo finalizar la sesion", "error");
      return;
    }

    // Reset UI
    sesionActiva = false;
    sesionId.textContent = "--";
    pacienteNombre.textContent = "--";
    lecturaCount.textContent = "0 / 24";
    bpmValue.textContent = "--";
    statusBadge.textContent = "En espera";
    statusBadge.className = "status-badge status-waiting";

    // Re-enable controls
    selectPaciente.disabled = false;
    btnIniciar.disabled = false;
    btnFinalizar.disabled = true;

    mostrarMensaje(`✓ Sesion finalizada correctamente. Estado: ${data.estado}`, "success");

  } catch (error) {
    console.error(error);
    mostrarMensaje("Error al finalizar la sesion", "error");
  }
}

function mostrarMensaje(texto, tipo) {
  mensaje.className = "";
  
  if (tipo === "success") {
    mensaje.className = "alert alert-success";
  } else if (tipo === "error") {
    mensaje.className = "alert alert-error";
  } else if (tipo === "info") {
    mensaje.className = "alert alert-info";
  }
  
  mensaje.textContent = texto;
}