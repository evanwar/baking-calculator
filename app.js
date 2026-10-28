/* Recipe data and calculations live in recipes.js and calculator.js. */
(() => {
  'use strict';
  const { parseBatches, scaleRecipe, format, MIN_BATCHES, MAX_BATCHES } = BakingCalculator;
  const $ = id => document.getElementById(id);
  const state = { recipeKey: 'panDeCaja', batches: 1 };
  const icons = {
    concha: '<path d="M5 25C0 12 9 4 16 4s16 8 11 21Z"/><path d="M16 5v20M16 5C8 11 7 16 8 25M16 5c8 6 9 11 8 20M4 18h24M7 11h18"/>',
    donut: '<circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="4"/><path d="m8 11 2 1m10-4 1 2m3 9-2 1m-8 4-2-1m-4-6 1-1m9 6 1-1"/>',
    roll: '<path d="M26 23c-3 7-18 8-22-2C-1 8 11 1 22 6c11 5 7 18-1 19-8 2-15-4-13-10s12-7 14-1-6 9-8 4 4-4 4-1"/>',
    bun: '<path d="M3 16C3 2 29 2 29 16ZM3 21h26v5H3ZM3 19h26M10 10l1-1m5 2 1-1m5 0 1-1"/>',
    loaf: '<path d="M6 16C0 10 7 3 13 7c3-3 9-2 11 2 7-1 9 6 4 10v9H6Z"/><path d="M13 10v12m8-9v10M6 25h22"/>'
  };

  function renderPicker() {
    $('recipeOptions').innerHTML = Object.entries(RECIPES).map(([key, recipe]) => `
      <button type="button" class="recipe-option" data-recipe="${key}" aria-pressed="${key === state.recipeKey}">
        <svg class="recipe-icon" viewBox="0 0 32 32" aria-hidden="true">${icons[recipe.icon]}</svg>
        <strong>${recipe.shortName}</strong><small>${key === 'panDeCaja' ? 'Pan de leche' : recipe.category}</small>
        <span class="selected-check" aria-hidden="true" ${key === state.recipeKey ? '' : 'hidden'}>✓</span>
      </button>`).join('');
  }

  function renderRecipe() {
    const recipe = RECIPES[state.recipeKey];
    $('recipeName').textContent = recipe.name;
    $('recipeCategory').textContent = recipe.category;
    $('recipeDescription').textContent = recipe.description;
    $('recipeNote').hidden = !recipe.note;
    $('recipeNote').textContent = recipe.note || '';
    $('recipeFacts').hidden = !recipe.yield;
    $('recipeFacts').innerHTML = recipe.yield ? [
      ['Por tanda', recipe.yield], ['Molde', recipe.mold], ['Horno', recipe.oven], ['Horneado', recipe.time]
    ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('') : '';
    $('method').hidden = !recipe.steps;
    $('methodSteps').innerHTML = (recipe.steps || []).map(step => `<li><h4>${step.title}</h4><p>${step.text}</p></li>`).join('');
    $('recipeSource').textContent = recipe.source || '';
    document.title = `${recipe.name} · Miga`;
    renderCalculation();
  }

  function renderCalculation() {
    const batches = parseBatches($('batchInput').value);
    const valid = batches !== null;
    $('batchInput').setAttribute('aria-invalid', String(!valid));
    $('batchError').hidden = valid;
    $('print').disabled = !valid;
    $('decrease').disabled = valid && batches <= MIN_BATCHES;
    $('increase').disabled = valid && batches >= MAX_BATCHES;
    document.querySelectorAll('[data-batches]').forEach(button => {
      button.setAttribute('aria-pressed', String(valid && Number(button.dataset.batches) === batches));
    });
    if (!valid) {
      $('ingredientsList').replaceChildren();
      $('batchLabel').textContent = 'Cantidad pendiente';
      $('scaleValue').textContent = '—';
      $('checkProgress').textContent = 'Revisa la cantidad de tandas.';
      $('calculationStatus').textContent = 'No se pueden calcular los ingredientes. Revisa las tandas.';
      return;
    }
    state.batches = batches;
    const sections = scaleRecipe(RECIPES[state.recipeKey], batches);
    $('scaleValue').textContent = `× ${format(batches)}`;
    $('batchLabel').textContent = `${format(batches)} ${batches === 1 ? 'tanda' : 'tandas'}`;
    $('ingredientsList').innerHTML = sections.map((section, sectionIndex) => `
      <section class="ingredient-section" aria-labelledby="section-${sectionIndex}">
        <h4 id="section-${sectionIndex}"><span>${String(sectionIndex + 1).padStart(2, '0')}</span> ${section.title}</h4>
        ${section.ingredients.map(ingredient => {
          const equivalent = ingredient.alternative
            ? `o ${format(ingredient.alternative.amount)} ${ingredient.alternative.unit} de ${ingredient.alternative.name}`
            : ingredient.pieces ? `≈ ${format(ingredient.pieces)} ${ingredient.pieces === 1 ? 'huevo' : 'huevos'} · pesar` : '';
          return `<label class="ingredient-row"><input type="checkbox"><span class="ingredient-name">${ingredient.name}</span><span class="ingredient-quantity">${format(ingredient.amount)} <small>${ingredient.unit}</small>${equivalent ? `<span class="equivalent">${equivalent}</span>` : ''}</span></label>`;
        }).join('')}
      </section>`).join('');
    updateProgress();
    $('calculationStatus').textContent = `${RECIPES[state.recipeKey].name}: ingredientes actualizados para ${format(batches)} ${batches === 1 ? 'tanda' : 'tandas'}. Lista de ingredientes reiniciada.`;
  }

  function updateProgress() {
    const total = $('ingredientsList').querySelectorAll('input').length;
    const ready = $('ingredientsList').querySelectorAll('input:checked').length;
    $('checkProgress').textContent = `${ready} de ${total} ingredientes listos${ready === total ? ' · ¡A hornear!' : ''}`;
  }

  function setBatches(value) {
    $('batchInput').value = String(Math.round(value * 100) / 100);
    renderCalculation();
  }

  $('recipeOptions').addEventListener('click', event => {
    const button = event.target.closest('[data-recipe]');
    if (!button) return;
    state.recipeKey = button.dataset.recipe;
    document.querySelectorAll('[data-recipe]').forEach(option => {
      const selected = option === button;
      option.setAttribute('aria-pressed', String(selected));
      option.querySelector('.selected-check').hidden = !selected;
    });
    renderRecipe();
  });
  $('batchInput').addEventListener('input', renderCalculation);
  document.querySelectorAll('[data-batches]').forEach(button => button.addEventListener('click', () => setBatches(Number(button.dataset.batches))));
  $('decrease').addEventListener('click', () => setBatches(Math.max(MIN_BATCHES, (parseBatches($('batchInput').value) ?? state.batches) - 0.25)));
  $('increase').addEventListener('click', () => setBatches(Math.min(MAX_BATCHES, (parseBatches($('batchInput').value) ?? state.batches) + 0.25)));
  $('reset').addEventListener('click', () => setBatches(1));
  $('ingredientsList').addEventListener('change', updateProgress);
  $('print').addEventListener('click', () => { if (parseBatches($('batchInput').value) !== null) window.print(); });
  renderPicker();
  renderRecipe();
})();
