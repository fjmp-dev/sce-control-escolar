// Humo de rendimiento con umbrales (Tabla 48, "k6 con umbrales en el pipeline"): 20 usuarios virtuales durante un minuto
// sobre las consultas del alumno, con las metas de la Tabla 46. No sustituye a CR-REN-01 a 05.
// SOLO_LECTURA=1: sin sesion ni datos, solo la salud de la API y la pagina de ingreso; sirve para un ambiente sin
// usuarios, como el piloto de ensayo (SEMILLA=0).
// Uso: k6 run -e API=http://localhost:3001 -e PORTAL=http://localhost:3000 [-e CONTRASENA=...] [-e SOLO_LECTURA=1] humo.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const API = __ENV.API || 'http://localhost:3001';
const PORTAL = __ENV.PORTAL || 'http://localhost:3000';
const SOLO_LECTURA = __ENV.SOLO_LECTURA === '1';

export const options = {
  insecureSkipTLSVerify: true,
  vus: 20,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'], // 5xx y demas fallos, menos de 1 %
    'http_req_duration{tipo:consulta}': ['p(95)<2000'],
    checks: ['rate>0.99'],
  },
};

export function setup() {
  if (SOLO_LECTURA) return {};
  const r = http.post(
    `${API}/sesiones`,
    JSON.stringify({ correo: 'alumno@sce.test', contrasena: __ENV.CONTRASENA || 'sce-dev-2026' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  if (!r.json('token')) throw new Error(`ingreso ${r.status}`);
  return { token: r.json('token') };
}

export default function ({ token }) {
  const consulta = (url, nombre, cabeceras = {}) =>
    check(http.get(url, { headers: cabeceras, tags: { tipo: 'consulta', name: nombre } }), {
      [`${nombre} 200`]: (r) => r.status === 200,
    });
  consulta(`${API}/salud`, 'salud');
  consulta(`${PORTAL}/ingresar`, 'ingresar');
  if (token) {
    const sesion = { Authorization: `Bearer ${token}` };
    consulta(`${API}/grupos?periodo=2027A`, 'oferta', sesion);
    consulta(`${API}/alumnos/actual/inscripciones`, 'mis-inscripciones', sesion);
    consulta(`${API}/alumnos/actual/calificaciones`, 'mis-calificaciones', sesion);
    consulta(`${API}/alumnos/actual/cuenta`, 'mi-cuenta', sesion);
  }
  sleep(1);
}
