# Miga · Calculadora de panadería

Aplicación estática en español. Abre `index.html` en un navegador: no requiere instalación ni conexión a servicios externos.

## Estructura

- `recipes.js`: catálogo de recetas, ingredientes, alternativas y procedimiento del pan de caja.
- `calculator.js`: validación y escalado puro, sin acceso a la interfaz ni mutaciones de la receta original.
- `app.js`: selección de recetas, estado de la interfaz, lista de ingredientes e impresión.
- `styles.css`: diseño adaptable, estados accesibles, movimiento reducido y presentación de impresión.
- `tests/calculator.test.js`: pruebas de regresión con el ejecutor integrado de Node.js.

## Pruebas

Con Node.js instalado, ejecuta `npm test` o `node --test`.

## Reglas de cálculo

Una tanda corresponde a la receta original. Se aceptan cantidades entre 0.01 y 100, con punto o coma decimal. Los datos vacíos, negativos, cero, infinitos o con texto no producen una receta calculada. Las cantidades se multiplican desde la receta base y solo se redondean para mostrarlas, hasta dos decimales. Las alternativas de levadura y las equivalencias aproximadas de huevo también se escalan. Gramos y mililitros se conservan como unidades diferentes.

El apartado de peso total estima la suma de todos los ingredientes antes de hornear. Para este cálculo aproximado se considera 1 ml de líquido como 1 g; no se convierten las cantidades de la lista. Se desglosan masa (incluido Tangzhong), cobertura, glaseado o relleno cuando corresponde. No se suman dos veces las piezas de huevo ni las alternativas de levadura. El peso no descuenta restos en utensilios ni pérdida de humedad. La receta actual de pan de caja estima 970 g por tanda (1940 g en dos tandas).

Al cambiar la receta o las tandas se reinicia la lista marcada para evitar confundir cantidades anteriores con las nuevas. La impresión incluye ingredientes y, cuando existe, el procedimiento; omite los controles.

## Recetas

Se conservan las cantidades originales de conchas, donas, roles y bocadillo. En conchas se conservan los 200 g de huevo y se elimina la equivalencia contradictoria de dos piezas. Las equivalencias de huevo de las otras recetas son orientativas: el peso sin cáscara es la referencia.

La referencia inicial de pan de caja se transcribió del PDF proporcionado: 500 g de harina, 280 ml de leche, 50 g de huevo, 50 g de azúcar, 65 g de mantequilla, 20 g de leche en polvo, 6 g de levadura instantánea y 8 g de sal. El catálogo actual conserva los ajustes posteriores: 50 g de mantequilla, 11 g de levadura y 9 g de sal. Incluye los seis pasos, molde de 23–25 cm y horneado a 175 °C durante 30–40 minutos. Los tiempos, la temperatura y las dimensiones del molde no se multiplican por las tandas.

## Verificación de interfaz

Comprobado en Chrome en anchos de 320, 375, 390, 768, 1024 y 1440 px, con las cinco recetas; además de orientación horizontal, validaciones, selección por teclado nativa, equivalencias de levadura, marcado de ingredientes y estilos de impresión. No requiere Tailwind CDN, fuentes remotas ni dependencias de producción.

## Laboratorio de pan

`experiments.js` es un motor de reglas puro. Las funciones `metrics` y `formulate` trabajan sobre una copia de la receta actual: las variantes no se acumulan y nunca alteran el catálogo. Los ingredientes tienen un `role` explícito; el roux se identifica con `technique: 'tangzhong'`. Harina y porcentajes excluyen rellenos y coberturas.

Se pueden elegir cinco objetivos y dos intensidades. La elección actualiza directamente ingredientes, peso total, comparación base/variante y recomendaciones. Cambiar de receta vuelve a la base; cambiar tandas escala la variante. El botón «Volver a la base» conserva las tandas. Las variantes y su preparación se incluyen en la impresión, incluso si el laboratorio estaba cerrado.

Las reglas son hipótesis para pruebas domésticas, no un modelo capaz de predecir volumen o textura exactos:

- **Esponjosidad:** reserva 5 % o 7.5 % de la harina para Tangzhong, con cinco partes de leche por parte de harina. Conserva el roux existente en roles. Ajusta la leche hasta al menos 65 % o 68 % de agua estimada sobre harina. No añade dos veces los ingredientes reservados.
- **Volumen:** limita grasas añadidas a 15 % o 12 % y azúcar a 12 % o 10 % de la harina cuando la base supera esos valores. Añade líquido para subir el agua estimada 1.5 o 3 puntos porcentuales, sin forzar aumentos sobre el 70 %. Estos límites son heurísticos y no prometen un aumento medido de volumen.
- **Ternura:** añade mantequilla equivalente a 1.5 % o 3 % de la harina, con límite de 22 % de mantequilla y otras grasas añadidas en conjunto.
- **Menos dulce:** reduce únicamente el azúcar de la masa un 25 % o 40 %. No elimina azúcar de rellenos ni coberturas.
- **Corteza más crujiente:** sustituye 25 % o 50 % de la leche principal por su agua estimada y reduce grasas añadidas un 20 % o 35 %. Se excluye esta opción para las donas fritas. La fórmula sigue siendo enriquecida y requiere comprobar el horneado.

Para estimar agua se usan fracciones de 0.87 para leche, 0.74 para huevo y 0.16 para mantequilla, con 1 ml ≈ 1 g para líquidos. No se modelan variaciones de marca, pérdida de agua al cocinar roux, evaporación en horno ni humedad residual de ingredientes secos. «Grasas añadidas» es peso de ingredientes grasos, no análisis nutricional. Las equivalencias de huevo y levadura no se suman como ingredientes adicionales. No se modifican huevo, sal o levadura; si la base tiene al menos 2 % de levadura seca, se recuerda vigilar la fermentación.

Fuentes para los principios y fracciones de agua, consultadas el 28 de octubre de 2026:

- [King Arthur Baking: conversión a Tangzhong y agua de ingredientes](https://www.kingarthurbaking.com/blog/2018/07/23/how-to-convert-a-bread-recipe-to-tangzhong).
- [American Society of Baking: Tangzhong](https://asbe.org/article/tangzhong-method/).
- [New Mexico State University: función de los ingredientes](https://pubs.nmsu.edu/_e/E206/index.html).

Los incrementos, topes y combinaciones son decisiones de la herramienta para explorar tendencias. Una recomendación científica sobre un mecanismo no valida automáticamente una fórmula: hay que probarla con la harina, equipo y condiciones reales. Las instrucciones del laboratorio prevalecen sobre la preparación de referencia cuando cambian el método.
