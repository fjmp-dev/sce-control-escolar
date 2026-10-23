-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL,
    "correo" TEXT NOT NULL,
    "hash_contrasena" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol" (
    "id" SMALLINT NOT NULL,
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_rol" (
    "usuario_id" UUID NOT NULL,
    "rol_id" SMALLINT NOT NULL,
    "asignado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_rol_pkey" PRIMARY KEY ("usuario_id","rol_id")
);

-- CreateTable
CREATE TABLE "facultad" (
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "facultad_pkey" PRIMARY KEY ("clave")
);

-- CreateTable
CREATE TABLE "plan_estudios" (
    "clave" TEXT NOT NULL,
    "facultad_clave" TEXT NOT NULL,
    "creditos_totales" INTEGER NOT NULL,
    "vigente_desde" DATE NOT NULL,

    CONSTRAINT "plan_estudios_pkey" PRIMARY KEY ("clave")
);

-- CreateTable
CREATE TABLE "materia" (
    "clave" TEXT NOT NULL,
    "plan_clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creditos" INTEGER NOT NULL,

    CONSTRAINT "materia_pkey" PRIMARY KEY ("clave")
);

-- CreateTable
CREATE TABLE "prerequisito" (
    "materia_clave" TEXT NOT NULL,
    "requiere_clave" TEXT NOT NULL,
    "obligatorio" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "prerequisito_pkey" PRIMARY KEY ("materia_clave","requiere_clave")
);

-- CreateTable
CREATE TABLE "periodo" (
    "clave" TEXT NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "periodo_pkey" PRIMARY KEY ("clave")
);

-- CreateTable
CREATE TABLE "alumno" (
    "matricula" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "facultad_clave" TEXT NOT NULL,
    "usuario_id" UUID,
    "fecha_ingreso" DATE NOT NULL,
    "estatus" TEXT NOT NULL,

    CONSTRAINT "alumno_pkey" PRIMARY KEY ("matricula")
);

-- CreateTable
CREATE TABLE "historial" (
    "matricula" TEXT NOT NULL,
    "promedio" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "creditos_acumulados" INTEGER NOT NULL DEFAULT 0,
    "avance" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "historial_pkey" PRIMARY KEY ("matricula")
);

-- CreateTable
CREATE TABLE "grupo" (
    "id" BIGSERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "materia_clave" TEXT NOT NULL,
    "periodo_clave" TEXT NOT NULL,
    "profesor_id" UUID NOT NULL,
    "cupo" INTEGER NOT NULL,
    "ocupacion" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horario" (
    "id" BIGSERIAL NOT NULL,
    "grupo_id" BIGINT NOT NULL,
    "dia" SMALLINT NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,
    "aula" TEXT NOT NULL,

    CONSTRAINT "horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripcion" (
    "folio" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "periodo_clave" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "motivo_rechazo" TEXT,
    "fecha" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscripcion_pkey" PRIMARY KEY ("folio")
);

-- CreateTable
CREATE TABLE "inscripcion_grupo" (
    "folio" TEXT NOT NULL,
    "grupo_id" BIGINT NOT NULL,
    "fecha_alta" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscripcion_grupo_pkey" PRIMARY KEY ("folio","grupo_id")
);

-- CreateTable
CREATE TABLE "calificacion" (
    "id" BIGSERIAL NOT NULL,
    "folio" TEXT NOT NULL,
    "grupo_id" BIGINT NOT NULL,
    "profesor_id" UUID NOT NULL,
    "periodo_clave" TEXT NOT NULL,
    "parcial" SMALLINT NOT NULL,
    "valor" DECIMAL(4,2) NOT NULL,
    "fecha_captura" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuenta_alumno" (
    "matricula" TEXT NOT NULL,
    "saldo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "cuenta_alumno_pkey" PRIMARY KEY ("matricula")
);

-- CreateTable
CREATE TABLE "movimiento" (
    "id" BIGSERIAL NOT NULL,
    "matricula" TEXT NOT NULL,
    "pago_id" BIGINT,
    "concepto" TEXT NOT NULL,
    "importe" DECIMAL(12,2) NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pago" (
    "id" BIGSERIAL NOT NULL,
    "matricula" TEXT NOT NULL,
    "clave_idempotencia" TEXT NOT NULL,
    "referencia" TEXT NOT NULL,
    "importe" DECIMAL(12,2) NOT NULL,
    "estado" TEXT NOT NULL,
    "fecha" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tramite" (
    "folio" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fecha_solicitud" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tramite_pkey" PRIMARY KEY ("folio")
);

-- CreateTable
CREATE TABLE "documento" (
    "folio" TEXT NOT NULL,
    "tramite_folio" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "fecha_emision" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documento_pkey" PRIMARY KEY ("folio")
);

-- CreateTable
CREATE TABLE "bitacora" (
    "id" BIGSERIAL NOT NULL,
    "autor" UUID NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "valor_anterior" JSONB,
    "fecha" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "rol_clave_key" ON "rol"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "alumno_usuario_id_key" ON "alumno"("usuario_id");

-- CreateIndex
CREATE INDEX "alumno_facultad_clave_idx" ON "alumno"("facultad_clave");

-- CreateIndex
CREATE INDEX "alumno_estatus_idx" ON "alumno"("estatus");

-- CreateIndex
CREATE INDEX "grupo_profesor_id_periodo_clave_idx" ON "grupo"("profesor_id", "periodo_clave");

-- CreateIndex
CREATE UNIQUE INDEX "grupo_clave_periodo_clave_key" ON "grupo"("clave", "periodo_clave");

-- CreateIndex
CREATE INDEX "horario_grupo_id_idx" ON "horario"("grupo_id");

-- CreateIndex
CREATE INDEX "horario_dia_hora_inicio_hora_fin_aula_idx" ON "horario"("dia", "hora_inicio", "hora_fin", "aula");

-- CreateIndex
CREATE INDEX "inscripcion_estado_idx" ON "inscripcion"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "inscripcion_matricula_periodo_clave_key" ON "inscripcion"("matricula", "periodo_clave");

-- CreateIndex
CREATE INDEX "calificacion_grupo_id_periodo_clave_idx" ON "calificacion"("grupo_id", "periodo_clave");

-- CreateIndex
CREATE UNIQUE INDEX "calificacion_folio_grupo_id_parcial_key" ON "calificacion"("folio", "grupo_id", "parcial");

-- CreateIndex
CREATE UNIQUE INDEX "movimiento_pago_id_key" ON "movimiento"("pago_id");

-- CreateIndex
CREATE INDEX "movimiento_matricula_fecha_idx" ON "movimiento"("matricula", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "pago_clave_idempotencia_key" ON "pago"("clave_idempotencia");

-- CreateIndex
CREATE INDEX "pago_matricula_estado_idx" ON "pago"("matricula", "estado");

-- CreateIndex
CREATE INDEX "tramite_matricula_estado_idx" ON "tramite"("matricula", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "documento_tramite_folio_key" ON "documento"("tramite_folio");

-- CreateIndex
CREATE INDEX "bitacora_entidad_fecha_idx" ON "bitacora"("entidad", "fecha");

-- CreateIndex
CREATE INDEX "bitacora_autor_fecha_idx" ON "bitacora"("autor", "fecha");

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_estudios" ADD CONSTRAINT "plan_estudios_facultad_clave_fkey" FOREIGN KEY ("facultad_clave") REFERENCES "facultad"("clave") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materia" ADD CONSTRAINT "materia_plan_clave_fkey" FOREIGN KEY ("plan_clave") REFERENCES "plan_estudios"("clave") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisito" ADD CONSTRAINT "prerequisito_materia_clave_fkey" FOREIGN KEY ("materia_clave") REFERENCES "materia"("clave") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisito" ADD CONSTRAINT "prerequisito_requiere_clave_fkey" FOREIGN KEY ("requiere_clave") REFERENCES "materia"("clave") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumno" ADD CONSTRAINT "alumno_facultad_clave_fkey" FOREIGN KEY ("facultad_clave") REFERENCES "facultad"("clave") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumno" ADD CONSTRAINT "alumno_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial" ADD CONSTRAINT "historial_matricula_fkey" FOREIGN KEY ("matricula") REFERENCES "alumno"("matricula") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo" ADD CONSTRAINT "grupo_materia_clave_fkey" FOREIGN KEY ("materia_clave") REFERENCES "materia"("clave") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo" ADD CONSTRAINT "grupo_periodo_clave_fkey" FOREIGN KEY ("periodo_clave") REFERENCES "periodo"("clave") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo" ADD CONSTRAINT "grupo_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario" ADD CONSTRAINT "horario_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripcion" ADD CONSTRAINT "inscripcion_matricula_fkey" FOREIGN KEY ("matricula") REFERENCES "alumno"("matricula") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripcion" ADD CONSTRAINT "inscripcion_periodo_clave_fkey" FOREIGN KEY ("periodo_clave") REFERENCES "periodo"("clave") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripcion_grupo" ADD CONSTRAINT "inscripcion_grupo_folio_fkey" FOREIGN KEY ("folio") REFERENCES "inscripcion"("folio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripcion_grupo" ADD CONSTRAINT "inscripcion_grupo_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificacion" ADD CONSTRAINT "calificacion_folio_fkey" FOREIGN KEY ("folio") REFERENCES "inscripcion"("folio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificacion" ADD CONSTRAINT "calificacion_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificacion" ADD CONSTRAINT "calificacion_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificacion" ADD CONSTRAINT "calificacion_periodo_clave_fkey" FOREIGN KEY ("periodo_clave") REFERENCES "periodo"("clave") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_alumno" ADD CONSTRAINT "cuenta_alumno_matricula_fkey" FOREIGN KEY ("matricula") REFERENCES "alumno"("matricula") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento" ADD CONSTRAINT "movimiento_matricula_fkey" FOREIGN KEY ("matricula") REFERENCES "cuenta_alumno"("matricula") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento" ADD CONSTRAINT "movimiento_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_matricula_fkey" FOREIGN KEY ("matricula") REFERENCES "alumno"("matricula") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite" ADD CONSTRAINT "tramite_matricula_fkey" FOREIGN KEY ("matricula") REFERENCES "alumno"("matricula") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento" ADD CONSTRAINT "documento_tramite_folio_fkey" FOREIGN KEY ("tramite_folio") REFERENCES "tramite"("folio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacora" ADD CONSTRAINT "bitacora_autor_fkey" FOREIGN KEY ("autor") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
