/** Pure calculations shared by the interface and regression tests. */
const BakingCalculator = (() => {
  const MIN_BATCHES = 0.01;
  const MAX_BATCHES = 100;
  const formatter = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 });

  function parseBatches(raw) {
    const normalized = String(raw).trim().replace(',', '.');
    if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
    const value = Number(normalized);
    return Number.isFinite(value) && value >= MIN_BATCHES && value <= MAX_BATCHES ? value : null;
  }

  function scaleRecipe(recipe, batches) {
    if (!Number.isFinite(batches) || batches < MIN_BATCHES || batches > MAX_BATCHES) {
      throw new RangeError('Las tandas deben estar entre 0.01 y 100.');
    }
    return recipe.sections.map(section => ({
      ...section,
      ingredients: section.ingredients.map(ingredient => ({
        ...ingredient,
        amount: ingredient.amount * batches,
        ...(ingredient.pieces ? { pieces: ingredient.pieces * batches } : {}),
        ...(ingredient.alternative ? { alternative: {
          ...ingredient.alternative, amount: ingredient.alternative.amount * batches
        } } : {})
      }))
    }));
  }

  /** Pre-baking estimate: liquids use the explicit approximation 1 ml ≈ 1 g.
   * Alternatives and egg counts describe the same ingredient, so are not added.
   */
  function estimateMass(sections) {
    const breakdown = sections.map(section => ({
      title: section.title,
      kind: section.kind || 'dough',
      grams: section.ingredients.reduce((sum, ingredient) => {
        if (!['g', 'ml'].includes(ingredient.unit)) {
          throw new TypeError(`Unidad no compatible: ${ingredient.unit}`);
        }
        return sum + ingredient.amount;
      }, 0)
    }));
    return {
      total: breakdown.reduce((sum, section) => sum + section.grams, 0),
      dough: breakdown.filter(section => section.kind === 'dough').reduce((sum, section) => sum + section.grams, 0),
      extras: breakdown.filter(section => section.kind !== 'dough').reduce((sum, section) => sum + section.grams, 0),
      hasLiquids: sections.some(section => section.ingredients.some(ingredient => ingredient.unit === 'ml')),
      breakdown
    };
  }

  return { MIN_BATCHES, MAX_BATCHES, parseBatches, scaleRecipe, estimateMass, format: value => formatter.format(value) };
})();
if (typeof module !== 'undefined') module.exports = BakingCalculator;
