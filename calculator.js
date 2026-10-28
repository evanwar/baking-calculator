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

  return { MIN_BATCHES, MAX_BATCHES, parseBatches, scaleRecipe, format: value => formatter.format(value) };
})();
if (typeof module !== 'undefined') module.exports = BakingCalculator;
