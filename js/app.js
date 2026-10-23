var CLAVE_SESION = "pokemon-bank-sesion";

function formatearMonto(valor) {
  var numero = Math.abs(valor).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return "$" + numero;
}

function mostrarMensaje(texto, esError) {
  var mensaje = document.getElementById("message");
  if (mensaje === null) return;
  mensaje.textContent = texto;
  mensaje.classList.remove("error");
  if (esError) {
    mensaje.classList.add("error");
  }
}

function iniciarSesion() {
  sessionStorage.setItem(CLAVE_SESION, "activa");
}

function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
}

function revisarSesion() {
  if (sessionStorage.getItem(CLAVE_SESION) === null) {
    window.location.replace("index.html");
  }
}

function configurarLogin() {
  var form = document.getElementById("login-form");
  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    var pin = document.getElementById("pin").value;
    if (validarPin(pin)) {
      iniciarSesion();
      window.location.href = "acciones.html";
    } else {
      mostrarMensaje("El PIN es incorrecto. Vuelve a intentarlo.", true);
    }
  });
}

function nombreMovimiento(tipo) {
  if (tipo === "deposito") return "Depósito";
  if (tipo === "retiro") return "Retiro";
  return "Pago de servicios";
}

function actualizarSaldo() {
  var celda = document.querySelector("[data-balance]");
  if (celda === null) return;
  celda.textContent = formatearMonto(obtenerSaldo());
}

function crearFila(movimiento) {
  var fila = document.createElement("tr");
  var esDeposito = movimiento.tipo === "deposito";
  var nombre = nombreMovimiento(movimiento.tipo);
  var monto = (esDeposito ? "+$" : "−$") + formatearMonto(movimiento.monto);
  fila.innerHTML =
    "<td>" + nombre + "<small>" + movimiento.detalle + "</small></td>" +
    "<td>" + movimiento.fecha + "</td>" +
    '<td class="' + (esDeposito ? "positive" : "negative") + '">' + monto + "</td>" +
    '<td><span class="tag">Completado</span></td>';
  return fila;
}

function dibujarTabla() {
  var cuerpo = document.getElementById("transactions");
  if (cuerpo === null) return;
  var movimientos = obtenerMovimientos();
  cuerpo.innerHTML = "";
  for (var i = 0; i < movimientos.length; i++) {
    cuerpo.appendChild(crearFila(movimientos[i]));
  }
}

function procesarOperacion(tipo, form) {
  var monto = parseFloat(form.querySelector('[name="amount"]').value);

  if (isNaN(monto) || monto <= 0) {

    mostrarMensaje("Ingresa un monto válido.", true);
    return;

  }
  if (tipo === "deposito") {

    registrarMovimiento("deposito", monto, "Depósito en ventanilla");
    mostrarMensaje("Depósito de " + formatearMonto(monto) + " realizado.", false);

  } else if (tipo === "retiro") {

    if (monto > obtenerSaldo()) {
      mostrarMensaje("No tienes saldo suficiente para ese retiro.", true);
      return;

    }

    registrarMovimiento("retiro", monto, "Retiro en cajero");

    mostrarMensaje("Retiro de " + formatearMonto(monto) + " realizado.", false);

  } else {

    if (monto > obtenerSaldo()) {

      mostrarMensaje("No tienes saldo suficiente para ese pago.", true);
      return;
    }

    var servicio = form.querySelector('[name="service"]').value;
    registrarMovimiento("pago", monto, servicio);
    mostrarMensaje("Pago de " + servicio + " por " + formatearMonto(monto) + " realizado.", false);
  }
  
  actualizarSaldo();
  dibujarTabla();
  form.reset();
}

function configurarOperaciones() {
  var formularios = document.querySelectorAll("[data-transaction]");
  for (var i = 0; i < formularios.length; i++) {
    formularios[i].addEventListener("submit", function (evento) {
      evento.preventDefault();
      var form = evento.target;
      procesarOperacion(form.getAttribute("data-transaction"), form);
    });
  }
}

function configurarBotonSaldo() {
  var boton = document.getElementById("check-balance");
  boton.addEventListener("click", function () {
    mostrarMensaje("Saldo disponible: " + formatearMonto(obtenerSaldo()) + ".", false);
  });
}

function actualizarLeyenda(cantidades, montos) {
  var nombres = ["Depósitos", "Retiros", "Pagos"];
  var leyenda = document.getElementById("chart-legend");
  leyenda.innerHTML = "";
  for (var i = 0; i < nombres.length; i++) {
    leyenda.innerHTML +=
      '<div class="legend-row">' +
      nombres[i] +
      "<strong>" +
      cantidades[i] +
      " · " +
      formatearMonto(montos[i]) +
      "</strong></div>";
  }
}

function dibujarGrafica(cantDep, cantRet, cantPag) {
  var lienzo = document.getElementById("transactions-chart");
  if (typeof Chart === "undefined") return;
  new Chart(lienzo, {
    type: "bar",
    data: {
      labels: ["Depositos", "Retiros", "Pagos"],
      datasets: [
        {
          label: "Cantidad",
          data: [cantDep, cantRet, cantPag],
          backgroundColor: ["#285642", "#d8df9a", "#e5a18a"],
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
}

function configurarGrafico() {
  var movimientos = obtenerMovimientos();
  var totales = obtenerTotales();
  var cantDep = 0;
  var cantRet = 0;
  var cantPag = 0;
  var montoDep = 0;
  var montoRet = 0;
  var montoPag = 0;
  for (var i = 0; i < movimientos.length; i++) {
    if (movimientos[i].tipo === "deposito") {
      cantDep++;
      montoDep += movimientos[i].monto;
    } else if (movimientos[i].tipo === "retiro") {
      cantRet++;
      montoRet += movimientos[i].monto;
    } else {
      cantPag++;
      montoPag += movimientos[i].monto;
    }
  }
  document.getElementById("total-in").textContent = formatearMonto(totales.entradas);
  document.getElementById("total-out").textContent = formatearMonto(totales.salidas);
  document.getElementById("total-count").textContent = totales.cantidad;
  actualizarLeyenda([cantDep, cantRet, cantPag], [montoDep, montoRet, montoPag]);
  dibujarGrafica(cantDep, cantRet, cantPag);
}

function configurarSalida() {
  var enlaces = document.querySelectorAll("[data-logout]");
  for (var i = 0; i < enlaces.length; i++) {
    enlaces[i].addEventListener("click", cerrarSesion);
  }
}

var pagina = document.body.getAttribute("data-page");

if (pagina === "login") {
  configurarLogin();
}
if (pagina === "acciones") {
  revisarSesion();
  actualizarSaldo();
  dibujarTabla();
  configurarOperaciones();
  configurarBotonSaldo();
}
if (pagina === "grafico") {
  revisarSesion();
  configurarGrafico();
}
if (pagina === "historial") {
  revisarSesion();
  dibujarTabla();
}
configurarSalida();
