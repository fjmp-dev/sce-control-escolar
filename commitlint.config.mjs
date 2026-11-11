// Commits convencionales con identificador de requisito (Tablas 31 y 32).
// "Cuando aplique" (Tabla 32): feat y fix cambian comportamiento, asi que el encabezado lleva a que responden.
const IDENTIFICADOR = /(RF-\d{3}|RNF-[A-Z]+-\d{3}|(CF|CI|CS|CR|CD|CO)-[A-Z]+-\d{2}|CC-\d{3}|NC-\d{3}|RK-\d{2}|#\d+)/;

// Commits anteriores a esta regla (Batch 1). La historia no se reescribe, asi que se exenta por su encabezado.
const ANTERIORES_A_LA_REGLA = [
  'feat(fase1): base de datos PostgreSQL, pgAudit y API con autenticacion por rol',
  'feat(fase1): alta de usuarios con bitacora, cobertura y npm audit en CI',
  'docs+ci: no conformidades, registro de aprobacion del manual, roles alineados y estabilizacion',
];

export default {
  extends: ['@commitlint/config-conventional'],
  ignores: [(mensaje) => ANTERIORES_A_LA_REGLA.some((encabezado) => mensaje.startsWith(encabezado))],
  plugins: [
    {
      rules: {
        'identificador-de-requisito': ({ type, header }) => [
          !['feat', 'fix'].includes(type) || IDENTIFICADOR.test(header),
          'feat y fix llevan identificador en el encabezado: RF-001, RNF-SEG-001, CF-INS-01, CC-007, NC-006, RK-03 o #41',
        ],
      },
    },
  ],
  rules: {
    'identificador-de-requisito': [2, 'always'],
    // "RF-001 cambio de plantel" empieza con mayuscula por el identificador.
    'subject-case': [0],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};
