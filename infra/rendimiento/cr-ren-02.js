// CR-REN-02 (Tablas 46 y 47, RNF-REN-002): 300 alumnos envian su inscripcion al mismo tiempo; 100 de ellos compiten por
// los 5 lugares de CARGA-5 y los demas van a CARGA-A. Cuenta enviadas y respuestas aqui; las persistidas las cuenta
// cr-ren-02.sql. Usa los alumnos pares de datos-carga.sql, que no deben nada.
// Uso: k6 run -e URL=https://localhost/api -e CONTRASENA=... [-e TOTAL=300 -e CONTENDIENTES=100] cr-ren-02.js
import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

const URL = __ENV.URL || 'https://localhost/api';
const TOTAL = Number(__ENV.TOTAL || 300);
const CONTENDIENTES = Number(__ENV.CONTENDIENTES || 100);
const LUGARES = 5;

const enviadas = new Counter('enviadas');
const confirmadasEnCinco = new Counter('confirmadas_carga5');
const rechazadasPorCupo = new Counter('rechazadas_por_cupo');
const otras = new Counter('respuestas_inesperadas');

export const options = {
  insecureSkipTLSVerify: true, // certificado autofirmado del staging efimero
  setupTimeout: '300s',
  scenarios: { concurrencia: { executor: 'per-vu-iterations', vus: TOTAL, iterations: 1, maxDuration: '5m' } },
  thresholds: {
    enviadas: [`count==${TOTAL}`],
    confirmadas_carga5: [`count==${LUGARES}`],
    rechazadas_por_cupo: [`count==${CONTENDIENTES - LUGARES}`],
    respuestas_inesperadas: ['count==0'],
    'http_req_duration{name:inscripcion}': ['p(95)<3000'], // Tabla 46
  },
};
http.setResponseCallback(http.expectedStatuses(200, 201, 409));

const json = { headers: { 'Content-Type': 'application/json' } };
const correo = (n) => `carga${String(n).padStart(4, '0')}@sce.test`;

export function setup() {
  const ingresar = (n) => [
    'POST',
    `${URL}/sesiones`,
    JSON.stringify({ correo: correo(n), contrasena: __ENV.CONTRASENA }),
    json,
  ];
  const tokens = [];
  for (let i = 0; i < TOTAL; i += 50) {
    const lote = Array.from({ length: Math.min(50, TOTAL - i) }, (_, j) => ingresar(2 * (i + j + 1)));
    for (const r of http.batch(lote)) {
      if (r.status !== 201 && r.status !== 200) throw new Error(`ingreso ${r.status}: ${r.body}`);
      tokens.push(r.json('token'));
    }
  }
  const oferta = http.get(`${URL}/grupos?periodo=2027A`, { headers: { Authorization: `Bearer ${tokens[0]}` } });
  const id = (clave) => oferta.json().find((g) => g.clave === clave).id;
  return { tokens, cinco: id('CARGA-5'), abierto: id('CARGA-A') };
}

export default function ({ tokens, cinco, abierto }) {
  const i = __VU - 1;
  const grupo = i < CONTENDIENTES ? cinco : abierto;
  const r = http.post(`${URL}/inscripciones`, JSON.stringify({ periodoClave: '2027A', grupos: [grupo] }), {
    headers: { ...json.headers, Authorization: `Bearer ${tokens[i]}` },
    tags: { name: 'inscripcion' },
  });
  enviadas.add(1);
  const cuerpo = r.json() || {};
  if (r.status === 201 && cuerpo.estado === 'confirmada') {
    if (grupo === cinco) confirmadasEnCinco.add(1);
  } else if (r.status === 409 && cuerpo.motivo === 'cupo' && grupo === cinco) {
    rechazadasPorCupo.add(1);
  } else {
    otras.add(1);
    console.error(`respuesta inesperada ${r.status}: ${r.body}`);
  }
  check(r, { 'confirmada o rechazada por cupo': (x) => x.status === 201 || x.status === 409 });
}
