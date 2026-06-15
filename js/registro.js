const API_REGISTRO =
  "https://funccardiacproy-gqd8ead9bpewa2e3.eastus-01.azurewebsites.net/api/registrarpaciente";

const formPaciente = document.getElementById("formPaciente");
const resultado = document.getElementById("resultado");

formPaciente.addEventListener("submit", async function (e) {
  e.preventDefault();

  const paciente = {
    nombre: document.getElementById("nombre").value.trim(),
    edad: parseInt(document.getElementById("edad").value),
    sexo: document.getElementById("sexo").value,
    peso: parseFloat(document.getElementById("peso").value),
    altura: parseFloat(document.getElementById("altura").value),
    rutina: document.getElementById("rutina").value
  };

  resultado.className = "";
  resultado.textContent = "Registrando paciente...";

  try {
    const response = await fetch(API_REGISTRO, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(paciente)
    });

    const data = await response.json();

    if (response.ok) {
      resultado.classList.add("show");
      resultado.innerHTML = `
        <div style="margin-bottom: 0.5rem;">
          <strong style="font-size: 1.1rem;">✓ Paciente registrado exitosamente</strong>
        </div>
        <p style="margin: 0.5rem 0;"><strong>ID generado:</strong> ${data.pacienteId}</p>
        <p style="margin: 0;">El paciente ha sido almacenado en Azure Blob Storage y está listo para mediciones.</p>
      `;

      formPaciente.reset();
      
      // Hide message after 5 seconds
      setTimeout(() => {
        resultado.classList.remove("show");
      }, 5000);
    } else {
      resultado.style.background = "#FEE2E2";
      resultado.style.borderColor = "#EF4444";
      resultado.style.color = "#991B1B";
      resultado.classList.add("show");
      resultado.innerHTML = "<strong>Error:</strong> No se pudo registrar el paciente. Por favor, intente nuevamente.";
    }
  } catch (error) {
    console.error(error);
    resultado.style.background = "#FEE2E2";
    resultado.style.borderColor = "#EF4444";
    resultado.style.color = "#991B1B";
    resultado.classList.add("show");
    resultado.innerHTML = `<strong>Error de conexión:</strong> ${error.message}`;
  }
});