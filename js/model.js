(function (global) {
  "use strict";

  const TIPOS_VALIDOS = ["deposito", "retiro", "pago"];
  const SERVICIOS_VALIDOS = ["Energía eléctrica", "Internet", "Telefonía", "Agua potable"];
  const SALDO_INICIAL_CENTAVOS = 120000;

  function crearEstadoInicial() {
    const movimientosDemostracion = [
      {
        id: 1,
        type: "pago",
        cents: 4500,
        service: "Internet",
        reference: "123456",
        date: "2026-10-17T09:00:00-06:00",
      },
      {
        id: 2,
        type: "retiro",
        cents: 5000,
        service: "",
        reference: "",
        date: "2026-10-17T09:10:00-06:00",
      },
      {
        id: 3,
        type: "deposito",
        cents: 20000,
        service: "",
        reference: "",
        date: "2026-10-17T09:20:00-06:00",
      },
    ];
    return {
      version: 1,
      opening: SALDO_INICIAL_CENTAVOS,
      transactions: movimientosDemostracion,
    };
  }

  function calcularSaldo(estado) {
    let saldo = estado.opening;
    estado.transactions.forEach(function (mov) {
      if (mov.type === "deposito") saldo += mov.cents;
      else saldo -= mov.cents;
    });
    return saldo;
  }

  function convertirMonto(valorIngresado) {
    const texto = String(valorIngresado).trim();
    const patronNumerico = /^\d+(\.\d{1,2})?$/;
    if (!patronNumerico.test(texto)) {
      throw new Error("Ingresá un monto válido con un máximo de dos decimales.");
    }
    const centavos = Math.round(Number(texto) * 100);
    const LIMITE_MONTO_CENTAVOS = 1000000;
    if (!Number.isSafeInteger(centavos) || centavos < 1 || centavos > LIMITE_MONTO_CENTAVOS) {
      throw new Error("El monto debe estar entre $0.01 y $10,000.00.");
    }
    return centavos;
  }

  function calcularSiguienteId(estado) {
    let mayorId = 0;
    estado.transactions.forEach(function (mov) {
      if (mov.id > mayorId) mayorId = mov.id;
    });
    return mayorId + 1;
  }

  function registrarTransaccion(estado, tipo, valorIngresado, servicio = "", referencia = "") {
    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new Error("Tipo de operación inválido.");
    }
    const centavos = convertirMonto(valorIngresado);
    if (tipo !== "deposito" && centavos > calcularSaldo(estado)) {
      throw new Error("Saldo insuficiente para completar la operación.");
    }
    if (tipo === "pago") {
      if (!SERVICIOS_VALIDOS.includes(servicio)) {
        throw new Error("Seleccioná un servicio válido.");
      }
      const patronReferencia = /^\d{6,12}$/;
      if (!patronReferencia.test(referencia)) {
        throw new Error("La referencia debe contener entre 6 y 12 dígitos.");
      }
    }
    const nuevaOperacion = {
      id: calcularSiguienteId(estado),
      type: tipo,
      cents: centavos,
      service: servicio,
      reference: referencia,
      date: new Date().toISOString(),
    };
    const nuevaLista = [nuevaOperacion].concat(estado.transactions);
    return {
      version: estado.version,
      opening: estado.opening,
      transactions: nuevaLista,
    };
  }

  function esMovimientoValido(mov) {
    if (!TIPOS_VALIDOS.includes(mov.type)) return false;
    if (!Number.isSafeInteger(mov.cents) || mov.cents <= 0) return false;
    if (!Number.isSafeInteger(mov.id)) return false;
    if (typeof mov.service !== "string") return false;
    if (typeof mov.reference !== "string") return false;
    if (!Number.isFinite(Date.parse(mov.date))) return false;
    return true;
  }

  function esEstadoValido(estado) {
    if (!estado || estado.version !== 1) return false;
    if (estado.opening !== SALDO_INICIAL_CENTAVOS) return false;
    if (!Array.isArray(estado.transactions)) return false;
    for (const mov of estado.transactions) {
      if (!esMovimientoValido(mov)) return false;
    }
    const saldo = calcularSaldo(estado);
    if (!Number.isSafeInteger(saldo) || saldo < 0) return false;
    return true;
  }

  global.Bank = {
    initial: crearEstadoInicial,
    balance: calcularSaldo,
    parseAmount: convertirMonto,
    transact: registrarTransaccion,
    valid: esEstadoValido,
  };

  if (typeof module !== "undefined") module.exports = global.Bank;
})(typeof globalThis !== "undefined" ? globalThis : this);
