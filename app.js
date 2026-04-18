// Recetas base (1 tanda = receta original)
const recipes = {
    conchas: {
        name: "Conchas",
        description: "Receta tradicional de conchas mexicanas con masa suave y cobertura crujiente",
        ingredients: [
            { name: "Harina de trigo", amount: 560, unit: "g" },
            { name: "Sal", amount: 9, unit: "g" },
            { name: "Levadura Seca (Tradipan)", amount: 7, unit: "g" },
            { name: "Leche tibia", amount: 280, unit: "g" },
            { name: "Huevo", amount: 200, unit: "g", pieces: 2, pieceText: "piezas grandes" },
            { name: "Vainilla", amount: 5, unit: "g" },
            { name: "Azúcar", amount: 100, unit: "g" },
            { name: "Mantequilla (temperatura ambiente)", amount: 75, unit: "g" },
            { name: "Manteca de cerdo", amount: 25, unit: "g" }
        ],
        topping: [
            { name: "Harina de trigo (cobertura)", amount: 100, unit: "g" },
            { name: "Azúcar glass (cobertura)", amount: 100, unit: "g" },
            { name: "Manteca vegetal tipo Inca (cobertura)", amount: 100, unit: "g" }
        ]
    },
    donas: {
        name: "Donas sin Huevo",
        description: "Donas esponjosas y deliciosas sin huevo",
        ingredients: [
            { name: "Harina", amount: 600, unit: "g" },
            { name: "Azúcar", amount: 80, unit: "g" },
            { name: "Sal", amount: 6, unit: "g" },
            { name: "Levadura", amount: 8, unit: "g" },
            { name: "Leche", amount: 400, unit: "ml" },
            { name: "Mantequilla", amount: 60, unit: "g" }
        ],
        topping: [
            { name: "Azúcar glass (glaseado)", amount: 200, unit: "g" },
            { name: "Leche (glaseado)", amount: 60, unit: "ml" },
            { name: "Extracto de vainilla (glaseado)", amount: 5, unit: "ml" }
        ]
    },
    roles: {
        name: "Roles Esponjosos (Tangzhong)",
        description: "Roles ultra suaves con técnica Tangzhong",
        sections: [
            {
                title: "Tangzhong (Roux)",
                ingredients: [
                    { name: "Harina de fuerza", amount: 25, unit: "g" },
                    { name: "Leche", amount: 125, unit: "ml" }
                ]
            },
            {
                title: "Masa Principal",
                ingredients: [
                    { name: "Harina de fuerza", amount: 475, unit: "g" },
                    { name: "Leche en polvo", amount: 25, unit: "g" },
                    { name: "Leche tibia", amount: 150, unit: "ml" },
                    { name: "Huevos medianos", amount: 100, unit: "g", pieces: 2, pieceText: "huevos medianos" },
                    { name: "Azúcar", amount: 80, unit: "g" },
                    { name: "Sal", amount: 8, unit: "g" },
                    { name: "Levadura seca", amount: 10, unit: "g (o 25 g fresca)" },
                    { name: "Mantequilla suave", amount: 80, unit: "g" }
                ]
            },
            {
                title: "Relleno",
                ingredients: [
                    { name: "Mantequilla suavizada", amount: 40, unit: "g" },
                    { name: "Azúcar morena", amount: 60, unit: "g" },
                    { name: "Canela en polvo", amount: 10, unit: "g" }
                ]
            }
        ]
    }
};

let currentRecipe = null;

function selectRecipe(recipeKey) {
    currentRecipe = recipeKey;
    
    // Update button styles
    document.querySelectorAll('.recipe-btn').forEach(btn => {
        btn.classList.remove('bg-amber-600', 'text-white', 'ring-4', 'ring-amber-300');
        btn.classList.add('bg-white', 'text-amber-800');
    });
    
    const selectedBtn = document.getElementById(`btn-${recipeKey}`);
    selectedBtn.classList.remove('bg-white', 'text-amber-800');
    selectedBtn.classList.add('bg-amber-600', 'text-white', 'ring-4', 'ring-amber-300');
    
    // Show recipe info
    const recipe = recipes[recipeKey];
    document.getElementById('recipeName').textContent = recipe.name;
    document.getElementById('recipeDescription').textContent = recipe.description;
    document.getElementById('recipeInfo').classList.remove('hidden');
    
    // Calculate ingredients
    calculateIngredients();
}

function calculateIngredients() {
    if (!currentRecipe) return;
    
    const batches = parseFloat(document.getElementById('batchInput').value) || 1;
    const recipe = recipes[currentRecipe];
    
    let html = `
        <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            Ingredientes para ${batches} ${batches === 1 ? 'tanda' : 'tandas'}
        </h3>
    `;
    
    // Si la receta tiene secciones (como roles), renderizar por secciones
    if (recipe.sections) {
        recipe.sections.forEach((section, index) => {
            html += `
                <div class="mb-8">
                    <h4 class="text-lg font-semibold text-amber-700 mb-4 pb-2 border-b-2 border-amber-200">
                        ${['🌾', '🍞', '🧈'][index] || '📝'} ${section.title}
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            `;
            
            section.ingredients.forEach(ingredient => {
                const calculatedAmount = (ingredient.amount * batches).toFixed(2);
                const displayAmount = parseFloat(calculatedAmount) % 1 === 0 
                    ? parseInt(calculatedAmount) 
                    : calculatedAmount;
                
                // Calcular piezas si el ingrediente las tiene
                let unitDisplay = ingredient.unit;
                if (ingredient.pieces) {
                    const totalPieces = ingredient.pieces * batches;
                    unitDisplay = `${ingredient.unit} (≈ ${totalPieces} ${ingredient.pieceText})`;
                }
                    
                html += `
                    <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-amber-50 transition-colors">
                        <span class="text-gray-700 font-medium">${ingredient.name}</span>
                        <span class="text-amber-700 font-bold text-lg">${displayAmount} ${unitDisplay}</span>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
    } else {
        // Recetas tradicionales con ingredients + topping
        html += `
            <div class="mb-8">
                <h4 class="text-lg font-semibold text-amber-700 mb-4 pb-2 border-b-2 border-amber-200">
                    🍞 Masa Principal
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        `;
        
        recipe.ingredients.forEach(ingredient => {
            const calculatedAmount = (ingredient.amount * batches).toFixed(2);
            const displayAmount = parseFloat(calculatedAmount) % 1 === 0 
                ? parseInt(calculatedAmount) 
                : calculatedAmount;
            
            // Calcular piezas si el ingrediente las tiene
            let unitDisplay = ingredient.unit;
            if (ingredient.pieces) {
                const totalPieces = ingredient.pieces * batches;
                unitDisplay = `${ingredient.unit} (≈ ${totalPieces} ${ingredient.pieceText})`;
            }
                
            html += `
                <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-amber-50 transition-colors">
                    <span class="text-gray-700 font-medium">${ingredient.name}</span>
                    <span class="text-amber-700 font-bold text-lg">${displayAmount} ${unitDisplay}</span>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        // Agregar cobertura/glaseado si existe
        if (recipe.topping) {
            html += `
                <div>
                    <h4 class="text-lg font-semibold text-amber-700 mb-4 pb-2 border-b-2 border-amber-200">
                        ✨ ${currentRecipe === 'donas' ? 'Glaseado' : 'Cobertura'}
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            `;
            
            recipe.topping.forEach(ingredient => {
                const calculatedAmount = (ingredient.amount * batches).toFixed(2);
                const displayAmount = parseFloat(calculatedAmount) % 1 === 0 
                    ? parseInt(calculatedAmount) 
                    : calculatedAmount;
                
                // Calcular piezas si el ingrediente las tiene
                let unitDisplay = ingredient.unit;
                if (ingredient.pieces) {
                    const totalPieces = ingredient.pieces * batches;
                    unitDisplay = `${ingredient.unit} (≈ ${totalPieces} ${ingredient.pieceText})`;
                }
                    
                html += `
                    <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-amber-50 transition-colors">
                        <span class="text-gray-700 font-medium">${ingredient.name}</span>
                        <span class="text-amber-700 font-bold text-lg">${displayAmount} ${unitDisplay}</span>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
    }
    
    html += `
        <!-- Print Button -->
        <div class="mt-8 text-center">
            <button onclick="window.print()" 
                class="bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
                🖨️ Imprimir Lista
            </button>
        </div>
    `;
    
    document.getElementById('ingredientsList').innerHTML = html;
}

// Initialize with default values
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('batchInput').value = 1;
});
