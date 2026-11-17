const imagenes = {
  'demo-c1': 'costa.png', 'demo-c2': 'mercado-mar.png',
  'demo-c3': 'caleta-demo.png', 'demo-c4': 'mirador-costa.png',
  'demo-v1': 'restaurante-valle.png', 'demo-v2': 'valle.png',
  'demo-v3': 'patrimonio-andino.png', 'demo-v4': 'valle.png',
  'demo-i1': 'interior.png', 'demo-i2': 'mercado-andino.png',
  'demo-i3': 'mirador-andino-demo.png', 'demo-i4': 'patrimonio-andino.png',
  'demo-c5': 'costa.png', 'demo-c6': 'caleta-demo.png', 'demo-c7': 'patrimonio-andino.png',
  'demo-v5': 'chacra-demo.png', 'demo-v6': 'restaurante-valle.png', 'demo-v7': 'chacra-demo.png',
  'demo-i5': 'cocina-andina-demo.png', 'demo-i6': 'mirador-andino-demo.png', 'demo-i7': 'patrimonio-andino.png',
};
export function imagenParada(parada) {
  const fallback = { Costa: 'costa.png', Valle: 'valle.png', Interior: 'interior.png' };
  return `${import.meta.env.BASE_URL}images/${imagenes[parada.id] || fallback[parada.zone] || 'costa.png'}`;
}
