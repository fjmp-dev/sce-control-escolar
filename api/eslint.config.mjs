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
);
