# Miga · Calculadora de panadería

Aplicación estática en español. Abre `index.html` en un navegador: no requiere instalación ni conexión a servicios externos.

## Estructura

- `recipes.js`: catálogo de recetas, ingredientes, alternativas y procedimiento del pan de caja.
- `calculator.js`: validación y escalado puro, sin acceso a la interfaz ni mutaciones de la receta original.
- `app.js`: selección de recetas, estado de la interfaz, lista de ingredientes e impresión.
- `styles.css`: diseño adaptable, estados accesibles, movimiento reducido y presentación de impresión.
- `tests/calculator.test.js`: pruebas de regresión con el ejecutor integrado de Node.js.

## Pruebas

Con Node.js instalado, ejecuta `npm test` o `node --test tests/calculator.test.js`.

## Reglas de cálculo

Una tanda corresponde a la receta original. Se aceptan cantidades entre 0.01 y 100, con punto o coma decimal. Los datos vacíos, negativos, cero, infinitos o con texto no producen una receta calculada. Las cantidades se multiplican desde la receta base y solo se redondean para mostrarlas, hasta dos decimales. Las alternativas de levadura y las equivalencias aproximadas de huevo también se escalan. Gramos y mililitros se conservan como unidades diferentes.

El apartado de peso total estima la suma de todos los ingredientes antes de hornear. Para este cálculo aproximado se considera 1 ml de líquido como 1 g; no se convierten las cantidades de la lista. Se desglosan masa (incluido Tangzhong), cobertura, glaseado o relleno cuando corresponde. No se suman dos veces las piezas de huevo ni las alternativas de levadura. El peso no descuenta restos en utensilios ni pérdida de humedad. Una tanda de pan de caja estima 979 g y dos tandas, 1958 g.

Al cambiar la receta o las tandas se reinicia la lista marcada para evitar confundir cantidades anteriores con las nuevas. La impresión incluye ingredientes y, cuando existe, el procedimiento; omite los controles.

## Recetas

Se conservan las cantidades originales de conchas, donas, roles y bocadillo. En conchas se conservan los 200 g de huevo y se elimina la equivalencia contradictoria de dos piezas. Las equivalencias de huevo de las otras recetas son orientativas: el peso sin cáscara es la referencia.

Pan de caja se transcribió del PDF proporcionado: 500 g de harina, 280 ml de leche, 50 g de huevo, 50 g de azúcar, 65 g de mantequilla, 20 g de leche en polvo, 6 g de levadura instantánea y 8 g de sal. Incluye los seis pasos, molde de 23–25 cm y horneado a 175 °C durante 30–40 minutos. Los tiempos, la temperatura y las dimensiones del molde no se multiplican por las tandas.

## Verificación de interfaz

Comprobado en Chrome en anchos de 320, 375, 390, 768, 1024 y 1440 px, con las cinco recetas; además de orientación horizontal, validaciones, selección por teclado nativa, equivalencias de levadura, marcado de ingredientes y estilos de impresión. No requiere Tailwind CDN, fuentes remotas ni dependencias de producción.
