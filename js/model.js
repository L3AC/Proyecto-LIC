var SALDO_INICIAL = 1200;
var CLAVE_MOVIMIENTOS = "pokemon-bank-movimientos";

var movimientosIniciales = [
  { tipo: "deposito", detalle: "Abono de prueba", monto: 200, fecha: "17 oct 2026" },
  { tipo: "retiro", detalle: "Retiro de prueba", monto: 50, fecha: "17 oct 2026" },
  { tipo: "pago", detalle: "Internet", monto: 45, fecha: "17 oct 2026" },
];

function formatearFecha(fecha) {
  var meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return fecha.getDate() + " " + meses[fecha.getMonth()] + " " + fecha.getFullYear();
}

function obtenerMovimientos() {
  var guardados = localStorage.getItem(CLAVE_MOVIMIENTOS);
  if (guardados === null) {
    return movimientosIniciales.slice();
  }
  return JSON.parse(guardados);
}

function guardarMovimientos(lista) {
  localStorage.setItem(CLAVE_MOVIMIENTOS, JSON.stringify(lista));
}

function registrarMovimiento(tipo, monto, detalle) {
  var movimientos = obtenerMovimientos();
  var nuevo = {
    tipo: tipo,
    detalle: detalle,
    monto: monto,
    fecha: formatearFecha(new Date()),
  };
  movimientos.push(nuevo);
  guardarMovimientos(movimientos);
  return nuevo;
}

function obtenerSaldo() {
  var saldo = SALDO_INICIAL;
  var movimientos = obtenerMovimientos();
  for (var i = 0; i < movimientos.length; i++) {
    if (movimientos[i].tipo === "deposito") {
      saldo = saldo + movimientos[i].monto;
    } else {
      saldo = saldo - movimientos[i].monto;
    }
  }
  return saldo;
}

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

function validarPin(pin) {
  return pin === "1234";
}
