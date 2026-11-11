// Tabla 32: cero errores y sin any. Next.js aporta sus reglas y las de accesibilidad (jsx-a11y).
import next from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

const configuracion = [
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'lib/tipos-api.ts',
      'next-env.d.ts',
      'cypress/videos/**',
      'cypress/screenshots/**',
    ],
  },
  ...next,
  ...tseslint.configs.recommended,
  { settings: { next: { rootDir: import.meta.dirname } } }, // el hook de git corre desde la raiz del repositorio
  { rules: { '@typescript-eslint/no-explicit-any': 'error' } },
];

export default configuracion;
