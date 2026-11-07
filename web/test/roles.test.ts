import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Rol } from '@/lib/contrato';
import { ALTAS, ETIQUETA_ROL, menuDe, puedeDarDeAlta, ROLES, type Catalogo } from '@/lib/roles';
import { ETIQUETA_ESTADO_PERIODO, fechaLegible } from '@/lib/formato';

const COLUMNAS: Rol[] = ['alumno', 'profesor', 'control_escolar', 'coordinacion', 'caja', 'direccion', 'administrador'];
const MATRIZ = readFileSync(resolve(__dirname, '../../docs/calidad/matriz-rol-endpoint.md'), 'utf8');

function rolesPermitidos(metodo: string, ruta: string) {
  const fila = MATRIZ.split('\n').find((linea) => linea.startsWith(`| ${metodo} | \`${ruta}\` |`));
  expect(fila, `${metodo} ${ruta} en la matriz`).toBeDefined();
  const permisos = (fila as string)
    .split('|')
    .slice(3, -1)
    .map((celda) => celda.trim());
  return COLUMNAS.filter((_, i) => permisos[i] === 'Sí');
}

describe('El portal ofrece lo que la matriz rol por endpoint permite (AU-15)', () => {
  it.each(Object.keys(ALTAS) as Catalogo[])('alta de %s', (catalogo) => {
    expect([...ALTAS[catalogo]].sort()).toEqual(rolesPermitidos('POST', `/${catalogo}`).sort());
  });

  it('usuarios: solo quien puede listarlos los ve en el menu', () => {
    const conUsuarios = ROLES.filter((rol) => menuDe([rol]).some((enlace) => enlace.ruta === '/usuarios'));
    expect(conUsuarios).toEqual(rolesPermitidos('GET', '/usuarios'));
  });

  it('todos los roles del contrato tienen etiqueta legible, sin diccionario tecnico (Tabla 16)', () => {
    expect(ROLES.sort()).toEqual([...COLUMNAS].sort());
    expect(Object.values(ETIQUETA_ROL)).not.toContain('control_escolar');
  });
});

describe('menuDe', () => {
  it('describe si el rol solo consulta o tambien da de alta', () => {
    const descripcion = (rol: Rol, ruta: string) => menuDe([rol]).find((e) => e.ruta === ruta)?.descripcion;
    expect(descripcion('alumno', '/materias')).toBe('Consultar');
    expect(descripcion('coordinacion', '/materias')).toBe('Consultar y dar de alta');
    expect(descripcion('coordinacion', '/facultades')).toBe('Consultar');
    expect(descripcion('administrador', '/facultades')).toBe('Consultar y dar de alta');
  });

  it('una cuenta con varios roles suma permisos', () => {
    expect(puedeDarDeAlta('materias', ['caja', 'coordinacion'])).toBe(true);
    expect(puedeDarDeAlta('materias', ['caja'])).toBe(false);
  });
});

describe('formato', () => {
  it('muestra la fecha sin recorrerla un dia', () => {
    expect(fechaLegible('2030-01-15T00:00:00.000Z')).toContain('15');
    expect(ETIQUETA_ESTADO_PERIODO.en_curso).toBe('En curso');
  });
});
