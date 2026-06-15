// ===================================================================
// ANALISIS PRO - PROFESSIONAL DASHBOARD JAVASCRIPT
// ===================================================================

const API_ANALISIS = "https://funccardiacproy-gqd8ead9bpewa2e3.eastus-01.azurewebsites.net/api/analizarmuestras";

let chartClasificacion = null;
let chartEdad = null;
let chartSexo = null;
let chartRutina = null;
let datosGlobales = null;

// ===================================================================
// INITIALIZATION
// ===================================================================

document.addEventListener("DOMContentLoaded", () => {
  cargarAnalisis();
});

// ===================================================================
// DATA LOADING
// ===================================================================

async function cargarAnalisis() {
  const loading = document.getElementById("loading");
  const dashboard = document.getElementById("dashboard");
  const errorContainer = document.getElementById("errorContainer");

  try {
    const response = await fetch(API_ANALISIS);

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    datosGlobales = data;

    if (data.mensaje) {
      mostrarError(data.mensaje);
      return;
    }

    // Render all components
    renderMetrics(data);
    renderExecutiveSummary(data);
    renderClassification(data.clasificacion);
    renderFindings(data);
    renderCharts(data);
    renderDataTable(data);

    // Hide loading, show dashboard
    loading.classList.add("hidden");
    dashboard.classList.remove("hidden");

    // Animate metrics
    animateMetrics();

  } catch (error) {
    console.error("Error:", error);
    mostrarError(error.message || "Error al cargar los datos del análisis.");
  }
}

// ===================================================================
// METRICS RENDERING
// ===================================================================

function renderMetrics(data) {
  document.getElementById("totalPacientes").textContent = data.pacientes;
  document.getElementById("totalMuestras").textContent = data.muestras.toLocaleString();
  document.getElementById("promedioGeneral").textContent = `${data.promedioGeneral} BPM`;
  document.getElementById("rangoBpm").textContent = `${data.bpmMinimo} - ${data.bpmMaximo}`;

  const lecturasPorPaciente = Math.round(data.muestras / data.pacientes);
  document.getElementById("lecturasPorPaciente").textContent = `${lecturasPorPaciente} por paciente`;
}

function animateMetrics() {
  const metrics = document.querySelectorAll(".metric-card");
  metrics.forEach((metric, index) => {
    setTimeout(() => {
      metric.style.opacity = "0";
      metric.style.transform = "translateY(20px)";
      setTimeout(() => {
        metric.style.transition = "all 0.4s ease";
        metric.style.opacity = "1";
        metric.style.transform = "translateY(0)";
      }, 10);
    }, index * 100);
  });
}

// ===================================================================
// EXECUTIVE SUMMARY
// ===================================================================

function renderExecutiveSummary(data) {
  const container = document.getElementById("resumenEjecutivo");
  
  container.innerHTML = `
    <p>
      Se analizaron <strong>${data.muestras.toLocaleString()}</strong> lecturas de frecuencia cardíaca
      correspondientes a <strong>${data.pacientes}</strong> participantes monitoreados activamente.
    </p>

    <p>
      La frecuencia cardíaca promedio observada fue de
      <strong>${data.promedioGeneral} BPM</strong>, con un rango registrado de
      <strong>${data.bpmMinimo}</strong> a <strong>${data.bpmMaximo} BPM</strong>.
    </p>

    <p>
      El <strong>${data.clasificacion.porcentajeNormal}%</strong> de las lecturas se mantuvo
      dentro del rango esperado de 60 a 100 BPM, indicando una condición cardiovascular saludable 
      en la mayoría de los participantes.
    </p>

    <p>
      ${data.conclusion || 'Los resultados muestran una distribución normal de frecuencia cardíaca en la población monitoreada, con valores consistentes con los estándares médicos establecidos.'}
    </p>
  `;
}

// ===================================================================
// CLASSIFICATION RENDERING
// ===================================================================

function renderClassification(clasificacion) {
  // Update text values
  document.getElementById("bradicardia").textContent = 
    `${clasificacion.bradicardia} (${clasificacion.porcentajeBajo}%)`;
  
  document.getElementById("normal").textContent = 
    `${clasificacion.normal} (${clasificacion.porcentajeNormal}%)`;
  
  document.getElementById("elevado").textContent = 
    `${clasificacion.elevado} (${clasificacion.porcentajeElevado}%)`;

  // Animate progress bars
  setTimeout(() => {
    document.getElementById("barBradicardia").style.width = `${clasificacion.porcentajeBajo}%`;
    document.getElementById("barNormal").style.width = `${clasificacion.porcentajeNormal}%`;
    document.getElementById("barElevado").style.width = `${clasificacion.porcentajeElevado}%`;
  }, 300);
}

// ===================================================================
// FINDINGS RENDERING
// ===================================================================

function renderFindings(data) {
  const container = document.getElementById("hallazgos");
  let observaciones = [];

  observaciones.push(`Se analizaron <strong>${data.muestras.toLocaleString()}</strong> muestras BPM en total`);
  observaciones.push(`El promedio general fue de <strong>${data.promedioGeneral} BPM</strong>`);
  observaciones.push(`El rango observado fue de <strong>${data.bpmMinimo} a ${data.bpmMaximo} BPM</strong>`);
  observaciones.push(`<strong>${data.clasificacion.porcentajeNormal}%</strong> de las lecturas se ubicaron dentro del rango esperado`);

  if (data.clasificacion.bradicardia === 0) {
    observaciones.push("No se detectaron lecturas compatibles con bradicardia");
  } else {
    observaciones.push(`Se detectaron <strong>${data.clasificacion.bradicardia}</strong> lecturas por debajo de 60 BPM`);
  }

  if (data.clasificacion.elevado === 0) {
    observaciones.push("No se detectaron lecturas elevadas por encima de 100 BPM");
  } else {
    observaciones.push(`Se detectaron <strong>${data.clasificacion.elevado}</strong> lecturas superiores a 100 BPM`);
  }

  const mayorRutina = obtenerMayor(data.promedioPorRutina);
  const mayorSexo = obtenerMayor(data.promedioPorSexo);
  const mayorEdad = obtenerMayor(data.promedioPorEdad);

  if (mayorRutina) {
    observaciones.push(`En rutina física, el grupo con mayor promedio fue <strong>${mayorRutina.nombre}</strong> con <strong>${mayorRutina.valor} BPM</strong>`);
  }

  if (mayorSexo) {
    observaciones.push(`En sexo, el grupo con mayor promedio fue <strong>${mayorSexo.nombre}</strong> con <strong>${mayorSexo.valor} BPM</strong>`);
  }

  if (mayorEdad) {
    observaciones.push(`En grupo de edad, el mayor promedio se observó en <strong>${mayorEdad.nombre}</strong> con <strong>${mayorEdad.valor} BPM</strong>`);
  }

  container.innerHTML = observaciones.map(o => `<p>${o}</p>`).join("");
}

// ===================================================================
// CHARTS RENDERING
// ===================================================================

function renderCharts(data) {
  // Main classification chart
  renderClassificationChart(data.clasificacion);

  // Comparison charts
  renderComparisonChart("chartEdad", data.promedioPorEdad, "Grupo de Edad", '#8B5CF6');
  renderComparisonChart("chartSexo", data.promedioPorSexo, "Sexo", '#EC4899');
  renderComparisonChart("chartRutina", data.promedioPorRutina, "Rutina Física", '#10B981');

  // Custom legend for main chart
  renderChartLegend(data.clasificacion);
}

function renderClassificationChart(clasificacion) {
  const ctx = document.getElementById("chartClasificacion");

  if (chartClasificacion) {
    chartClasificacion.destroy();
  }

  const chartType = document.getElementById("chartTypeSelect").value;

  chartClasificacion = new Chart(ctx, {
    type: chartType,
    data: {
      labels: ["Bradicardia (<60)", "Normal (60-100)", "Taquicardia (>100)"],
      datasets: [{
        data: [clasificacion.bradicardia, clasificacion.normal, clasificacion.elevado],
        backgroundColor: [
          '#F59E0B',
          '#10B981',
          '#EF4444'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || context.parsed.y || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} lecturas (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

function renderComparisonChart(canvasId, datos, label, color) {
  const ctx = document.getElementById(canvasId);

  if (!ctx || !datos) return;

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(datos),
      datasets: [{
        label: "BPM Promedio",
        data: Object.values(datos),
        backgroundColor: color + '20',
        borderColor: color,
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} BPM`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#E5E7EB'
          },
          ticks: {
            callback: function(value) {
              return value + ' BPM';
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });

  // Store reference based on canvas ID
  if (canvasId === 'chartEdad') chartEdad = chart;
  if (canvasId === 'chartSexo') chartSexo = chart;
  if (canvasId === 'chartRutina') chartRutina = chart;
}

function renderChartLegend(clasificacion) {
  const container = document.getElementById("chartLegend");
  
  const items = [
    { label: "Bradicardia", value: clasificacion.bradicardia, percent: clasificacion.porcentajeBajo, color: "#F59E0B" },
    { label: "Normal", value: clasificacion.normal, percent: clasificacion.porcentajeNormal, color: "#10B981" },
    { label: "Taquicardia", value: clasificacion.elevado, percent: clasificacion.porcentajeElevado, color: "#EF4444" }
  ];

  container.innerHTML = items.map(item => `
    <div class="legend-item">
      <div class="legend-color" style="background: ${item.color}"></div>
      <div>
        <div class="legend-text">${item.label}</div>
        <div class="legend-value">${item.value} (${item.percent}%)</div>
      </div>
    </div>
  `).join("");
}

// ===================================================================
// DATA TABLE
// ===================================================================

function renderDataTable(data) {
  const tbody = document.getElementById("tableBody");
  let rows = [];

  // Add age groups
  if (data.promedioPorEdad) {
    Object.entries(data.promedioPorEdad).forEach(([grupo, promedio]) => {
      rows.push({
        categoria: "Edad",
        grupo: grupo,
        promedio: promedio,
        lecturas: calcularLecturas(data, "edad", grupo),
        clasificacion: clasificarBPM(promedio)
      });
    });
  }

  // Add sex groups
  if (data.promedioPorSexo) {
    Object.entries(data.promedioPorSexo).forEach(([grupo, promedio]) => {
      rows.push({
        categoria: "Sexo",
        grupo: grupo,
        promedio: promedio,
        lecturas: calcularLecturas(data, "sexo", grupo),
        clasificacion: clasificarBPM(promedio)
      });
    });
  }

  // Add routine groups
  if (data.promedioPorRutina) {
    Object.entries(data.promedioPorRutina).forEach(([grupo, promedio]) => {
      rows.push({
        categoria: "Rutina",
        grupo: grupo,
        promedio: promedio,
        lecturas: calcularLecturas(data, "rutina", grupo),
        clasificacion: clasificarBPM(promedio)
      });
    });
  }

  tbody.innerHTML = rows.map(row => `
    <tr>
      <td><strong>${row.categoria}</strong></td>
      <td>${row.grupo}</td>
      <td><strong>${row.promedio} BPM</strong></td>
      <td>${row.lecturas || '-'}</td>
      <td><span class="table-badge badge-${row.clasificacion.class}">${row.clasificacion.label}</span></td>
    </tr>
  `).join("");
}

function calcularLecturas(data, tipo, valor) {
  // This would need actual data from API
  // For now, return estimate
  const totalLecturas = data.muestras;
  const grupos = tipo === "edad" ? 3 : tipo === "sexo" ? 2 : 2;
  return Math.round(totalLecturas / grupos);
}

function clasificarBPM(bpm) {
  if (bpm < 60) {
    return { label: "Bajo", class: "low" };
  } else if (bpm <= 100) {
    return { label: "Normal", class: "normal" };
  } else {
    return { label: "Alto", class: "high" };
  }
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

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
  const loading = document.getElementById("loading");
  const dashboard = document.getElementById("dashboard");
  const errorContainer = document.getElementById("errorContainer");
  const errorMessage = document.getElementById("errorMessage");

  loading.classList.add("hidden");
  dashboard.classList.add("hidden");
  errorContainer.classList.remove("hidden");
  errorMessage.textContent = mensaje;
}

// ===================================================================
// INTERACTIONS
// ===================================================================

function cambiarTipoGrafica() {
  if (datosGlobales) {
    renderClassificationChart(datosGlobales.clasificacion);
  }
}

function toggleTable() {
  const table = document.getElementById("dataTable");
  const icon = document.getElementById("tableToggleIcon");
  
  if (table.style.display === "none") {
    table.style.display = "block";
    icon.style.transform = "rotate(0deg)";
  } else {
    table.style.display = "none";
    icon.style.transform = "rotate(-90deg)";
  }
}

function exportarDatos() {
  if (!datosGlobales) {
    alert("No hay datos para exportar");
    return;
  }

  const dataStr = JSON.stringify(datosGlobales, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `analisis-cardiaco-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  
  // Show confirmation
  const btn = event.target.closest('.btn-primary');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"/></svg> Exportado';
  btn.disabled = true;
  
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }, 2000);
}
