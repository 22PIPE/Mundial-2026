// ─── Utilidades genéricas ─────────────────────

// Convierte el nombre completo de un equipo a su código corto de 3 letras,
// usado en los textos "Ganador X vs Y" antes de que se conozca el resultado.
export function shortCode(name) {
  const map = {"Países Bajos":"NED","Marruecos":"MAR","Alemania":"ALE","Paraguay":"PAR","Francia":"FRA","Suecia":"SUE","Portugal":"POR","Croacia":"CRO","España":"ESP","Austria":"AUT","Argentina":"ARG","Cabo Verde":"CPV","EE. UU.":"EEU","Bosnia":"BOS","Bélgica":"BEL","Senegal":"SEN","Brasil":"BRA","Japón":"JAP","Noruega":"NOR","Costa de Marfil":"CDM","México":"MEX","Ecuador":"ECU","Inglaterra":"ING","RD Congo":"RDC"};
  return map[name] || name.slice(0, 3).toUpperCase();
}
