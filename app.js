/* Recipe data and calculations live in recipes.js and calculator.js. */
(() => {
  'use strict';
  const { parseBatches, scaleRecipe, estimateMass, format, MIN_BATCHES, MAX_BATCHES } = BakingCalculator;
  const $ = id => document.getElementById(id);
  const state = { recipeKey: 'panDeCaja', batches: 1, goal: 'original', level: 1 };
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
    renderExperimentGoals();
    renderCalculation();
  }

  function renderCalculation() {
    const batches = parseBatches($('batchInput').value);
    const valid = batches !== null;
    $('labActiveVariant').hidden = state.goal === 'original';
    $('labActiveVariant').textContent = `Variante: ${BakingExperiments.GOALS[state.goal].name}${valid ? '' : ' · revisa las tandas'}`;
    $('batchInput').setAttribute('aria-invalid', String(!valid));
    $('batchError').hidden = valid;
    $('print').disabled = !valid;
    $('decrease').disabled = valid && batches <= MIN_BATCHES;
    $('increase').disabled = valid && batches >= MAX_BATCHES;
    document.querySelectorAll('[data-batches]').forEach(button => {
      button.setAttribute('aria-pressed', String(valid && Number(button.dataset.batches) === batches));
    });
    if (!valid) {
      $('experimentResult').hidden = true;
      $('massEstimate').hidden = true;
      $('ingredientsList').replaceChildren();
      $('batchLabel').textContent = 'Cantidad pendiente';
      $('scaleValue').textContent = '—';
      $('checkProgress').textContent = 'Revisa la cantidad de tandas.';
      $('calculationStatus').textContent = 'No se pueden calcular los ingredientes. Revisa las tandas.';
      return;
    }
    state.batches = batches;
    const experiment = BakingExperiments.formulate(RECIPES[state.recipeKey], state.goal, state.level);
    const sections = scaleRecipe(experiment.recipe, batches);
    renderExperiment(experiment, batches);
    const mass = renderMassEstimate(sections);
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
    $('calculationStatus').textContent = `${RECIPES[state.recipeKey].name}, ${BakingExperiments.GOALS[state.goal].name}: ingredientes actualizados para ${format(batches)} ${batches === 1 ? 'tanda' : 'tandas'}. Peso total aproximado: ${format(mass.total)} g. Lista de ingredientes reiniciada.`;
  }

  function renderExperimentGoals() {
    $('experimentGoals').innerHTML = Object.entries(BakingExperiments.GOALS).map(([key, goal]) => {
      const unavailable = key === 'crisp' && state.recipeKey === 'donas';
      return `<label class="experiment-choice"><input type="radio" name="experimentGoal" value="${key}" ${state.goal === key ? 'checked' : ''} ${unavailable ? 'disabled' : ''}><span><strong>${goal.name}</strong><small>${unavailable ? 'Solo para pan horneado' : goal.description}</small></span></label>`;
    }).join('');
    $('experimentIntensity').disabled = state.goal === 'original';
  }

  function renderExperiment(experiment, batches) {
    const active = state.goal !== 'original';
    const recipe = experiment.recipe;
    $('experimentResult').hidden = !active;
    $('recipeTag').textContent = active ? 'VARIANTE EXPERIMENTAL' : 'RECETA DE CASA';
    $('recipeCategory').textContent = recipe.category;
    $('checklistHelp').textContent = active ? 'Ingredientes de la variante seleccionada. Marca cada uno cuando lo tengas listo.' : 'Marca cada ingrediente cuando lo tengas listo.';
    $('methodTitle').textContent = active ? 'Preparación de referencia · aplica los ajustes del laboratorio' : 'De la masa al pan';
    // Show the working recipe, including a newly introduced Tangzhong stage.
    const steps = (recipe.steps || []).map(step => ({ ...step }));
    if (state.goal === 'fluffy' && steps.length) {
      steps[0].text = 'Mezcla el Tangzhong ya frío con los ingredientes restantes de la masa principal. La harina y la leche del roux ya están descontadas de esa sección.';
      steps.unshift({ title: 'Prepara el Tangzhong', text: experiment.instructions[0] });
    }
    $('method').hidden = steps.length === 0;
    $('methodSteps').innerHTML = steps.map(step => `<li><h4>${step.title}</h4><p>${step.text}</p></li>`).join('');
    if (!active) return;
    $('experimentTitle').textContent = BakingExperiments.GOALS[state.goal].name;
    $('experimentBatch').textContent = `Variante aplicada · ${state.level === 1 ? 'ajuste moderado' : 'ajuste más marcado'} · ${format(batches)} ${batches === 1 ? 'tanda' : 'tandas'}. Harina total de la masa: ${format(experiment.after.flour * batches)} g.`;
    $('experimentMetrics').innerHTML = [
      ['Agua estimada', 'hydration'], ['Azúcar en masa', 'sugar'], ['Grasas añadidas¹', 'addedFats']
    ].map(([label, key]) => `<div><span>${label}</span><strong>${format(experiment.before[key])} % <span aria-hidden="true">→</span> ${format(experiment.after[key])} %</strong></div>`).join('') + '<p class="help">¹ Peso de mantequilla y otras grasas añadidas; no es grasa nutricional.</p>';
    $('experimentChanges').innerHTML = experiment.changes.map(change => `<tr><th scope="row">${change.name}<small>${change.section}</small></th><td>${format(change.from * batches)} ${change.unit}</td><td>${format(change.to * batches)} ${change.unit}</td></tr>`).join('');
    $('experimentNoChanges').hidden = experiment.changes.length > 0;
    $('experimentChanges').closest('.lab-table-wrap').hidden = experiment.changes.length === 0;
    for (const [id, items] of [['experimentScience', experiment.explanations], ['experimentTechnique', experiment.instructions], ['experimentNotes', experiment.notes]]) {
      $(id).replaceChildren(...items.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    }
  }

  function renderMassEstimate(sections) {
    const mass = estimateMass(sections);
    const weight = grams => `${format(grams)} g${grams >= 1000 ? ` · ${format(grams / 1000)} kg` : ''}`;
    $('massEstimate').hidden = false;
    $('massTotal').textContent = `≈ ${weight(mass.total)}`;
    const parts = mass.breakdown.filter(section => section.kind !== 'dough');
    $('massBreakdown').hidden = parts.length === 0;
    $('massBreakdown').innerHTML = parts.length ? [
      { title: sections.filter(section => !section.kind || section.kind === 'dough').length > 1 ? 'Masa con Tangzhong' : 'Masa principal', grams: mass.dough }, ...parts
    ].map(part => `<div><dt>${part.title}</dt><dd>≈ ${weight(part.grams)}</dd></div>`).join('') : '';
    $('massHelp').textContent = `${mass.hasLiquids ? 'Para esta estimación usamos 1 ml de líquido ≈ 1 g. ' : ''}El peso final puede variar por restos en los utensilios y pérdida de humedad al hornear. Se usa la levadura indicada como principal.`;
    return mass;
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
    state.goal = 'original';
    document.querySelectorAll('[data-recipe]').forEach(option => {
      const selected = option === button;
      option.setAttribute('aria-pressed', String(selected));
      option.querySelector('.selected-check').hidden = !selected;
    });
    renderRecipe();
  });
  $('batchInput').addEventListener('input', renderCalculation);
  $('experimentGoals').addEventListener('change', event => {
    state.goal = event.target.value;
    $('experimentIntensity').disabled = state.goal === 'original';
    renderCalculation();
  });
  $('experimentIntensity').addEventListener('change', event => {
    state.level = Number(event.target.value);
    renderCalculation();
  });
  $('restoreRecipe').addEventListener('click', () => {
    state.goal = 'original';
    renderExperimentGoals();
    renderCalculation();
    $('experimentGoals').querySelector('input:checked').focus();
  });
  document.querySelectorAll('[data-batches]').forEach(button => button.addEventListener('click', () => setBatches(Number(button.dataset.batches))));
  $('decrease').addEventListener('click', () => setBatches(Math.max(MIN_BATCHES, (parseBatches($('batchInput').value) ?? state.batches) - 0.25)));
  $('increase').addEventListener('click', () => setBatches(Math.min(MAX_BATCHES, (parseBatches($('batchInput').value) ?? state.batches) + 0.25)));
  $('reset').addEventListener('click', () => setBatches(1));
  $('ingredientsList').addEventListener('change', updateProgress);
  $('print').addEventListener('click', () => { if (parseBatches($('batchInput').value) !== null) window.print(); });
  let labWasOpen = false;
  window.addEventListener('beforeprint', () => {
    labWasOpen = $('experimentLab').open;
    if (state.goal !== 'original') $('experimentLab').open = true;
  });
  window.addEventListener('afterprint', () => { $('experimentLab').open = labWasOpen; });
  renderPicker();
  renderRecipe();
})();
