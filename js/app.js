// Interacción del cajero: sesión, validaciones, diálogos, comprobantes y gráfica

var CLAVE_SESION = "pokemon-bank-sesion";
var CLAVE_DENEGADO = "pokemon-bank-acceso-denegado";

// ===== Reglas de validación (ValidateJS) =====
// El símbolo ^ evita que la librería agregue el nombre del campo al mensaje

var REGLAS_PIN = {
  pin: {
    presence: { allowEmpty: false, message: "^El PIN es obligatorio." },
    format: { pattern: "[0-9]{4}", message: "^El PIN debe tener 4 dígitos." },
  },
};

var REGLAS_MONTO = {
  monto: {
    presence: { allowEmpty: false, message: "^El monto es obligatorio." },
    numericality: {
      greaterThan: 0,
      lessThanOrEqualTo: 10000,
      message: "^El monto debe estar entre 0.01 y 10000.",
    },
    format: {
      pattern: "[0-9]+(\\.[0-9]{1,2})?",
      message: "^El monto debe tener máximo dos decimales.",
    },
  },
};

var REGLAS_PAGO = {
  servicio: { presence: { message: "^Elegí un servicio." } },
  referencia: {
    presence: { allowEmpty: false, message: "^La referencia es obligatoria." },
    format: { pattern: "[0-9]{6,12}", message: "^La referencia debe tener de 6 a 12 dígitos." },
  },
  monto: REGLAS_MONTO.monto,
};

// Devuelve los errores de los datos; si la librería no cargó, no valida
function validarDatos(datos, reglas) {
  if (typeof validate === "undefined") {
    return null;
  }
  return validate(datos, reglas);
}

// Junta todos los mensajes de error en un solo texto
function unirErrores(errores) {
  var mensajes = [];
  for (var campo in errores) {
    mensajes = mensajes.concat(errores[campo]);
  }
  return mensajes.join(" ");
}

// ===== Utilidades =====

function formatearMonto(valor) {
  var numero = Math.abs(valor).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return "$" + numero;
}

function nombreMovimiento(tipo) {
  if (tipo === "deposito") return "Depósito";
  if (tipo === "retiro") return "Retiro";
  return "Pago de servicios";
}

// ===== Sesión =====

function iniciarSesion() {
  sessionStorage.setItem(CLAVE_SESION, "activa");
}

function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
}

// Verifica la sesión; si no hay, marca el aviso y regresa al inicio de sesión
function revisarSesion() {
  if (sessionStorage.getItem(CLAVE_SESION) !== null) {
    return true;
  }

  // El aviso de acceso denegado se muestra en el login, no encima de esta página
  sessionStorage.setItem(CLAVE_DENEGADO, "403");
  window.location.replace("index.html");
  return false;
}

// ===== Inicio de sesión =====

// Diálogo con el nombre y la cuenta cuando el PIN es correcto
function mostrarBienvenida() {
  var usuario = obtenerUsuario();
  swal({
    title: "¡Bienvenido, " + usuario.nombre + "!",
    text: "Número de cuenta: " + usuario.cuenta,
    icon: "success",
    buttons: ["Salir", "Seleccionar transacción"],
  }).then(function (continuar) {
    if (continuar) {
      iniciarSesion();
      window.location.href = "acciones.html";
    }
  });
}

// Si se llegó desde una página protegida, muestra el aviso de acceso denegado
function mostrarAccesoDenegado() {
  if (sessionStorage.getItem(CLAVE_DENEGADO) === null) {
    return;
  }
  sessionStorage.removeItem(CLAVE_DENEGADO);

  // Si la librería no cargó, el login sigue funcionando sin el aviso
  if (typeof swal === "undefined") {
    return;
  }
  swal({
    title: "Error 403: Acceso restringido",
    text: "No hay una sesión activa. Iniciá sesión para entrar a esa página.",
    icon: "error",
    buttons: "Entendido",
  });
}

function configurarLogin() {
  var form = document.getElementById("login-form");
  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    var pin = document.getElementById("pin").value;
    var errores = validarDatos({ pin: pin }, REGLAS_PIN);

    if (errores) {
      swal("PIN inválido", unirErrores(errores), "error");
      return;
    }
    if (validarPin(pin)) {
      mostrarBienvenida();
    } else {
      swal("PIN incorrecto", "El PIN ingresado no corresponde a ninguna cuenta.", "error");
    }
  });
}

// ===== Operaciones =====

// Detalle que se guarda con cada movimiento según su tipo
function detalleOperacion(tipo, form) {
  if (tipo === "deposito") {
    return "Depósito en ventanilla";
  }
  if (tipo === "retiro") {
    return "Retiro en cajero";
  }
  var servicio = form.querySelector('[name="service"]').value;
  var referencia = form.querySelector('[name="reference"]').value;
  return servicio + " (Ref. " + referencia + ")";
}

function procesarOperacion(tipo, form) {
  var datos = { monto: form.querySelector('[name="amount"]').value };
  var reglas = REGLAS_MONTO;
  if (tipo === "pago") {
    datos.servicio = form.querySelector('[name="service"]').value;
    datos.referencia = form.querySelector('[name="reference"]').value;
    reglas = REGLAS_PAGO;
  }

  var errores = validarDatos(datos, reglas);
  if (errores) {
    swal("Datos inválidos", unirErrores(errores), "error");
    return;
  }

  var monto = parseFloat(datos.monto);
  var saldoActual = obtenerSaldo();

  if (tipo !== "deposito" && monto > saldoActual) {
    swal("Saldo insuficiente", "Tu saldo disponible es " + formatearMonto(saldoActual) + ".", "warning");
    return;
  }

  var movimiento = registrarMovimiento(tipo, monto, detalleOperacion(tipo, form));
  actualizarSaldo();
  dibujarTabla();
  form.reset();
  confirmarOperacion(movimiento);
}

// Diálogo de éxito con opción de descargar el comprobante en PDF
function confirmarOperacion(movimiento) {
  var texto =
    nombreMovimiento(movimiento.tipo) + " de " + formatearMonto(movimiento.monto) +
    ". Tu nuevo saldo es " + formatearMonto(movimiento.saldo) + ".";
  swal({
    title: "¡Transacción exitosa!",
    text: texto,
    icon: "success",
    buttons: ["Cerrar", "Descargar comprobante (PDF)"],
  }).then(function (descargar) {
    if (descargar) {
      generarComprobante(movimiento);
    }
  });
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
    swal("Saldo disponible", "Tu saldo actual es " + formatearMonto(obtenerSaldo()) + ".", "info");
  });
}

// ===== Datos del usuario y tabla de movimientos =====

function actualizarSaldo() {
  var celda = document.querySelector("[data-balance]");
  if (celda === null) return;
  celda.textContent = formatearMonto(obtenerSaldo());
}

// Muestra el nombre y la cuenta guardados en LocalStorage
function actualizarDatosUsuario() {
  var usuario = obtenerUsuario();
  var nombre = document.querySelector("[data-nombre]");
  var cuenta = document.querySelector("[data-cuenta]");
  var topbar = document.querySelector("[data-usuario]");
  if (nombre !== null) nombre.textContent = usuario.nombre.split(" ")[0];
  if (cuenta !== null) cuenta.textContent = "N.º " + usuario.cuenta;
  if (topbar !== null) topbar.textContent = usuario.nombre;
}

function crearFila(movimiento) {
  var fila = document.createElement("tr");
  var esDeposito = movimiento.tipo === "deposito";
  var monto = (esDeposito ? "+" : "−") + formatearMonto(movimiento.monto);
  fila.innerHTML =
    "<td>" + nombreMovimiento(movimiento.tipo) + "<small>" + movimiento.detalle + "</small></td>" +
    "<td>" + movimiento.fecha + " · " + movimiento.hora + "</td>" +
    '<td class="' + (esDeposito ? "positive" : "negative") + '">' + monto + "</td>" +
    '<td><span class="tag">Completado</span></td>' +
    '<td><button class="btn-pdf" type="button" data-folio="' + movimiento.folio + '">PDF ↓</button></td>';
  return fila;
}

function dibujarTabla() {
  var cuerpo = document.getElementById("transactions");
  if (cuerpo === null) return;
  var movimientos = obtenerMovimientos();
  cuerpo.innerHTML = "";

  if (movimientos.length === 0) {
    cuerpo.innerHTML =
      '<tr><td colspan="5" class="vacio">Todavía no has realizado movimientos en esta cuenta.</td></tr>';
    return;
  }
  for (var i = 0; i < movimientos.length; i++) {
    cuerpo.appendChild(crearFila(movimientos[i]));
  }
}

// Un solo oyente en la tabla para todos los botones de comprobante
function configurarComprobantes() {
  var cuerpo = document.getElementById("transactions");
  if (cuerpo === null) return;
  cuerpo.addEventListener("click", function (evento) {
    var boton = evento.target.closest("button");
    if (boton === null) return;

    var folio = parseInt(boton.getAttribute("data-folio"), 10);
    var movimientos = obtenerMovimientos();
    for (var i = 0; i < movimientos.length; i++) {
      if (movimientos[i].folio === folio) {
        generarComprobante(movimientos[i]);
        return;
      }
    }
  });
}

// ===== Comprobante en PDF (jsPDF) =====

function generarComprobante(movimiento) {
  if (typeof jspdf === "undefined") {
    swal("Comprobante no disponible", "No se pudo generar el PDF. Volvé a intentarlo.", "error");
    return;
  }

  var usuario = obtenerUsuario();
  var doc = new jspdf.jsPDF();

  doc.setFontSize(16);
  doc.text("Pokémon Bank", 20, 20);
  doc.setFontSize(11);
  doc.text("Comprobante de transacción", 20, 27);
  doc.line(20, 32, 190, 32);

  doc.setFontSize(10);
  doc.text("Cliente: " + usuario.nombre, 20, 42);
  doc.text("Cuenta: " + usuario.cuenta, 20, 48);
  doc.text("Folio: " + movimiento.folio, 20, 54);
  doc.text("Fecha: " + movimiento.fecha + " - " + movimiento.hora, 20, 60);
  doc.text("Operación: " + nombreMovimiento(movimiento.tipo), 20, 66);
  doc.text("Detalle: " + movimiento.detalle, 20, 72);
  doc.text("Monto: " + formatearMonto(movimiento.monto), 20, 78);
  doc.text("Saldo después de la operación: " + formatearMonto(movimiento.saldo), 20, 84);

  doc.line(20, 92, 190, 92);
  doc.setFontSize(8);
  doc.text("Comprobante generado por el cajero automático. Documento educativo sin validez bancaria.", 20, 100);

  doc.save("comprobante-" + movimiento.folio + ".pdf");
}

// ===== Gráfica (Chart.js) =====

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

// ===== Cerrar sesión =====

function configurarSalida() {
  var enlaces = document.querySelectorAll("[data-logout]");
  for (var i = 0; i < enlaces.length; i++) {
    enlaces[i].addEventListener("click", cerrarSesion);
  }
}

// ===== Arranque según la página =====

var pagina = document.body.getAttribute("data-page");

// Crea los datos del usuario en LocalStorage si todavía no existen
inicializarUsuario();

if (pagina === "login") {
  // Si ya hay sesión activa, manda directo al menú de la cuenta
  if (sessionStorage.getItem(CLAVE_SESION) !== null) {
    window.location.replace("acciones.html");
  } else {
    mostrarAccesoDenegado();
    configurarLogin();
  }
}
if (pagina === "acciones") {
  if (revisarSesion()) {
    actualizarDatosUsuario();
    actualizarSaldo();
    dibujarTabla();
    configurarOperaciones();
    configurarBotonSaldo();
    configurarComprobantes();
  }
}
if (pagina === "grafico") {
  if (revisarSesion()) {
    actualizarDatosUsuario();
    configurarGrafico();
  }
}
if (pagina === "historial") {
  if (revisarSesion()) {
    actualizarDatosUsuario();
    dibujarTabla();
    configurarComprobantes();
  }
}
configurarSalida();
