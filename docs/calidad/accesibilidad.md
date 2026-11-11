# Accesibilidad y compatibilidad — SCE

**Fuente:** SCE-MC-001 v2.0, secciones 7.1 (Tabla 13), 27 y 28, y Tablas 15, 16, 42 y 50; manual v3.0 (VoiceOver en lugar de NVDA). **Criterio de auditoría:** AU-32.
**Versión:** 2.0, 11 de noviembre de 2026 (sub-batch 12.4, CO-ACC-01). La v1.0 es del 6 de noviembre (Batch 3). Se repite con cada interfaz nueva.

**Cambios de la v2.0:** axe en el inicio de los siete roles y en el error del pago; Lighthouse en 21 páginas con FCP, LCP, TBT y CLS; lista manual de WCAG 2.2 AA con zoom real (apartado 5); registro de hallazgos HA-NN con el indicador de la Tabla 13 (apartado 4); estado de la revisión con VoiceOver (apartado 6); revisión en simulador y emulador (`compatibilidad-dispositivos.md`).

## 1. Lista de verificación (28.1)

Los criterios de 28.1 nombran los formularios de inscripción y pago. El de inscripción existe desde el Batch 5 y el de pago desde el Batch 9. Ambos usan los mismos componentes que el resto del portal: casillas con etiqueta, aviso que recibe el foco, estado escrito con su corrección y comprobante imprimible sin menú.

| Criterio | Cómo se cumple | Cómo se verifica | Estado |
|---|---|---|---|
| Operable por teclado, orden de foco lógico y foco visible | HTML nativo, sin atajos propios. Enlace para saltar al contenido. Contorno de 3 px en `:focus-visible` | `accesibilidad.cy.ts` en el inicio de sesión; Playwright con teclado en los cuatro flujos de escritorio (CO-COM-01); revisión manual de los flujos Must (apartado 5) | Cumple |
| Todo campo con etiqueta asociada | `Campo`, `Selector` y `Casillas` generan la asociación. Cypress localiza cada campo por su etiqueta visible | axe y `componentes.test.tsx` | Cumple |
| Errores con causa y corrección | Aviso general con foco, y mensaje por campo que dice cómo corregir, unido con `aria-describedby`. Lo escrito no se pierde, salvo contraseñas. El rechazo por saldo también marca el campo (HA-07) | Cypress (también el pago vacío, negativo y mayor que el adeudo) y Vitest | Cumple |
| Contraste de al menos 4.5:1 | Paleta del batch #67: el azul del planteamiento más vivo (`#1a5fb4`). Pares calculados por luminancia relativa: texto azul sobre blanco 6.29:1, azul oscuro sobre blanco 8.76:1 y sobre azul tenue 7.68:1, gris suave sobre blanco 6.91:1 y sobre azul tenue 6.06:1, azul claro sobre la cabecera 4.68:1 en su extremo más claro, insignias de 7.13:1 a 9.10:1. Bordes de control y del error de 3.32:1 a 5.44:1 | axe, regla `color-contrast`, y Lighthouse. El texto sobre el degradado de la cabecera se verifica por cálculo, porque axe lo deja en revisión manual (`incomplete`, que se guarda en cada JSON de `cypress/reportes/axe/`) | Cumple |
| Estado no solo por color | Todo aviso lleva `Error:`, `Listo:` o `Aviso:`. Cuenta activa o inactiva, en texto. Página actual, con franja lateral y negritas, además del tono; en una subpágina se marca su sección igual | `componentes.test.tsx` y captura en grises (apartado 5, 1.4.1) | Cumple |
| Zoom al 200 % sin ocultar acciones | Diseño fluido; sin alturas fijas | Cypress y Playwright en 683×384 px CSS, equivalente a 200 % sobre 1366×768 (Playwright, además, con `deviceScaleFactor` 2), y **zoom real** del navegador al 200 % y al 400 % (apartado 5, 1.4.4 y 1.4.10) | Cumple |
| Objetivo táctil de WCAG 2.2 | Controles de 44 px; el mínimo AA es de 24 px. Un enlace suelto también mide 44 px (HA-08) | Cypress mide cada control en las cuatro resoluciones; Playwright en iPhone y Android; revisión manual (apartado 5, 2.5.8) | Cumple |

**Conectividad limitada (Tabla 15, Inclusividad):** de 159 a 166 KB por página, según Lighthouse (apartado 2.1). Sin librerías de interfaz ni imágenes, y los formularios funcionan aunque no cargue JavaScript, porque son acciones de servidor. Sin JavaScript, el menú de celular queda abierto y el botón «Menú» no se muestra. **Etiquetas sin diccionario técnico (Tabla 16):** los roles y estados se muestran en español legible, y Vitest lo comprueba para los roles.

## 2. Evaluación (28.2)

| Herramienta | Alcance | Resultado | Evidencia |
|---|---|---|---|
| axe-core 4.14, reglas WCAG 2.0, 2.1 y 2.2 A y AA | Las 32 páginas y estados de la v1.0, más el inicio de los siete roles (`demostracion-por-rol.cy.ts`) y el pago con importe vacío, negativo y mayor que el adeudo (`pagos-tramites.cy.ts`). Playwright repite axe en cada pantalla de la matriz de la Tabla 50 | Corrida local de 12.4, base limpia, con `accesibilidad`, `demostracion-por-rol`, `pagos-tramites` y `privacidad`: 24 de 24 pruebas, 48 reportes de axe, 0 incumplimientos | `cypress/reportes/axe/` en el artefacto `despliegue-pruebas` |
| Lighthouse 13.6 | 21 páginas: ingresar; el inicio de los siete roles; inscripción, mi cuenta, pasarela y recibo; mi horario, mis calificaciones, mi expediente y mis trámites; expediente, usuarios, materias, oferta y el corte de caja | Accesibilidad de 100 en las 21; rendimiento de 100 en las 21 (apartado 2.1) | `reportes/lighthouse/resumen.md` en el artefacto `despliegue-pruebas` |
| Teclado, foco, zoom real y errores, revisión manual | Ocho pantallas de los flujos Must, en escritorio y en celular | 12 de 12 criterios cumplen, tras corregir HA-07 y HA-08 | Apartado 5 |
| VoiceOver con Safari (sustituye a NVDA) | Ingreso, inscripción, pago y consulta | **Pendiente:** requiere un permiso del sistema que no se cambió. Se usó el árbol de accesibilidad como sustituto | Apartado 6 |

El manual no fija puntaje mínimo de Lighthouse. Los dos 90 son criterio del equipo: accesibilidad, que bloquea la etapa, y rendimiento, que solo se reporta. axe no sustituye a una revisión manual: detecta una parte de los incumplimientos de WCAG.

### 2.1 Lighthouse por página

`scripts/lighthouse.sh` con `PORTAL` y `API` del ambiente (por omisión, `localhost:3000` y `:3001`). Antes de medir la pasarela y el recibo crea, con la API, un cargo de 2026A para 2420001, un pago pendiente y su aprobación. La columna «Rend. >= 90» aplica el criterio del equipo: si una página queda abajo, el script avisa pero no falla.

Corrida del 11 de noviembre de 2026 contra el ambiente aislado de 12.4. Es el perfil móvil por omisión de Lighthouse, con red y CPU limitadas por simulación. Es un ensayo en el equipo de desarrollo: la meta de rendimiento de la Tabla 13 es del piloto y no se declara cumplida (manual v3.0).

| Página | Accesibilidad | Rendimiento | Rend. >= 90 | Buenas prácticas | FCP (s) | LCP (s) | TBT (ms) | CLS | Peso (KB) |
|---|---|---|---|---|---|---|---|---|---|
| administrador-inicio | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 42 | 0 | 159 |
| administrador-usuarios | 100 | 100 | Sí | 100 | 0.7 | 0.7 | 41 | 0 | 164 |
| alumno-calificaciones | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 47 | 0 | 160 |
| alumno-inicio | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 41 | 0 | 160 |
| alumno-inscripcion | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 31 | 0 | 165 |
| alumno-mi-cuenta | 100 | 100 | Sí | 100 | 0.7 | 0.7 | 68 | 0 | 163 |
| alumno-mi-expediente | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 32 | 0 | 160 |
| alumno-mi-horario | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 34 | 0 | 160 |
| alumno-mis-tramites | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 71 | 0 | 162 |
| alumno-pasarela | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 47 | 0 | 164 |
| alumno-recibo | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 40 | 0 | 164 |
| caja-corte | 100 | 100 | Sí | 100 | 0.7 | 0.7 | 67 | 0 | 163 |
| caja-inicio | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 76 | 0 | 159 |
| control-escolar-expediente | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 14 | 0 | 164 |
| control-escolar-inicio | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 67 | 0 | 159 |
| coordinacion-inicio | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 30 | 0 | 159 |
| coordinacion-materias | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 32 | 0 | 164 |
| coordinacion-oferta | 100 | 100 | Sí | 100 | 0.7 | 0.7 | 30 | 0 | 166 |
| direccion-inicio | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 31 | 0 | 159 |
| ingresar | 100 | 100 | Sí | 100 | 0.8 | 0.8 | 35 | 0 | 165 |
| profesor-inicio | 100 | 100 | Sí | 100 | 0.6 | 0.6 | 46 | 0 | 159 |

En resumen: FCP y LCP de 0.6 a 0.8 s, TBT de 14 a 76 ms, CLS de 0 y de 159 a 166 KB por página. Una corrida anterior del mismo día, antes de corregir HA-08, dio las mismas calificaciones y un TBT de 14 a 60 ms: el TBT es lo único que varía entre corridas.

## 3. Compatibilidad (Tabla 50)

| Plataforma | Estado |
|---|---|
| Resoluciones 1920×1080, 1366×768 y 390×844 | **Automatizado con Cypress:** sin desborde horizontal; las tablas se apilan en pantallas angostas |
| Chrome, Firefox, Edge, Safari en iOS y Chrome en Android | **Automatizado con Playwright (CO-COM-01), etapas 7 y 8:** Chrome y Edge estables, Firefox, WebKit con descriptor de iPhone y Chromium con descriptor de Android, en las tres resoluciones y con zoom al 200 %. Por pantalla revisa desborde, teclado (28.1-1), objetivos táctiles de 24 px y axe. Proyectos y sustituciones en `plan-de-pruebas.md`, 4.6. Cypress corre aquí sobre Electron |
| Safari de iOS 27 y Chrome 156 de Android 17, reales | **Revisión manual en simulador y emulador (12.4):** los cuatro flujos Must se ven completos y sin desborde; en Android se operaron de punta a punta. `compatibilidad-dispositivos.md` |

## 4. Registro de hallazgos

Clasificación de 28.2: Should o Could, salvo que bloqueen por completo un flujo Must, en cuyo caso son Must. **Severidad:** bloqueante (impide terminar un flujo Must), alta, media o baja. Los hallazgos anteriores a la v2.0 conservan su orden y reciben número.

| ID | Criterio WCAG | Fuente | Clase | Hallazgo | Severidad | Estado |
|---|---|---|---|---|---|---|
| HA-01 | 2.4.3 | Cypress | Should | Al quitar un prerrequisito, el formulario desaparecía con su fila: sin confirmación y con el foco perdido | Media | Corregido: un formulario único que no se desmonta |
| HA-02 | 3.3.7 | Vitest | Should | Tras un error, un selector volvía a la opción vacía | Media | Corregido |
| HA-03 | — (legibilidad) | Revisión de capturas | Could | Las casillas de opción heredaban negritas, y costaba distinguirlas de la leyenda del grupo | Baja | Corregido |
| HA-04 | — (legibilidad) | Revisión de capturas | Could | Las tarjetas de la oferta (Batch 67) volvieron a heredar negritas y perdieron su relleno: `.campo label` les ganaba por especificidad | Baja | Corregido: el reinicio de `.campo` usa `:where()` |
| HA-05 | — (Tabla 15) | Revisión de código | Should | En celular, sin JavaScript, el menú (Batch 67) no se podía abrir | Media | Corregido: con `<noscript>` la lista queda abierta |
| HA-06 | 1.4.10 | Revisión de capturas | Could | Importes, correos y folios se partían a media palabra en tablas apretadas por la barra lateral | Baja | Corregido: las cifras no se parten y las tablas se apilan con 48rem o menos |
| HA-07 | 3.3.1 | Revisión manual de 12.4 | Should | Pago mayor que el adeudo: el aviso general explicaba el error, pero el campo no quedaba marcado (`aria-invalid`) ni unido a su corrección (`aria-describedby`). La API lo rechaza como regla de negocio, sin `campos`. Lo mismo pasaba con la beca de caja | Media | Corregido en `aEstado` (`web/lib/acciones.ts`). Lo prueban Vitest y Cypress (CO-ACC-01) |
| HA-08 | 2.5.8 | Playwright (proyectos Must de iPhone y Android) y revisión manual | Should | El enlace «Aviso de privacidad» de ingresar, que llegó con 12.6, medía 133×18 px. WCAG lo admite por la excepción de espaciado (27 px al objetivo más cercano), pero no cumplía el criterio del equipo y hacía fallar `sesion.spec.ts` en los dos proyectos móviles Must | Media | Corregido: clase `.enlace-suelto`, de 44 px de alto. Must de Playwright: 60 de 60 |
| HA-09 | 2.4.2 | Cypress (`pagos-tramites.cy.ts`) | Could | axe reportó `document-title` en mis trámites, después de enviar una solicitud, en una de dos corridas. Next.js 16 quita y repone el `<title>` cuando rehace la página en el cliente; en una navegación se midió cerca de 1 ms sin título. Con Playwright no se reprodujo tras la acción, así que la causa no está confirmada. No afecta a la persona | Baja | Abierto: prueba intermitente. Si se repite en CI, esperar el título antes de `revisarAxe` |
| HA-10 | 3.3.3 | Revisión manual de 12.4 | Could | El aviso del pago mayor que el adeudo dice «tu saldo de 1850.00», sin formato de moneda, mientras la ayuda del campo dice «$1,850.00». El texto viene de la API (`pagos.service.ts`) | Baja | Abierto: cambiarlo toca el mensaje del contrato y sus pruebas en la API |
| HA-11 | 2.4.6 (no es incumplimiento) | Árbol de accesibilidad (apartado 6) | Could | El nombre accesible de cada casilla de la oferta es su etiqueta entera: materia, grupo, horario, aula y lugares, unos 120 caracteres. Un lector la lee completa en cada casilla | Baja | Abierto: confirmar con VoiceOver antes de cambiarla (nombre corto y horario con `aria-describedby`) |

### 4.1 Indicador de la Tabla 13

| Dimensión | Indicador | Meta del piloto | Valor de ensayo (11 de noviembre de 2026) |
|---|---|---|---|
| Accesibilidad | Criterios WCAG 2.2 nivel AA verificados | 0 hallazgos bloqueantes en inscripción, pago y consulta | **0 bloqueantes abiertos.** 12 de 12 criterios de la lista manual cumplen; axe sin incumplimientos; Lighthouse de 100. Hallazgos: 11, ninguno bloqueante; 8 corregidos y 3 abiertos, los tres Could de severidad baja |

Es un valor de ensayo sobre el ambiente de pruebas, no la medición del piloto (manual v3.0, Tabla 13). La lectura con VoiceOver sigue pendiente (apartado 6) y puede sumar hallazgos.

## 5. Revisión manual de WCAG 2.2 AA

**Alcance:** las pantallas de los flujos Must de 28.1 y la Tabla 50: ingresar; inscripción; mi cuenta, pasarela y recibo; mi horario, mis calificaciones y mi expediente. **Cuándo y dónde:** 11 de noviembre de 2026, ambiente de Compose aislado del sub-batch (portal en el puerto 3240) con la semilla sintética, sobre el commit base `20965d7` más los cambios de 12.4. **Con qué:** Chromium 1254 de Playwright 1.65, manejado con el teclado; Chrome real de Android para el error del pago (`compatibilidad-dispositivos.md`). Las medidas (paradas de Tab, contornos, cajas y anchos) se tomaron del navegador, no a ojo. **Tamaños:** 1366×768 y 390×844, además de los de zoom y reflujo.

| Criterio | Qué se revisó y cómo | Resultado | Evidencia |
|---|---|---|---|
| 2.1.1 Teclado | Tab recorre cada control de las 8 pantallas: de 5 paradas (ingresar) a 33 (inscripción) a 1366×768. El importe se envió con Enter. Playwright opera los cuatro flujos solo con teclado en escritorio | Cumple | Proyectos `must-chrome-*` de Playwright, 60 de 60 |
| 2.1.2 Sin trampas para el foco | En las 16 combinaciones (8 pantallas × 2 tamaños), Tab llega al último control y sale del documento, y Shift+Tab regresa a él. El menú de celular no retiene el foco | Cumple | — |
| 2.4.3 Orden del foco | El orden es el del documento: saltar al contenido, marca, cerrar sesión, menú y contenido; en cada formulario, campo y después botón. Ningún `tabindex` positivo | Cumple | — |
| 2.4.7 Foco visible | Todas las paradas muestran un contorno de 3 px; en una tarjeta enlace, el contorno es de la tarjeta | Cumple | `2.4.7-foco-visible.png` |
| 2.4.11 Foco no oculto (mínimo) | En cada parada se buscó el elemento en su centro y sus esquinas. Ninguna quedó tapada por la barra lateral fija ni por la barra del menú, en ninguno de los dos tamaños | Cumple | — |
| 1.4.1 Uso del color | Adeudo, estados del pago y errores llevan texto («Adeudo», «Pagado», «Pendiente», «Error:»). Ningún enlace dentro de un párrafo, lista o tabla depende solo del color: todos van subrayados. La pantalla en grises se sigue entendiendo | Cumple | `1.4.1-mi-cuenta-en-grises.png` |
| 1.4.4 Cambio de tamaño del texto, con zoom real | Zoom del navegador al 200 % con `chrome.tabs.setZoom`, el mismo de Cmd +, sin emular el viewport: en una ventana de 1366×768 quedan 683 px CSS con `devicePixelRatio` 2. En ingresar, inscripción, mi cuenta, pasarela, recibo, mi horario y mis calificaciones, ningún desborde y todas las acciones visibles | Cumple | `1.4.4-1.4.10-zoom-real-200-y-400.png` (izquierda) |
| 1.4.10 Reflujo | Viewport de 320 px CSS en las 8 pantallas, y zoom real al 400 % en una ventana de 1280×1024 (320 px CSS) en cinco: sin desplazamiento horizontal; las tablas se apilan | Cumple | `1.4.4-1.4.10-zoom-real-200-y-400.png` (derecha) |
| 3.3.1 Identificación de errores | Ingreso vacío; pago vacío, negativo y mayor que el adeudo: aviso `role=alert` con «Error:» que recibe el foco, campo con `aria-invalid` y corrección unida con `aria-describedby`; lo escrito se conserva. El caso mayor que el adeudo no marcaba el campo | Cumple, tras corregir HA-07 | `3.3.1-error-del-pago.png`; `pagos-tramites.cy.ts` |
| 3.3.3 Sugerencia ante errores | Cada campo dice cómo corregir: «Escribe un importe mayor que cero y de hasta $1,850.00», «Escribe un correo completo, como nombre@uaemex.mx» | Cumple; observación HA-10 | `3.3.1-error-del-pago.png` |
| 3.3.8 Autenticación accesible (mínima) | Correo y contraseña con `autocomplete` `username` y `current-password`; pegar no está bloqueado; no hay CAPTCHA ni prueba cognitiva. Chrome de Android ofreció guardar la contraseña | Cumple | `compatibilidad-dispositivos.md` |
| 2.5.8 Tamaño del objetivo (mínimo) | Ningún control visible menor de 24×24 px fuera de una frase, salvo «Aviso de privacidad» en ingresar (133×18 px) | Cumple, tras corregir HA-08 | Playwright, `must-iphone-*` y `must-android-*` |

Las capturas están en `docs/evidencias/fase-4/capturas/accesibilidad/` y son recortes PNG de la corrida:

| Archivo | SHA-256 |
|---|---|
| `2.4.7-foco-visible.png` | `941654575c5569914337d2b81a6d434377e7512c60f46877f85d08a72fc75218` |
| `1.4.1-mi-cuenta-en-grises.png` | `163c9bcf7475dfff3b086618db7595fddbed873ad03a5dd3e67f72610c399571` |
| `1.4.4-1.4.10-zoom-real-200-y-400.png` | `1e680fb9cf7629a551b6671b7b53350595f3280b4588662a0b80e48cf21fb673` |
| `3.3.1-error-del-pago.png` | `d87865873b76e4973c6936826a5f354c97eb3e0963d9669437a47bec649c9703` |
| `arbol-de-accesibilidad.md` | `3164700a8de40699ee71f7ea9b6e8ffd442274b9a6b9666095af8f135a4c0a2d` |

**Firma de la revisión.** Desde el 10 de noviembre QA es FJMP, que también hizo los cambios, así que es una autoverificación (NC-012).

| Rol | Nombre | Teclado en los flujos Must | Zoom real al 200 % | Resultado | Firma | Fecha |
|---|---|---|---|---|---|---|
| QA (autoverificación, NC-012) | FJMP | Cumple | Cumple | 12 de 12 criterios; HA-07 y HA-08 corregidos | **Pendiente de firma** | |

## 6. Lector de pantalla: VoiceOver en lugar de NVDA

El manual v3.0 sustituye NVDA por VoiceOver con Safari, porque el equipo no tiene Windows. El flujo opcional de NVDA con Guidepup no se hizo.

**Estado: pendiente, a cargo de FJMP.** Para que un agente maneje VoiceOver, hace falta activar en la Utilidad VoiceOver la casilla «Permitir que VoiceOver se controle con AppleScript», y en este equipo no está activa (no existe la preferencia `SCREnableAppleScript`). Es un ajuste del sistema y no se cambió. Tampoco se encendió VoiceOver, porque habla en voz alta y toma el control del equipo.

**Pasos para la revisión manual**, unos 30 minutos:

1. Levantar el ambiente (`docker compose up -d`) y abrir Safari en `http://localhost:3000/ingresar`.
2. Encender VoiceOver con Cmd+F5. Leer con VO (Control+Opción) más las flechas; el rotor (VO+U) lista encabezados, enlaces y controles de formulario; Tab salta entre controles.
3. Recorrer los cuatro flujos con `alumno.dos@sce.test` (inscripción y pago) y `alumno@sce.test` (consulta), y anotar el resultado en la tabla de abajo.
4. Apagar VoiceOver con Cmd+F5.

Opcional, para automatizarlo después: con la casilla de AppleScript activa, Guidepup (`@guidepup/guidepup`) maneja VoiceOver desde Node. `npx @guidepup/setup` cambia ajustes del sistema, así que lo decide FJMP.

| Flujo | Qué debe anunciar VoiceOver | Resultado |
|---|---|---|
| Ingreso | «Iniciar sesión, encabezado de nivel 1»; cada campo con su etiqueta. Al enviarlo vacío: el aviso «Error: Revisa los campos marcados.» sin mover el cursor de VoiceOver a mano, y cada campo como «inválido» con su corrección | |
| Inscripción | El grupo «Oferta de 2027A» y cada casilla con su materia, grupo y horario (revisar si la lectura es demasiado larga, HA-11); el aviso de choque y el de rechazo cuando aparecen | |
| Pago | «Adeudo» con su importe; el campo de importe con su ayuda; con un importe mayor que el adeudo, el aviso y el campo inválido con su corrección (HA-07); en la pasarela, el aviso de que no se cobra dinero real y los dos botones; el recibo como región «Recibo de pago» | |
| Consulta | Las tablas de horario y calificaciones con su título; al moverse por celdas, el encabezado de su columna; cómo se lee «—» en un parcial sin capturar | |

**Sustituto que sí se hizo:** el árbol de accesibilidad de Chromium, que es lo que el navegador entrega a un lector de pantalla, en las ocho pantallas de los cuatro flujos, con Playwright (`ariaSnapshot`). Está en `docs/evidencias/fase-4/capturas/accesibilidad/arbol-de-accesibilidad.md`. Resultado: cada control tiene rol y nombre; los errores son `alert` y los campos quedan `[invalid]`; las tablas tienen título (`caption`) y encabezados de columna; el recibo es una región con nombre; los enlaces de la tabla de pagos nombran su referencia («Ver recibo REF-…»). De ahí sale HA-11. No sustituye a escuchar VoiceOver: no muestra la pronunciación ni el orden en que se anuncian los avisos.
