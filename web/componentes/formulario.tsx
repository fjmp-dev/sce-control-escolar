'use client';
import { createContext, useActionState, useContext, useEffect, useId, useRef } from 'react';
import type { HTMLInputTypeAttribute, ReactNode } from 'react';
import { ESTADO_INICIAL, type EstadoDeFormulario } from '@/lib/estado';
import { Aviso } from './aviso';

const Contexto = createContext<EstadoDeFormulario>(ESTADO_INICIAL);

type Accion = (estado: EstadoDeFormulario, datos: FormData) => Promise<EstadoDeFormulario>;

/**
 * 28.1: los errores indican causa y corrección, y el foco va al aviso para que el teclado y el lector lo encuentren.
 * `alterno` agrega un segundo botón que envía `intencion=<valor>`, como "Revisar choques" antes de enviar la carga.
 */
export function Formulario({
  accion,
  envio,
  alterno,
  children,
}: Readonly<{
  accion: Accion;
  envio: string;
  alterno?: { valor: string; etiqueta: string };
  children: ReactNode;
}>) {
  const [estado, despachar, pendiente] = useActionState(accion, ESTADO_INICIAL);
  const aviso = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (estado !== ESTADO_INICIAL) aviso.current?.focus();
  }, [estado]);

  return (
    <form action={despachar} noValidate className="formulario">
      {estado.error && (
        <Aviso tipo="error" ref={aviso}>
          {estado.error}
        </Aviso>
      )}
      {estado.aviso && (
        <Aviso tipo="informacion" ref={aviso}>
          {estado.aviso}
        </Aviso>
      )}
      {estado.exito && (
        <Aviso tipo="exito" ref={aviso}>
          {estado.exito}
        </Aviso>
      )}
      <Contexto.Provider value={estado}>{children}</Contexto.Provider>
      <div className="botones">
        {alterno && (
          <button
            type="submit"
            name="intencion"
            value={alterno.valor}
            disabled={pendiente}
            className="boton boton-secundario"
          >
            {alterno.etiqueta}
          </button>
        )}
        <button type="submit" disabled={pendiente} className="boton">
          {pendiente ? 'Enviando…' : envio}
        </button>
      </div>
    </form>
  );
}

function useCampo(nombre: string, ayuda?: string) {
  const id = useId();
  const { campos, valores } = useContext(Contexto);
  const invalido = campos?.includes(nombre) ?? false;
  const describe = [ayuda && `${id}-ayuda`, invalido && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return { id, invalido, describe, valor: valores?.[nombre] };
}

function Mensajes({
  id,
  ayuda,
  correccion,
  invalido,
}: {
  id: string;
  ayuda?: string;
  correccion: string;
  invalido: boolean;
}) {
  return (
    <>
      {ayuda && (
        <p id={`${id}-ayuda`} className="ayuda">
          {ayuda}
        </p>
      )}
      {invalido && (
        <p id={`${id}-error`} className="error-campo">
          <strong>Error:</strong> {correccion}
        </p>
      )}
    </>
  );
}

export function Campo({
  nombre,
  etiqueta,
  correccion,
  ayuda,
  tipo = 'text',
  autoComplete,
  opcional = false,
}: {
  nombre: string;
  etiqueta: string;
  correccion: string;
  ayuda?: string;
  tipo?: HTMLInputTypeAttribute;
  autoComplete?: string;
  opcional?: boolean;
}) {
  const { id, invalido, describe, valor } = useCampo(nombre, ayuda);
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <Mensajes id={id} ayuda={ayuda} correccion={correccion} invalido={invalido} />
      <input
        id={id}
        name={nombre}
        type={tipo}
        required={!opcional}
        autoComplete={autoComplete}
        aria-invalid={invalido || undefined}
        aria-describedby={describe}
        defaultValue={typeof valor === 'string' ? valor : undefined}
      />
    </div>
  );
}

export function Selector({
  nombre,
  etiqueta,
  correccion,
  opciones,
  opcional = false,
}: {
  nombre: string;
  etiqueta: string;
  correccion: string;
  opciones: { valor: string; etiqueta: string }[];
  opcional?: boolean;
}) {
  const { id, invalido, describe, valor } = useCampo(nombre);
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <Mensajes id={id} correccion={correccion} invalido={invalido} />
      <select
        // React solo aplica defaultValue al montar: la clave conserva la opción elegida tras un error.
        key={typeof valor === 'string' ? valor : ''}
        id={id}
        name={nombre}
        required={!opcional}
        aria-invalid={invalido || undefined}
        aria-describedby={describe}
        defaultValue={typeof valor === 'string' ? valor : ''}
      >
        <option value="" disabled={!opcional}>
          {opcional ? 'Ninguno' : 'Elige una opción'}
        </option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Casillas({
  nombre,
  etiqueta,
  correccion,
  opciones,
  marcadas = [],
}: {
  nombre: string;
  etiqueta: string;
  correccion: string;
  opciones: { valor: string; etiqueta: string }[];
  marcadas?: readonly string[];
}) {
  const { id, invalido, describe, valor } = useCampo(nombre);
  const elegidas = Array.isArray(valor) ? valor : marcadas;
  return (
    <fieldset className="campo casillas" aria-describedby={describe}>
      <legend>{etiqueta}</legend>
      <Mensajes id={id} correccion={correccion} invalido={invalido} />
      {opciones.map((opcion) => (
        <label key={opcion.valor} className="casilla">
          <input type="checkbox" name={nombre} value={opcion.valor} defaultChecked={elegidas.includes(opcion.valor)} />
          {opcion.etiqueta}
        </label>
      ))}
    </fieldset>
  );
}

export function Casilla({
  nombre,
  etiqueta,
  marcada = false,
}: {
  nombre: string;
  etiqueta: string;
  marcada?: boolean;
}) {
  return (
    <label className="casilla">
      <input type="checkbox" name={nombre} defaultChecked={marcada} />
      {etiqueta}
    </label>
  );
}
