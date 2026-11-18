// Datos y movimientos de la cuenta que se guardan en LocalStorage

var CLAVE_USUARIO = "pokemon-bank-usuario";
var CLAVE_MOVIMIENTOS = "pokemon-bank-movimientos";

// Datos del titular que piden las indicaciones de la fase 2
var USUARIO_INICIAL = {
  nombre: "Ash Ketchum",
  pin: "1234",
  cuenta: "0987654321",
  saldo: 0,
};

// Crea los datos del usuario la primera vez que se entra al cajero
function inicializarUsuario() {
  if (localStorage.getItem(CLAVE_USUARIO) === null) {
    guardarUsuario(USUARIO_INICIAL);
  }
}

function obtenerUsuario() {
  return JSON.parse(localStorage.getItem(CLAVE_USUARIO));
}

function guardarUsuario(usuario) {
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

function validarPin(pinIngresado) {
  return pinIngresado === obtenerUsuario().pin;
}

function obtenerMovimientos() {
  var guardados = localStorage.getItem(CLAVE_MOVIMIENTOS);
  if (guardados === null) {
    return [];
  }
  return JSON.parse(guardados);
}

function guardarMovimientos(lista) {
  localStorage.setItem(CLAVE_MOVIMIENTOS, JSON.stringify(lista));
}

// Registra un movimiento, actualiza el saldo y devuelve lo guardado
function registrarMovimiento(tipo, monto, detalle) {
  var usuario = obtenerUsuario();
  var movimientos = obtenerMovimientos();

  if (tipo === "deposito") {
    usuario.saldo = usuario.saldo + monto;
  } else {
    usuario.saldo = usuario.saldo - monto;
  }

  var movimiento = {
    folio: movimientos.length + 1,
    tipo: tipo,
    detalle: detalle,
    monto: monto,
    fecha: formatearFecha(new Date()),
    hora: formatearHora(new Date()),
    saldo: usuario.saldo,
  };

  movimientos.push(movimiento);
  guardarMovimientos(movimientos);
  guardarUsuario(usuario);
  return movimiento;
}

function obtenerSaldo() {
  return obtenerUsuario().saldo;
}

// Suma los depósitos entradas y los retiros con pagos salidas
function obtenerTotales() {
  var movimientos = obtenerMovimientos();
  var entradas = 0;
  var salidas = 0;
  for (var i = 0; i < movimientos.length; i++) {
    if (movimientos[i].tipo === "deposito") {
      entradas += movimientos[i].monto;
    } else {
      salidas += movimientos[i].monto;
    }
  }
  return { entradas: entradas, salidas: salidas, cantidad: movimientos.length };
}

function formatearFecha(fecha) {
  var meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return fecha.getDate() + " " + meses[fecha.getMonth()] + " " + fecha.getFullYear();
}

function formatearHora(fecha) {
  var horas = fecha.getHours();
  var minutos = fecha.getMinutes();
  if (horas < 10) horas = "0" + horas;
  if (minutos < 10) minutos = "0" + minutos;
  return horas + ":" + minutos;
}
