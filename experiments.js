/** Rule-based formulation trials, not a predictive model of loaf volume.
 * Percentages and step sizes are conservative product heuristics for these recipes.
 * Scientific principles and water fractions are documented in README.md and the UI.
 */
const BakingExperiments = (() => {
  'use strict';
  const GOALS = {
    original: { name: 'Receta base', description: 'Sin ajustes' },
    fluffy: { name: 'Más esponjoso', description: 'Tangzhong y humedad' },
    volume: { name: 'Más volumen', description: 'Favorecer la expansión' },
    tender: { name: 'Más tierno', description: 'Una miga más delicada' },
    lessSweet: { name: 'Menos dulce', description: 'Reducir azúcar en la masa' },
    crisp: { name: 'Corteza más crujiente', description: 'Menos enriquecimiento' }
  };
  const WATER = { milk: .87, egg: .74, butter: .16, water: 1 };
  const isDough = section => !section.kind || section.kind === 'dough';
  const ingredientsOf = recipe => recipe.sections.filter(isDough).flatMap(section => section.ingredients);
  const sumRole = (recipe, roles) => ingredientsOf(recipe).filter(i => roles.includes(i.role)).reduce((sum, i) => sum + i.amount, 0);
  const waterMass = recipe => ingredientsOf(recipe).reduce((sum, i) => sum + i.amount * (WATER[i.role] || 0), 0);

  function metrics(recipe) {
    const flour = sumRole(recipe, ['flour']);
    if (!(flour > 0)) throw new RangeError('La masa necesita harina para calcular porcentajes panaderos.');
    return {
      flour,
      hydration: waterMass(recipe) / flour * 100,
      sugar: sumRole(recipe, ['sugar']) / flour * 100,
      addedFats: sumRole(recipe, ['butter', 'fat']) / flour * 100,
      salt: sumRole(recipe, ['salt']) / flour * 100,
      yeast: sumRole(recipe, ['yeast']) / flour * 100
    };
  }

  function compare(base, variant) {
    const entries = recipe => new Map(recipe.sections.flatMap(section => section.ingredients.map(i => [
      `${section.title}\u0000${i.name}`, { section: section.title, name: i.name, unit: i.unit, amount: i.amount }
    ])));
    const before = entries(base), after = entries(variant);
    return [...new Set([...before.keys(), ...after.keys()])].flatMap(key => {
      const a = before.get(key), b = after.get(key);
      const from = a?.amount || 0, to = b?.amount || 0;
      return Math.abs(from - to) > 1e-8 ? [{ ...(b || a), from, to }] : [];
    });
  }

  function formulate(base, goal = 'original', level = 1) {
    if (!Object.hasOwn(GOALS, goal) || ![1, 2].includes(level)) throw new RangeError('Objetivo o intensidad no válidos.');
    if (goal === 'crisp' && base.icon === 'donut') throw new RangeError('La corteza crujiente se propone solo para pan horneado, no para donas fritas.');
    const recipe = JSON.parse(JSON.stringify(base));
    const before = metrics(base);
    const notes = [];
    const instructions = [];
    const explanations = [];
    const flour = before.flour;
    const milk = ingredientsOf(recipe).find(i => i.role === 'milk' && !recipe.sections.find(s => s.technique === 'tangzhong')?.ingredients.includes(i));
    const adjustRoles = (roles, multiplier) => ingredientsOf(recipe).filter(i => roles.includes(i.role)).forEach(i => { i.amount *= multiplier; });
    const increaseHydration = target => {
      const deficit = Math.max(0, flour * target - waterMass(recipe));
      if (milk) milk.amount += deficit / WATER.milk;
      else if (deficit > 0) throw new RangeError('Esta receta no tiene un líquido principal compatible.');
    };
    if (goal === 'fluffy') {
      increaseHydration(level === 1 ? .65 : .68);
      if (!recipe.sections.some(s => s.technique === 'tangzhong')) {
        const section = recipe.sections.find(s => isDough(s) && s.ingredients.some(i => i.role === 'flour'));
        const sourceFlour = section.ingredients.find(i => i.role === 'flour');
        const reserved = flour * (level === 1 ? .05 : .075);
        if (!milk || sourceFlour.amount <= reserved || milk.amount <= reserved * 5) throw new RangeError('No hay harina y leche suficientes para reservar el Tangzhong.');
        sourceFlour.amount -= reserved;
        milk.amount -= reserved * 5;
        recipe.sections.unshift({ title: 'Tangzhong · roux', technique: 'tangzhong', ingredients: [
          { ...sourceFlour, amount: reserved }, { ...milk, amount: reserved * 5 }
        ] });
      } else notes.push('Esta receta ya contiene Tangzhong: se conserva sin duplicarlo.');
      explanations.push('El almidón precocido retiene agua y ayuda a mantener una miga suave. La harina y la leche del roux se reservan de la receta, no se suman de nuevo.');
      instructions.push('Antes de la mezcla: cocina SOLO la harina y la leche de la sección Tangzhong, removiendo hasta obtener una pasta espesa. Deja enfriar antes de mezclar con la levadura.', 'Mezcla esa pasta con los ingredientes restantes de la masa principal. Evita añadir harina para eliminar toda la pegajosidad.');
      notes.push('Objetivo de prueba: agua estimada de al menos 65 % o 68 % sobre harina según intensidad. No es la misma medida que el porcentaje de leche.');
      if (recipe.category.includes('sin Tangzhong')) recipe.category = recipe.category.replace('sin Tangzhong', 'con Tangzhong');
    }
    if (goal === 'volume') {
      const fatLimit = level === 1 ? .15 : .12;
      const fats = sumRole(recipe, ['butter', 'fat']);
      if (fats > flour * fatLimit) adjustRoles(['butter', 'fat'], flour * fatLimit / fats);
      const sugarLimit = level === 1 ? .12 : .10;
      const sugar = sumRole(recipe, ['sugar']);
      if (sugar > flour * sugarLimit) adjustRoles(['sugar'], flour * sugarLimit / sugar);
      increaseHydration(Math.min(.70, before.hydration / 100 + (level === 1 ? .015 : .03)));
      explanations.push('La red de gluten debe retener el CO₂ de la fermentación. Ajustar líquido y moderar el enriquecimiento puede facilitar la expansión; aumentar la levadura no garantiza más volumen.');
      instructions.push('Usa harina de fuerza y desarrolla una masa elástica antes de incorporar la grasa. Forma con tensión superficial sin desgarrar.', 'Observa el crecimiento y la respuesta de la masa al tacto; los minutos de la receta base dejan de ser una referencia exacta. Evita sobrefermentar.');
      notes.push('No se predice un aumento de volumen en porcentaje. Puede disminuir el dulzor y el sabor a mantequilla.');
    }
    if (goal === 'tender') {
      const fats = sumRole(recipe, ['butter', 'fat']);
      const butter = ingredientsOf(recipe).find(i => i.role === 'butter');
      if (butter) butter.amount += Math.max(0, Math.min(flour * (level === 1 ? .015 : .03), flour * .22 - fats));
      explanations.push('La grasa suaviza la textura al interferir con la red de gluten. Una miga más tierna puede tener menos estructura y no necesariamente más volumen.');
      instructions.push('Incorpora la mantequilla después de desarrollar parcialmente el gluten. Continúa amasando hasta integrar y evalúa la fermentación por el crecimiento.');
      notes.push('Se limita la mantequilla y otras grasas añadidas al 22 % de la harina; no es un cálculo de grasa nutricional.');
    }
    if (goal === 'lessSweet') {
      adjustRoles(['sugar'], level === 1 ? .75 : .60);
      explanations.push('Reducir el azúcar cambia dulzor y dorado. También puede modificar el ritmo de fermentación y la retención de humedad.');
      instructions.push('Comprueba el crecimiento con más frecuencia; no compenses la reducción de azúcar añadiendo levadura. Vigila el horneado aunque la corteza quede más clara.');
      notes.push('Solo se reduce el azúcar de la masa, 25 % o 40 % según intensidad; cobertura, glaseado y relleno se conservan. No es una receta sin azúcar.');
    }
    if (goal === 'crisp') {
      const replaced = milk.amount * (level === 1 ? .25 : .50);
      milk.amount -= replaced;
      const section = recipe.sections.find(s => s.ingredients.includes(milk));
      section.ingredients.push({ name: 'Agua', role: 'water', amount: replaced * WATER.milk, unit: 'g' });
      adjustRoles(['butter', 'fat'], level === 1 ? .80 : .65);
      explanations.push('Menos leche y grasa favorece una corteza menos suave. El agua añadida sustituye el agua estimada de la porción de leche retirada.');
      instructions.push('Conserva la temperatura de la receta como punto de partida y observa el dorado: no se ha validado un nuevo tiempo de horno.', 'Enfría destapado sobre rejilla y evita pincelar con mantequilla. La técnica de horneado también determina el crujiente.');
      notes.push('La masa sigue enriquecida con huevo, azúcar o leche en polvo cuando los contiene; no se convierte en una baguette. El relleno y la cobertura también afectan el resultado.');
    }
    if (goal !== 'original') {
      notes.push('Prueba una tanda pequeña. La absorción de la harina, la temperatura, el amasado y la fermentación pueden cambiar el resultado.');
      if (before.yeast >= 2) notes.push('La receta base contiene al menos 2 % de levadura seca: vigila el crecimiento para evitar sobrefermentación. Se conserva esa cantidad.');
      if (base.icon === 'donut') notes.push('Se mantiene la preparación original de las donas; estas propuestas no incluyen ajustes de fritura.');
    }
    const changes = compare(base, recipe);
    if (goal !== 'original' && changes.length === 0) notes.push('La fórmula ya cumple los límites de esta propuesta; no se fuerzan cambios de ingredientes.');
    return { recipe, goal, level, before, after: metrics(recipe), changes, explanations, instructions, notes };
  }
  return { GOALS, metrics, formulate };
})();
if (typeof module !== 'undefined') module.exports = BakingExperiments;
