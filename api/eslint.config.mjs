// Estandares de programacion (manual sec. 14; criterio AU-10): TypeScript estricto y sin any.
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'prisma/'] },
  ...tseslint.configs.recommended,
  { rules: { '@typescript-eslint/no-explicit-any': 'error' } },
);
