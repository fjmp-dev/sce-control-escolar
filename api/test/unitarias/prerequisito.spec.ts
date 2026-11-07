// RF-002: tecnica de particiones, sin base de datos (14.1-8).
import { validarPrerequisito } from '../../src/academico/dominio/prerequisito';

const CADENA = [
  { materiaClave: 'C', requiereClave: 'B' },
  { materiaClave: 'B', requiereClave: 'A' },
];

describe('validarPrerequisito', () => {
  it.each([
    ['a si misma', 'A', 'A', []],
    ['ciclo directo', 'B', 'C', CADENA],
    ['ciclo indirecto', 'A', 'C', CADENA],
  ])('rechaza: %s', (_, materia, requiere, existentes) => {
    expect(() => validarPrerequisito(materia, requiere, existentes)).toThrow(/depende/);
  });

  it.each([
    ['materia sin relacion', 'D', 'C', CADENA],
    ['extender la cadena', 'D', 'A', CADENA],
    ['sin prerrequisitos previos', 'A', 'B', []],
  ])('acepta: %s', (_, materia, requiere, existentes) => {
    expect(() => validarPrerequisito(materia, requiere, existentes)).not.toThrow();
  });

  it('termina aunque los datos previos ya tengan un ciclo', () => {
    const conCiclo = [
      { materiaClave: 'X', requiereClave: 'Y' },
      { materiaClave: 'Y', requiereClave: 'X' },
    ];
    expect(() => validarPrerequisito('Z', 'X', conCiclo)).not.toThrow();
  });
});
