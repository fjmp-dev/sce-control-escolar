// Estandares de programacion (manual sec. 14; AU-10): TypeScript estricto, sin any y errores probables (Tabla 32).
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'prisma/', 'eslint.config.mjs'] },
  ...tseslint.configs.recommended,
  { rules: { '@typescript-eslint/no-explicit-any': 'error' } },
  // Reglas con informacion de tipos solo en el codigo de produccion: promesas sin manejar, valores any, etc.
  {
    files: ['src/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
  },
  // CO-MAN-02 (Tabla 15, Modularidad; Fig. 2; 14.1 y 14.3): las fronteras de la arquitectura, verificadas en la etapa 2.
  // Ningun modulo lee el repositorio de otro: pide al servicio del dueno.
  ...restringir(
    'src/**/*.ts',
    ['../*/*.repository', '../../*/*.repository'],
    'Fig. 2: pide los datos al servicio del modulo dueno',
  ),
  // El dominio es puro: sin Nest, sin Prisma y sin capas de aplicacion (14.1-8 y 9).
  ...restringir(
    'src/**/dominio/**/*.ts',
    [
      '@nestjs/*',
      '@prisma/*',
      '**/persistencia/**',
      '**/*.service',
      '**/*.repository',
      '**/*.controller',
      '**/*.module',
    ],
    '14.1: el dominio no depende de Nest, de Prisma ni de las capas de aplicacion',
  ),
  // Los controladores no tocan la base: van por su servicio (14.3). Salud, en el gateway, si consulta la base.
  ...restringir(
    'src/{academico,expediente,identidad,pagos,tramites,reportes,bitacora}/**/*.controller.ts',
    ['**/persistencia/**', '@prisma/*', '**/*.repository'],
    '14.3: el controlador llama a su servicio',
  ),
  // Reportes lee por persistencia y bitacora no conoce a nadie (Fig. 2). Con la regla de typescript-eslint, que es otra
  // regla: asi no reemplaza a la de los controladores en reportes.controller.ts.
  ...restringir(
    'src/reportes/**/*.ts',
    ['../academico/**', '../expediente/**', '../pagos/**', '../tramites/**'],
    'Fig. 2: reportes lee por persistencia, sin pasar por otros dominios',
    '@typescript-eslint/no-restricted-imports',
  ),
  ...restringir(
    'src/bitacora/**/*.ts',
    ['../academico/**', '../expediente/**', '../pagos/**', '../tramites/**', '../identidad/**', '../reportes/**'],
    'Fig. 2: bitacora no depende de ningun dominio',
    '@typescript-eslint/no-restricted-imports',
  ),
);

// Un bloque posterior con la misma regla reemplaza sus patrones en los archivos que ambos cubren: los bloques de la regla
// del nucleo repiten el de todo src. Los dominios y los controladores no se cruzan.
function restringir(files, group, message, regla = 'no-restricted-imports') {
  const base = {
    group: ['../*/*.repository', '../../*/*.repository'],
    message: 'Fig. 2: pide los datos al servicio del modulo dueno',
  };
  const repite = regla === 'no-restricted-imports' && files !== 'src/**/*.ts';
  return [
    { files: [files], rules: { [regla]: ['error', { patterns: [...(repite ? [base] : []), { group, message }] }] } },
  ];
}
