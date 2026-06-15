const API_ANALISIS =
  "https://funccardiacproy-gqd8ead9bpewa2e3.eastus-01.azurewebsites.net/api/analizarmuestras";

const loading = document.getElementById("loading");
const dashboard = document.getElementById("dashboard");
const errorBox = document.getElementById("errorBox");

document.addEventListener("DOMContentLoaded", cargarAnalisis);

async function cargarAnalisis() {
  try {
    const response = await fetch(API_ANALISIS);

    if (!response.ok) {
      throw new Error("No se pudo obtener información desde Azure.");
    }

    const data = await response.json();

    if (data.mensaje) {
      mostrarError(data.mensaje);
      return;
    }

    pintarResumen(data);
    pintarResumenEjecutivo(data);
    pintarClasificacion(data.clasificacion);

    pintarPromedios("sexoContainer", data.promedioPorSexo);
    pintarPromedios("rutinaContainer", data.promedioPorRutina);
    pintarPromedios("edadContainer", data.promedioPorEdad);

    pintarHallazgos(data);
    pintarTextosGraficas(data);

    crearGrafica("chartDistribucion", data.distribucion, "Cantidad de lecturas");
    crearGrafica("chartRutina", data.promedioPorRutina, "BPM promedio");
    crearGrafica("chartSexo", data.promedioPorSexo, "BPM promedio");
    crearGrafica("chartEdad", data.promedioPorEdad, "BPM promedio");

    loading.classList.add("hidden");
    dashboard.classList.remove("hidden");

  } catch (error) {
    console.error(error);
    mostrarError("Error al cargar los datos del análisis.");
  }
}

function pintarResumen(data) {
  document.getElementById("totalPacientes").textContent = data.pacientes;
  document.getElementById("totalMuestras").textContent = data.muestras;
  document.getElementById("promedioGeneral").textContent = `${data.promedioGeneral} BPM`;
  document.getElementById("rangoBpm").textContent = `${data.bpmMinimo} - ${data.bpmMaximo}`;
}

function pintarResumenEjecutivo(data) {
  const box = document.getElementById("resumenEjecutivo");

  box.innerHTML = `
    <p>
      Se analizaron <strong>${data.muestras}</strong> lecturas de frecuencia cardíaca
      correspondientes a <strong>${data.pacientes}</strong> participante(s).
    </p>

    <p>
      La frecuencia cardíaca promedio observada fue de
      <strong>${data.promedioGeneral} BPM</strong>, con un rango registrado de
      <strong>${data.bpmMinimo}</strong> a <strong>${data.bpmMaximo} BPM</strong>.
    </p>

    <p>
      El <strong>${data.clasificacion.porcentajeNormal}%</strong> de las lecturas se mantuvo
      dentro del rango esperado de 60 a 100 BPM.
    </p>

    <p>
      ${data.conclusion}
    </p>
  `;
}

function pintarClasificacion(clasificacion) {
  document.getElementById("bradicardia").textContent =
    `${clasificacion.bradicardia} (${clasificacion.porcentajeBajo}%)`;

  document.getElementById("normal").textContent =
    `${clasificacion.normal} (${clasificacion.porcentajeNormal}%)`;

  document.getElementById("elevado").textContent =
    `${clasificacion.elevado} (${clasificacion.porcentajeElevado}%)`;
}

function pintarPromedios(containerId, datos) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const grupos = Object.entries(datos);

  if (grupos.length === 0) {
    container.innerHTML = "<p>No hay datos disponibles.</p>";
    return;
  }

  grupos.forEach(([grupo, promedio]) => {
    const item = document.createElement("div");
    item.className = "data-item";

    item.innerHTML = `
      <div>
        <strong>${grupo}</strong>
        <p>Promedio calculado con las muestras registradas.</p>
      </div>
      <span>${promedio} BPM</span>
    `;

    container.appendChild(item);
  });
}

function pintarHallazgos(data) {
  const contenedor = document.getElementById("hallazgos");

  let observaciones = [];

  observaciones.push(`Se analizaron ${data.muestras} muestras BPM en total.`);
  observaciones.push(`El promedio general fue de ${data.promedioGeneral} BPM.`);
  observaciones.push(`El rango observado fue de ${data.bpmMinimo} a ${data.bpmMaximo} BPM.`);
  observaciones.push(`${data.clasificacion.porcentajeNormal}% de las lecturas se ubicaron dentro del rango esperado.`);

  if (data.clasificacion.bradicardia === 0) {
    observaciones.push("No se detectaron lecturas compatibles con bradicardia.");
  } else {
    observaciones.push(`Se detectaron ${data.clasificacion.bradicardia} lecturas por debajo de 60 BPM.`);
  }

  if (data.clasificacion.elevado === 0) {
    observaciones.push("No se detectaron lecturas elevadas por encima de 100 BPM.");
  } else {
    observaciones.push(`Se detectaron ${data.clasificacion.elevado} lecturas superiores a 100 BPM.`);
  }

  const mayorRutina = obtenerMayor(data.promedioPorRutina);
  const mayorSexo = obtenerMayor(data.promedioPorSexo);
  const mayorEdad = obtenerMayor(data.promedioPorEdad);

  if (mayorRutina) {
    observaciones.push(`En rutina física, el grupo con mayor promedio fue ${mayorRutina.nombre} con ${mayorRutina.valor} BPM.`);
  }

  if (mayorSexo) {
    observaciones.push(`En sexo, el grupo con mayor promedio fue ${mayorSexo.nombre} con ${mayorSexo.valor} BPM.`);
  }

  if (mayorEdad) {
    observaciones.push(`En grupo de edad, el mayor promedio se observó en ${mayorEdad.nombre} con ${mayorEdad.valor} BPM.`);
  }

  contenedor.innerHTML = observaciones
    .map(o => `<p>• ${o}</p>`)
    .join("");
}

function pintarTextosGraficas(data) {
  const mayorDistribucion = obtenerMayor(data.distribucion);
  const mayorRutina = obtenerMayor(data.promedioPorRutina);
  const mayorSexo = obtenerMayor(data.promedioPorSexo);
  const mayorEdad = obtenerMayor(data.promedioPorEdad);

  document.getElementById("textoDistribucion").textContent =
    mayorDistribucion
      ? `La distribución indica que la mayoría de las mediciones se concentraron entre ${mayorDistribucion.nombre} BPM.`
      : "No hay suficientes datos para interpretar la distribución.";

  document.getElementById("textoRutina").textContent =
    mayorRutina
      ? `La comparación por rutina física muestra que el grupo ${mayorRutina.nombre} presenta el promedio más alto con ${mayorRutina.valor} BPM.`
      : "No hay suficientes datos por rutina física.";

  document.getElementById("textoSexo").textContent =
    mayorSexo
      ? `El análisis por sexo muestra que el grupo ${mayorSexo.nombre} tiene el mayor promedio registrado con ${mayorSexo.valor} BPM.`
      : "No hay suficientes datos por sexo.";

  document.getElementById("textoEdad").textContent =
    mayorEdad
      ? `La comparación por edad indica que el grupo ${mayorEdad.nombre} presenta el mayor promedio con ${mayorEdad.valor} BPM.`
      : "No hay suficientes datos por grupo de edad.";
}

function crearGrafica(canvasId, datos, label) {
  const canvas = document.getElementById(canvasId);

  if (!canvas || !datos) return;

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: Object.keys(datos),
      datasets: [
        {
          label: label,
          data: Object.values(datos),
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${label}: ${context.raw}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function obtenerMayor(objeto) {
  if (!objeto) return null;

  const entries = Object.entries(objeto);

  if (entries.length === 0) return null;

  let mayor = entries[0];

  entries.forEach(item => {
    if (item[1] > mayor[1]) {
      mayor = item;
    }
  });

  return {
    nombre: mayor[0],
    valor: mayor[1]
  };
}

function mostrarError(mensaje) {
  loading.classList.add("hidden");
  dashboard.classList.add("hidden");
  errorBox.classList.remove("hidden");
  errorBox.textContent = mensaje;
}