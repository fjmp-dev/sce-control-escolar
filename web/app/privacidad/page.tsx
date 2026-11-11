import Link from 'next/link';
import { Aviso } from '@/componentes/aviso';
import { Logotipo } from '@/componentes/icono';

export const metadata = { title: 'Aviso de privacidad' };

/**
 * PA-SCE-001, Parte B (AU-18): aviso simplificado, público y sin sesión. Es el texto de
 * docs/gobierno/datos-personales/aviso-de-privacidad.md, apartado 6: si cambia uno, cambia el otro.
 */
export default function PaginaPrivacidad() {
  return (
    <main id="contenido" tabIndex={-1} className="ingreso">
      <article className="tarjeta ingreso-tarjeta privacidad">
        <p className="marca">
          <Logotipo />
          Sistema de Control Escolar
        </p>
        <h1>Aviso de privacidad simplificado</h1>
        <Aviso tipo="informacion">
          Modelo no oficial. Lo redactó el equipo del proyecto SCE como ejemplo. No lo emitió la Universidad Autónoma
          del Estado de México y no la obliga. El sistema solo tiene datos sintéticos.
        </Aviso>
        <section>
          <h2>Quién trata tus datos</h2>
          <p>La Universidad Autónoma del Estado de México, por medio del Sistema de Control Escolar.</p>
        </section>
        <section>
          <h2>Para qué</h2>
          <ul>
            <li>Integrar tu expediente.</li>
            <li>Inscribirte y armar tu horario.</li>
            <li>Registrar tus calificaciones y tu historial.</li>
            <li>Cobrar cuotas, aplicar becas y emitir recibos.</li>
            <li>Atender tus trámites.</li>
            <li>Darte acceso seguro y registrar quién hace cada operación.</li>
            <li>Elaborar estadísticas por facultad, sin nombres ni matrículas.</li>
          </ul>
          <p>
            Todas son necesarias para el servicio escolar. No usamos tus datos para publicidad ni para otros fines.
          </p>
        </section>
        <section>
          <h2>Tu consentimiento</h2>
          <p>
            Ninguna finalidad lo requiere, así que no hay nada a lo que debas negarte. Si eso cambia, este aviso dirá
            cómo negarte antes de usar tus datos.
          </p>
        </section>
        <section>
          <h2>Transferencias</h2>
          <p>
            No compartimos tus datos con terceros. Solo se entregarían a una autoridad que los pida conforme a la ley.
          </p>
        </section>
        <section>
          <h2>Tus derechos</h2>
          <p>
            Puedes pedir acceso, rectificación, cancelación u oposición ante la Unidad de Transparencia de la
            universidad. Tu expediente, calificaciones, horario, estado de cuenta y trámites los consultas tú en el
            portal.
          </p>
        </section>
        <section>
          <h2>Aviso integral</h2>
          <p>
            Explica la ley aplicable, los datos y cuánto tiempo se conservan. Es parte del mismo modelo y está en el
            repositorio del proyecto: <code>docs/gobierno/datos-personales/aviso-de-privacidad.md</code>.
          </p>
        </section>
        <p className="ayuda">Última actualización: 10 de noviembre de 2026.</p>
        <div className="botones">
          <Link href="/ingresar" className="boton boton-secundario">
            Ir a iniciar sesión
          </Link>
        </div>
      </article>
    </main>
  );
}
