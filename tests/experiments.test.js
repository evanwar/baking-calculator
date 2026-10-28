const test = require('node:test');
const assert = require('node:assert/strict');
const recipes = require('../recipes.js');
const { GOALS, formulate, metrics } = require('../experiments.js');
const { scaleRecipe, estimateMass } = require('../calculator.js');
const dough = recipe => recipe.sections.filter(s => !s.kind || s.kind === 'dough').flatMap(s => s.ingredients);
const sum = (recipe, role) => dough(recipe).filter(i => i.role === role).reduce((s, i) => s + i.amount, 0);
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);

test('every supported trial preserves base, flour, salt, yeast, eggs and toppings', () => {
  for (const recipe of Object.values(recipes)) {
    const snapshot = JSON.stringify(recipe);
    for (const goal of Object.keys(GOALS)) {
      if (recipe.icon === 'donut' && goal === 'crisp') continue;
      for (const level of [1, 2]) {
        const trial = formulate(recipe, goal, level);
        close(sum(trial.recipe, 'flour'), sum(recipe, 'flour'));
        for (const role of ['salt','yeast','egg']) close(sum(trial.recipe, role), sum(recipe, role));
        assert.deepEqual(trial.recipe.sections.filter(s => s.kind), recipe.sections.filter(s => s.kind));
        for (const section of trial.recipe.sections) for (const ingredient of section.ingredients) {
          assert.ok(Number.isFinite(ingredient.amount) && ingredient.amount > 0);
          assert.ok(ingredient.role);
        }
        for (const batches of [.01, .5, 1, 2, 100]) {
          close(estimateMass(scaleRecipe(trial.recipe, batches)).total, estimateMass(scaleRecipe(trial.recipe, 1)).total * batches);
        }
        assert.equal(JSON.stringify(recipe), snapshot);
        assert.deepEqual(trial, formulate(recipe, goal, level));
      }
    }
  }
});
test('Tangzhong conserves total flour, uses a 1:5 roux and never duplicates existing roux', () => {
  const trial = formulate(recipes.panDeCaja, 'fluffy');
  const roux = trial.recipe.sections[0];
  assert.equal(roux.technique, 'tangzhong');
  assert.equal(roux.ingredients[0].amount, 25);
  assert.equal(roux.ingredients[1].amount, 125);
  close(trial.after.hydration, 65);
  assert.ok(trial.after.hydration > trial.before.hydration);
  for (const level of [1,2]) {
    const roles = formulate(recipes.roles, 'fluffy', level);
    assert.equal(roles.recipe.sections.filter(s => s.technique === 'tangzhong').length, 1);
    assert.deepEqual(roles.recipe.sections[0], recipes.roles.sections[0]);
  }
});
test('more volume moderates enrichment and never adds yeast or forces higher water above limit', () => {
  const trial = formulate(recipes.roles, 'volume', 2);
  close(trial.after.addedFats, 12);
  close(trial.after.sugar, 10);
  assert.ok(trial.after.hydration >= trial.before.hydration);
  assert.equal(trial.after.yeast, trial.before.yeast);
  assert.ok(trial.after.hydration <= 70 + 1e-8);
  const high = formulate(recipes.conchas, 'volume');
  assert.ok(high.after.hydration <= high.before.hydration);
});
test('tenderness caps added fats; less sweet only adjusts dough sugar', () => {
  const tender = formulate(recipes.conchas, 'tender', 2);
  close(tender.after.addedFats, 22);
  const mild = formulate(recipes.panDeCaja, 'lessSweet', 1);
  const strong = formulate(recipes.panDeCaja, 'lessSweet', 2);
  close(sum(mild.recipe, 'sugar'), sum(recipes.panDeCaja, 'sugar') * .75);
  close(sum(strong.recipe, 'sugar'), sum(recipes.panDeCaja, 'sugar') * .60);
  assert.equal(strong.changes.length,1);
});
test('crust trial replaces only removed milk water, reduces butter and disallows fried doughnuts', () => {
  const trial = formulate(recipes.panDeCaja, 'crisp', 2);
  close(sum(trial.recipe, 'milk'),140);
  close(sum(trial.recipe, 'water'),121.8);
  close(sum(trial.recipe, 'butter'),sum(recipes.panDeCaja, 'butter') * .65);
  assert.throws(() => formulate(recipes.donas, 'crisp'), RangeError);
});
test('original restores exact data; unsupported goals, levels and flourless recipes fail explicitly', () => {
  assert.deepEqual(formulate(recipes.panDeCaja).recipe, recipes.panDeCaja);
  assert.deepEqual(formulate(recipes.panDeCaja).changes, []);
  assert.throws(() => formulate(recipes.panDeCaja, 'magic'), RangeError);
  assert.throws(() => formulate(recipes.panDeCaja, 'volume', 10), RangeError);
  assert.throws(() => metrics({sections:[]}), RangeError);
});
