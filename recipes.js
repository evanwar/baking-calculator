const RECIPES = {
  conchas: {
    name: 'Conchas', shortName: 'Conchas', category: 'El clásico mexicano', icon: 'concha',
    description: 'Masa suave, una cubierta crujiente y ese sabor que siempre se siente como en casa.',
    note: 'La receta original indica 200 g de huevo. Pésalo sin cáscara; se omite la equivalencia anterior de 2 piezas porque no coincide con ese peso.',
    sections: [
      { title: 'Masa principal', ingredients: [
        { name: 'Harina de trigo', role: 'flour', amount: 500, unit: 'g' },
        { name: 'Sal', role: 'salt', amount: 9, unit: 'g' },
        { name: 'Levadura seca (Tradipan)', role: 'yeast', amount: 7, unit: 'g' },
        { name: 'Leche tibia', role: 'milk', amount: 220, unit: 'g' },
        { name: 'Huevo sin cáscara', role: 'egg', amount: 200, unit: 'g' },
        { name: 'Vainilla', role: 'other', amount: 5, unit: 'g' },
        { name: 'Azúcar', role: 'sugar', amount: 100, unit: 'g' },
        { name: 'Mantequilla a temperatura ambiente', role: 'butter', amount: 75, unit: 'g' },
        { name: 'Manteca de cerdo', role: 'fat', amount: 25, unit: 'g' }
      ] },
      { title: 'Cobertura', kind: 'topping', ingredients: [
        { name: 'Harina de trigo', role: 'flour', amount: 100, unit: 'g' },
        { name: 'Azúcar glass', role: 'sugar', amount: 100, unit: 'g' },
        { name: 'Manteca vegetal tipo Inca', role: 'fat', amount: 100, unit: 'g' }
      ] }
    ]
  },
  donas: {
    name: 'Donas sin huevo', shortName: 'Donas', category: 'Suaves y glaseadas', icon: 'donut',
    description: 'Esponjosas por dentro, con un glaseado de vainilla para terminar. Una receta sin huevo.',
    sections: [
      { title: 'Masa principal', ingredients: [
        { name: 'Harina', role: 'flour', amount: 600, unit: 'g' }, { name: 'Azúcar', role: 'sugar', amount: 80, unit: 'g' },
        { name: 'Sal', role: 'salt', amount: 6, unit: 'g' }, { name: 'Levadura', role: 'yeast', amount: 8, unit: 'g' },
        { name: 'Leche', role: 'milk', amount: 400, unit: 'ml' }, { name: 'Mantequilla', role: 'butter', amount: 60, unit: 'g' }
      ] },
      { title: 'Glaseado', kind: 'topping', ingredients: [
        { name: 'Azúcar glass', role: 'sugar', amount: 200, unit: 'g' }, { name: 'Leche', role: 'milk', amount: 60, unit: 'ml' },
        { name: 'Extracto de vainilla', role: 'other', amount: 5, unit: 'ml' }
      ] }
    ]
  },
  roles: {
    name: 'Roles esponjosos', shortName: 'Roles', category: 'Con técnica Tangzhong', icon: 'roll',
    description: 'Una masa extra suave y un relleno de mantequilla, azúcar morena y canela.',
    sections: [
      { title: 'Tangzhong · roux', technique: 'tangzhong', ingredients: [
        { name: 'Harina de fuerza', role: 'flour', amount: 25, unit: 'g' }, { name: 'Leche', role: 'milk', amount: 125, unit: 'ml' }
      ] },
      { title: 'Masa principal', ingredients: [
        { name: 'Harina de fuerza', role: 'flour', amount: 475, unit: 'g' }, { name: 'Leche en polvo', role: 'milkPowder', amount: 25, unit: 'g' },
        { name: 'Leche tibia', role: 'milk', amount: 150, unit: 'ml' },
        { name: 'Huevo sin cáscara', role: 'egg', amount: 100, unit: 'g', pieces: 2 },
        { name: 'Azúcar', role: 'sugar', amount: 80, unit: 'g' }, { name: 'Sal', role: 'salt', amount: 8, unit: 'g' },
        { name: 'Levadura seca', role: 'yeast', amount: 10, unit: 'g', alternative: { amount: 25, unit: 'g', name: 'levadura fresca' } },
        { name: 'Mantequilla suave', role: 'butter', amount: 80, unit: 'g' }
      ] },
      { title: 'Relleno', kind: 'filling', ingredients: [
        { name: 'Mantequilla suavizada', role: 'butter', amount: 40, unit: 'g' },
        { name: 'Azúcar morena', role: 'sugar', amount: 60, unit: 'g' }, { name: 'Canela en polvo', role: 'other', amount: 10, unit: 'g' }
      ] }
    ]
  },
  bocadillo: {
    name: 'Pan para bocadillo', shortName: 'Bocadillo', category: 'Una masa, muchas formas', icon: 'bun',
    description: 'Pan suave para hot dogs, hamburguesas y bocadillos. Dale la forma que más te guste.',
    sections: [{ title: 'Masa principal', ingredients: [
      { name: 'Harina de fuerza', role: 'flour', amount: 340, unit: 'g' }, { name: 'Leche en polvo', role: 'milkPowder', amount: 25, unit: 'g' },
      { name: 'Leche tibia', role: 'milk', amount: 150, unit: 'ml' }, { name: 'Huevo sin cáscara', role: 'egg', amount: 50, unit: 'g', pieces: 1 },
      { name: 'Azúcar', role: 'sugar', amount: 40, unit: 'g' }, { name: 'Sal', role: 'salt', amount: 8, unit: 'g' },
      { name: 'Levadura seca', role: 'yeast', amount: 8, unit: 'g', alternative: { amount: 16, unit: 'g', name: 'levadura fresca' } },
      { name: 'Mantequilla suave', role: 'butter', amount: 60, unit: 'g' }
    ] }]
  },
  panDeCaja: {
    name: 'Pan de caja', shortName: 'Pan de caja', category: 'Pan de leche · sin Tangzhong', icon: 'loaf',
    description: 'Una miga delicada y extraesponjosa, estilo shokupan. Perfecto para tus tostadas de cada mañana.',
    yield: '1 pan grande', mold: '23–25 cm', oven: '175 °C', time: '30–40 min',
    note: 'Usa harina de fuerza con 12–13 % de proteína. Al escalar, usa moldes del tamaño indicado. La temperatura y el tiempo de horneado son orientativos y no se multiplican por las tandas.',
    source: 'Receta de pan de caja proporcionada en PDF.',
    sections: [{ title: 'Masa principal', ingredients: [
      { name: 'Harina de fuerza', role: 'flour', amount: 500, unit: 'g' }, { name: 'Leche entera', role: 'milk', amount: 280, unit: 'ml' },
      { name: 'Huevo sin cáscara', role: 'egg', amount: 50, unit: 'g', pieces: 1 }, { name: 'Azúcar', role: 'sugar', amount: 50, unit: 'g' },
      { name: 'Mantequilla sin sal', role: 'butter', amount: 50, unit: 'g' }, { name: 'Leche en polvo', role: 'milkPowder', amount: 20, unit: 'g' },
      { name: 'Levadura instantánea', role: 'yeast', amount: 11, unit: 'g' }, { name: 'Sal', role: 'salt', amount: 9, unit: 'g' }
    ] }],
    steps: [
      { title: 'Mezcla los ingredientes', text: 'Combina la harina, leche, huevo, azúcar, leche en polvo, levadura y sal hasta que no queden partes secas.' },
      { title: 'Desarrolla el gluten', text: 'Amasa hasta que la masa comience a sentirse elástica. Si está un poco pegajosa, evita agregar harina extra.' },
      { title: 'Incorpora la mantequilla', text: 'Añade la mantequilla blanda poco a poco. Sigue amasando hasta obtener una masa lisa y extensible, capaz de formar una película fina.' },
      { title: 'Primera fermentación', text: 'Cubre y deja fermentar a 26–28 °C durante unos 60–90 minutos, o hasta que casi duplique su volumen.' },
      { title: 'Forma y deja crecer', text: 'Para cada pan, divide en 3 o 4 piezas, aplana suavemente, enrolla y acomoda en un molde engrasado. Deja crecer hasta quedar 1–2 cm por debajo del borde (aprox. 45–80 min).' },
      { title: 'Hornea y enfría', text: 'Hornea a 175 °C durante 30–40 minutos, hasta que el centro alcance 93–95 °C. Desmolda y deja enfriar sobre rejilla antes de rebanar.' }
    ]
  }
};
if (typeof module !== 'undefined') module.exports = RECIPES;
