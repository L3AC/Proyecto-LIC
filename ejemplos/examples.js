var salidaSwal = document.getElementById("salida-swal");

function mostrarExito() {
  swal("Depósito completado", "Se abonaron $25.00 de ejemplo.", "success");
}

function pedirConfirmacion() {
  swal({
    title: "¿Confirmar el pago?",
    text: "Este pago es solo un ejemplo.",
    icon: "warning",
    buttons: ["Cancelar", "Confirmar"],
  }).then(function (confirmado) {
    if (confirmado) {
      salidaSwal.textContent = "Pago confirmado.";
    } else {
      salidaSwal.textContent = "Pago cancelado.";
    }
  });
}

function generarComprobante() {
  var doc = new jspdf.jsPDF();
  doc.setFontSize(18);
  doc.text("Pokemon Bank", 20, 20);
  doc.setFontSize(11);
  doc.text("Comprobante de ejemplo", 20, 35);
  doc.text("Operacion: deposito", 20, 42);
  doc.text("Monto: USD 25.00", 20, 49);
  doc.text("Cuenta ficticia: 0001 2026 0941", 20, 56);
  doc.text("Documento educativo sin validez bancaria", 20, 63);
  doc.save("comprobante-ejemplo.pdf");
}

function generarResumen() {
  var doc = new jspdf.jsPDF();
  doc.setFontSize(18);
  doc.text("Resumen de ejemplo", 20, 20);
  doc.setFontSize(11);
  doc.text("Pokemon Bank - datos ficticios", 20, 35);
  doc.text("Deposito: +USD 200.00", 20, 42);
  doc.text("Retiro: -USD 50.00", 20, 49);
  doc.text("Pago de internet: -USD 45.00", 20, 56);
  doc.text("Movimiento neto: +USD 105.00", 20, 63);
  doc.save("resumen-ejemplo.pdf");
}

var grafica = null;
var colores = ["#285642", "#d8df9a", "#e5a18a"];

function dibujarBarras() {
  destruirGrafica();
  grafica = new Chart(document.getElementById("grafica"), {
    type: "bar",
    data: {
      labels: ["Depositos", "Retiros", "Pagos"],
      datasets: [
        {
          label: "Cantidad",
          data: [2, 1, 3],
          backgroundColor: colores,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
}

function dibujarDona() {
  destruirGrafica();
  grafica = new Chart(document.getElementById("grafica"), {
    type: "doughnut",
    data: {
      labels: ["Depositos", "Retiros", "Pagos"],
      datasets: [
        {
          label: "Monto en USD",
          data: [200, 50, 95],
          backgroundColor: colores,
        },
      ],
    },
    options: {
      plugins: { legend: { display: true } },
    },
  });
}

function destruirGrafica() {
  if (grafica !== null) {
    grafica.destroy();
  }
}

function validarPin() {
  var datos = { pin: document.getElementById("pin").value };
  var reglas = {
    pin: {
      presence: { allowEmpty: false, message: "El pin es obligatorio" },
      format: { pattern: "[0-9]{4}", message: "El pin debe tener 4 dígitos" },
    },
  };
  var errores = validate(datos, reglas);
  var salida = document.getElementById("salida-validacion");
  if (errores) {
    salida.textContent = errores.pin[0];
  } else {
    salida.textContent = "El pin tiene un formato válido.";
  }
}

function validarMonto() {
  var datos = { monto: document.getElementById("monto").value };
  var reglas = {
    monto: {
      presence: { allowEmpty: false, message: "El monto es obligatorio" },
      numericality: {
        greaterThan: 0,
        lessThanOrEqualTo: 10000,
        message: "El monto debe estar entre 0.01 y 10000",
      },
      format: {
        pattern: "[0-9]+(\\.[0-9]{1,2})?",
        message: "El monto debe tener máximo dos decimales",
      },
    },
  };
  var errores = validate(datos, reglas);
  var salida = document.getElementById("salida-validacion");
  if (errores) {
    salida.textContent = errores.monto[0];
  } else {
    salida.textContent = "El monto es válido.";
  }
}

document.getElementById("btn-exito").onclick = mostrarExito;
document.getElementById("btn-confirmar").onclick = pedirConfirmacion;
document.getElementById("btn-comprobante").onclick = generarComprobante;
document.getElementById("btn-resumen").onclick = generarResumen;
document.getElementById("btn-barras").onclick = dibujarBarras;
document.getElementById("btn-dona").onclick = dibujarDona;
document.getElementById("btn-validar-pin").onclick = validarPin;
document.getElementById("btn-validar-monto").onclick = validarMonto;

dibujarBarras();
