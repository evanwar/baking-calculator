const test = require('node:test');
const assert = require('node:assert/strict');
const recipes = require('../recipes.js');
const { parseBatches, scaleRecipe, estimateMass } = require('../calculator.js');

test('rejects empty, zero, negative, out-of-range and malformed batches', () => {
  for (const input of ['', ' ', '0', '-1', 'Infinity', 'NaN', '2abc', '1.2.3', '1e2', '100.01', '0.001']) {
    assert.equal(parseBatches(input), null, input);
  }
});
test('accepts decimal comma, point and boundary values', () => {
  for (const [input, expected] of [['1,5', 1.5], ['0.5', .5], ['0.01', .01], ['100', 100], [' 2 ', 2]]) {
    assert.equal(parseBatches(input), expected);
  }
});
test('all ingredients, eggs and yeast alternatives scale without mutating originals', () => {
  for (const recipe of Object.values(recipes)) {
    const original = JSON.stringify(recipe);
    for (const factor of [.01, .25, .5, 1, 1.5, 2, 100]) {
      const scaled = scaleRecipe(recipe, factor);
      scaled.forEach((section, index) => section.ingredients.forEach((ingredient, i) => {
        const base = recipe.sections[index].ingredients[i];
        assert.equal(ingredient.amount, base.amount * factor);
        if (base.pieces) assert.equal(ingredient.pieces, base.pieces * factor);
        if (base.alternative) assert.equal(ingredient.alternative.amount, base.alternative.amount * factor);
        assert.ok(Number.isFinite(ingredient.amount) && ingredient.amount > 0);
        assert.ok(['g', 'ml'].includes(ingredient.unit));
      }));
    }
    assert.equal(JSON.stringify(recipe), original);
  }
});
test('fresh yeast alternatives scale for roles and bocadillos', () => {
  const roles = scaleRecipe(recipes.roles, 2)[1].ingredients.find(i => i.alternative);
  assert.equal(roles.amount, 20);
  assert.equal(roles.alternative.amount, 50);
  const bocadillo = scaleRecipe(recipes.bocadillo, .5)[0].ingredients.find(i => i.alternative);
  assert.equal(bocadillo.amount, 4);
  assert.equal(bocadillo.alternative.amount, 8);
});
test('pan de caja preserves current recipe and scales to half or double', () => {
  const expected = [500, 280, 50, 50, 50, 20, 11, 9];
  assert.deepEqual(recipes.panDeCaja.sections[0].ingredients.map(i => i.amount), expected);
  for (const factor of [.5, 2]) {
    assert.deepEqual(scaleRecipe(recipes.panDeCaja, factor)[0].ingredients.map(i => i.amount), expected.map(x => x * factor));
  }
  assert.equal(recipes.panDeCaja.steps.length, 6);
  assert.equal(recipes.panDeCaja.oven, '175 °C');
  assert.equal(recipes.panDeCaja.time, '30–40 min');
});
test('calculation API rejects invalid numeric factors', () => {
  for (const factor of [0, -1, NaN, Infinity, 101, '2', null]) {
    assert.throws(() => scaleRecipe(recipes.panDeCaja, factor), RangeError);
  }
});

test('mass estimates pan de caja before baking with explicit liquid approximation', () => {
  const mass = estimateMass(scaleRecipe(recipes.panDeCaja, 1));
  assert.equal(mass.total, 970);
  assert.equal(mass.dough, 970);
  assert.equal(mass.extras, 0);
  assert.equal(mass.hasLiquids, true);
  assert.equal(estimateMass(scaleRecipe(recipes.panDeCaja, 2)).total, 1940);
  assert.equal(estimateMass(scaleRecipe(recipes.panDeCaja, .5)).total, 485);
});

test('mass separates dough and toppings and counts Tangzhong as dough', () => {
  const conchas = estimateMass(scaleRecipe(recipes.conchas, 1));
  assert.equal(conchas.dough, 1141);
  assert.equal(conchas.extras, 300);
  assert.equal(conchas.total, 1441);
  assert.equal(conchas.hasLiquids, false);
  const roles = estimateMass(scaleRecipe(recipes.roles, 1));
  assert.equal(roles.dough, 1078);
  assert.equal(roles.extras, 110);
  assert.equal(roles.total, 1188);
  const donas = estimateMass(scaleRecipe(recipes.donas, 1));
  assert.equal(donas.dough, 1154);
  assert.equal(donas.extras, 265);
  assert.equal(donas.total, 1419);
});

test('mass does not double-count egg equivalents or alternative yeast', () => {
  assert.equal(estimateMass(scaleRecipe(recipes.bocadillo, 1)).total, 681);
  assert.throws(() => estimateMass([{ title: 'Unknown', ingredients: [{ amount: 1, unit: 'cup' }] }]), TypeError);
});
