# UNIVERSIDAD DON BOSCO
## Datawarehouse y Minería de Datos
### Experiencia de Aprendizaje 2: Proyecto de Cátedra - Fase 2 (35%)

* **Agrupamientos:** Grupos
* **Fecha de Entrega de Actividad:** 27 de noviembre

---

### Indicaciones Generales
Usando el código realizado en la fase 1 del proyecto, e incluyendo las correcciones realizadas por el docente, se busca un mecanismo en JavaScript del lado del cliente para inicializar los datos del usuario y registrar todas las transacciones que se realicen.

---

### Planteamiento del Problema
Para acceder al cajero automático es necesario solicitar al usuario el ingreso del PIN, si dicho valor es correcto se debe mostrar su nombre y número de cuenta, dando la opción de seleccionar la transacción a efectuar o salir.

Los datos del usuario deben ser los siguientes:
* **Nombre:** Ash Ketchum
* **PIN:** 1234
* **Cuenta:** 0987654321
* **Saldo inicial:** 00.00

---

### Aspectos Generales del Proyecto

* **Validaciones:**
  Haciendo uso de la investigación realizada en la fase anterior, se busca que se puedan validar todos los campos de entrada que se hayan diseñado dentro de la solución. Se recomienda utilizar ValidateJS.

* **Interactividad con el usuario:**
  Emplear diálogos para interactuar con el usuario y no las típicas funciones de JavaScript como prompt() y alert(). Se recomienda utilizar SweetAlert.

* **Comprobante de transacciones:**
  Se debe permitir al usuario imprimir un comprobante en formato PDF después de realizar una transacción. Se recomienda utilizar jsPDF.

* **Uso de gráficos:**
  Se debe crear al menos un gráfico para mostrar el número de transacciones realizadas por cada tipo. Se recomienda utilizar Chart.js.

* **Uso LocalStorage:**
  Se debe utilizar LocalStorage para el manejo de la información del usuario, donde debe guardarse los datos de este.

---

### Rúbrica de Evaluación (Descripción de Criterios)

1. **Diseño:** Presentación de sitio/solución web.
2. **LocalStorage:** Inicio de sesión e inicialización de los datos del usuario usando JSON o LocalStorage.
3. **Manejo de transacciones:** Se ha preparado la solución para el manejo de transacciones por parte del usuario.
4. **Interfaz:** Se muestra el uso correcto de diálogos interactivos.
5. **Detalles de transacciones:** Se genera un comprobante de cada transacción generada por el usuario.
6. **Gráfico:** Se evidencia el uso de gráficos para mostrar el número de transacciones realizadas por cada tipo.
7. **Buenas prácticas de programación:** Se han realizado buenas prácticas de programación.
8. **Comentarios:** Se han agregado comentarios dentro del código que permiten la comprensión de la funcionalidad de la programación.
9. **Experiencia de usuario:** La experiencia del usuario resulta ser satisfactoria, sin errores y permitiendo el uso correcto de la aplicación.
