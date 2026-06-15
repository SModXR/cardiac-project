const API_CREAR_SESION =
  "https://funccardiacproy-gqd8ead9bpewa2e3.eastus-01.azurewebsites.net/api/crearsesionevaluacion";

const API_OBTENER_SESION =
  "https://funccardiacproy-gqd8ead9bpewa2e3.eastus-01.azurewebsites.net/api/obtenersesionevaluacion";

const API_FINALIZAR =
  "https://funccardiacproy-gqd8ead9bpewa2e3.eastus-01.azurewebsites.net/api/finalizarevaluacion";

const form = document.getElementById("formEvaluacion");
const panel = document.getElementById("panelMedicion");
const resultado = document.getElementById("resultadoEvaluacion");

const bpmActual = document.getElementById("bpmActual");
const contadorMuestras = document.getElementById("contadorMuestras");
const promedioBpm = document.getElementById("promedioBpm");
const minBpm = document.getElementById("minBpm");
const maxBpm = document.getElementById("maxBpm");

let intervalo = null;
let finalizado = false;
let datosParticipante = {};

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  // Capturar datos del formulario
  datosParticipante = {
    nombre: document.getElementById("nombre").value.trim(),
    edad: parseInt(document.getElementById("edad").value),
    sexo: document.getElementById("sexo").value,
    peso: parseFloat(document.getElementById("peso").value),
    altura: parseFloat(document.getElementById("altura").value),
    rutina: document.getElementById("rutina").value
  };

  // Ocultar formulario original
  form.style.display = "none";

  // Mostrar mensaje de creación en la misma sección
  const formSection = document.querySelector(".form-section");
  
  // Crear contenedor para info del participante (inicialmente con spinner)
  const infoParticipante = document.createElement("div");
  infoParticipante.id = "infoParticipante";
  infoParticipante.innerHTML = `
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 2rem;">
        <div class="spinner" style="margin: 0 auto;"></div>
        <p style="margin-top: 1rem; color: var(--text-secondary);">Creando sesion de evaluacion...</p>
      </div>
    </div>
  `;
  formSection.appendChild(infoParticipante);

  try {
    const response = await fetch(API_CREAR_SESION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosParticipante)
    });

    if (!response.ok) {
      infoParticipante.innerHTML = `
        <div class="card">
          <div class="card-body">
            <div class="alert alert-error">
              ❌ Error al crear la sesion. Por favor, intente nuevamente.
            </div>
            <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
              Reintentar
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Mostrar información del participante
    infoParticipante.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Datos del Participante</h2>
        </div>
        <div class="card-body">
          <div style="margin-bottom: 1rem;">
            <label class="form-label">Nombre Completo</label>
            <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 8px; font-weight: 600; color: var(--text-primary);">
              ${datosParticipante.nombre}
            </div>
          </div>
          <div class="form-row">
            <div style="flex: 1;">
              <label class="form-label">Edad</label>
              <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 8px; color: var(--text-primary);">
                ${datosParticipante.edad} años
              </div>
            </div>
            <div style="flex: 1;">
              <label class="form-label">Sexo</label>
              <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 8px; color: var(--text-primary);">
                ${datosParticipante.sexo}
              </div>
            </div>
          </div>
          <div class="form-row" style="margin-top: 1rem;">
            <div style="flex: 1;">
              <label class="form-label">Peso</label>
              <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 8px; color: var(--text-primary);">
                ${datosParticipante.peso} kg
              </div>
            </div>
            <div style="flex: 1;">
              <label class="form-label">Altura</label>
              <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 8px; color: var(--text-primary);">
                ${datosParticipante.altura} cm
              </div>
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <label class="form-label">Rutina Fisica</label>
            <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 8px; color: var(--text-primary);">
              ${datosParticipante.rutina}
            </div>
          </div>
          <div class="alert alert-info" style="margin-top: 1.5rem;">
            ✅ Sesion creada correctamente. Conecte su dispositivo ESP32 con sensor MAX30102 para comenzar la medicion.
          </div>
        </div>
      </div>
    `;

    // Mostrar panel de medición
    resultado.classList.add("hidden");
    panel.classList.remove("hidden");

    bpmActual.textContent = "--";
    contadorMuestras.textContent = "Lectura 0/24";
    promedioBpm.textContent = "--";
    minBpm.textContent = "--";
    maxBpm.textContent = "--";

    finalizado = false;

    // Iniciar polling
    intervalo = setInterval(actualizarMedicion, 2000);

  } catch (error) {
    console.error(error);
    infoParticipante.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="alert alert-error">
            ❌ Error de conexion. Verifique su conexion a Internet e intente nuevamente.
          </div>
          <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
            Reintentar
          </button>
        </div>
      </div>
    `;
  }
});

async function actualizarMedicion() {
  if (finalizado) return;

  try {
    const response = await fetch(API_OBTENER_SESION);

    if (!response.ok) return;

    const data = await response.json();

    bpmActual.textContent = data.bpmActual || "--";
    contadorMuestras.textContent = `Lectura ${data.totalLecturas}/24`;
    promedioBpm.textContent = data.promedio || "--";
    minBpm.textContent = data.minimo || "--";
    maxBpm.textContent = data.maximo || "--";

    if (data.totalLecturas >= 24) {
      finalizado = true;
      clearInterval(intervalo);
      await finalizarEvaluacion();
    }

  } catch (error) {
    console.error(error);
  }
}

async function finalizarEvaluacion() {
  resultado.classList.remove("hidden");
  resultado.innerHTML = `
    <div class="card">
      <div class="card-body" style="text-align: center;">
        <div class="spinner" style="margin: 0 auto;"></div>
        <p style="margin-top: var(--spacing-lg); color: var(--text-secondary);">Generando resultado final...</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch(API_FINALIZAR, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();

    // Determinar clasificación del IMC (con fallback si la API no lo envía aún)
    let clasificacionIMC = data.clasificacionIMC;
    let colorIMC = '#27ae60'; // Verde por defecto
    
    if (!clasificacionIMC && data.imc) {
      // Calcular clasificación localmente si la API aún no está actualizada
      const imcNum = typeof data.imc === 'number' ? data.imc : parseFloat(data.imc);
      if (imcNum < 16.0) {
        clasificacionIMC = "Delgadez Severa";
        colorIMC = '#e74c3c';
      } else if (imcNum < 17.0) {
        clasificacionIMC = "Delgadez Moderada";
        colorIMC = '#e67e22';
      } else if (imcNum < 18.5) {
        clasificacionIMC = "Bajo Peso";
        colorIMC = '#3498db';
      } else if (imcNum < 25.0) {
        clasificacionIMC = "Normal";
        colorIMC = '#27ae60';
      } else if (imcNum < 30.0) {
        clasificacionIMC = "Sobrepeso";
        colorIMC = '#f39c12';
      } else if (imcNum < 35.0) {
        clasificacionIMC = "Obesidad I";
        colorIMC = '#e67e22';
      } else if (imcNum < 40.0) {
        clasificacionIMC = "Obesidad II";
        colorIMC = '#e74c3c';
      } else {
        clasificacionIMC = "Obesidad III";
        colorIMC = '#c0392b';
      }
    } else if (clasificacionIMC) {
      // Determinar color según clasificación de la API
      if (clasificacionIMC.includes("Severa") || clasificacionIMC.includes("III")) {
        colorIMC = '#c0392b';
      } else if (clasificacionIMC.includes("Moderada") || clasificacionIMC.includes("II")) {
        colorIMC = '#e74c3c';
      } else if (clasificacionIMC.includes("Obesidad I")) {
        colorIMC = '#e67e22';
      } else if (clasificacionIMC.includes("Sobrepeso")) {
        colorIMC = '#f39c12';
      } else if (clasificacionIMC.includes("Normal")) {
        colorIMC = '#27ae60';
      } else if (clasificacionIMC.includes("Leve") || clasificacionIMC.includes("Bajo")) {
        colorIMC = '#3498db';
      }
    }

    resultado.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="result-header">
            <h2>Resultado Final de Evaluacion</h2>
          </div>
        </div>
        <div class="card-body">
          
          <div class="result-metrics">
            <div class="metric-card">
              <strong>Promedio BPM</strong>
              <span>${data.promedioBpm}</span>
            </div>

            <div class="metric-card">
              <strong>Rango Medido</strong>
              <span>${data.minimoBpm} - ${data.maximoBpm}</span>
            </div>

            <div class="metric-card">
              <strong>IMC</strong>
              <span>${typeof data.imc === 'number' ? data.imc.toFixed(2) : data.imc}</span>
            </div>

            <div class="metric-card" style="background: ${colorIMC}15; border-left: 4px solid ${colorIMC};">
              <strong>Clasificacion IMC</strong>
              <span style="font-size: 0.95rem; color: ${colorIMC}; font-weight: 700;">${clasificacionIMC}</span>
            </div>
          </div>

          <div class="interpretation-section">
            ${data.resultado}
          </div>

          <div class="warning-banner">
            ⚠️ Resultado experimental. No sustituye una valoracion medica profesional.
          </div>

        </div>
      </div>
    `;

  } catch (error) {
    console.error(error);
    resultado.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="error-message">
            ❌ Error al finalizar la evaluacion. Por favor, intente nuevamente.
          </div>
        </div>
      </div>
    `;
  }
}