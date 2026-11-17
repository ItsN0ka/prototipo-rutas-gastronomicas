const imagenes = {
  'demo-c1': 'costa.png', 'demo-c2': 'mercado-mar.png',
  'demo-c3': 'mercado-mar.png', 'demo-c4': 'mirador-costa.png',
  'demo-v1': 'restaurante-valle.png', 'demo-v2': 'valle.png',
  'demo-v3': 'patrimonio-andino.png', 'demo-v4': 'valle.png',
  'demo-i1': 'interior.png', 'demo-i2': 'mercado-andino.png',
  'demo-i3': 'interior.png', 'demo-i4': 'patrimonio-andino.png',
};
export function imagenParada(parada) {
  const fallback = { Costa: 'costa.png', Valle: 'valle.png', Interior: 'interior.png' };
  return `${import.meta.env.BASE_URL}images/${imagenes[parada.id] || fallback[parada.zone] || 'costa.png'}`;
}
