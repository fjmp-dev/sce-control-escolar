# Accesibilidad y compatibilidad — SCE

**Fuente:** SCE-MC-001 v2.0, secciones 27 y 28, y Tablas 15, 16, 42 y 50. **Criterio de auditoría:** AU-32.
**Versión:** 1.0, 6 de noviembre de 2026 (Batch 3). Se repite con cada interfaz nueva; se completa en el Batch 12.

## 1. Lista de verificación (28.1)

Los criterios de 28.1 nombran los formularios de inscripción y pago. El de inscripción existe desde el Batch 5 y usa los mismos componentes que el resto del portal: casillas con etiqueta, aviso que recibe el foco, estado escrito con su corrección y comprobante imprimible sin menú. El de pago llega en el Batch 9.

| Criterio | Cómo se cumple | Cómo se verifica | Estado |
|---|---|---|---|
| Operable por teclado, orden de foco lógico y foco visible | HTML nativo, sin atajos propios. Enlace para saltar al contenido. Contorno de 3 px en `:focus-visible` | `accesibilidad.cy.ts` recorre el inicio de sesión con Tab y comprueba orden y contorno; entra con Enter | Automatizado solo en inicio de sesión. **El resto del portal falta revisarlo a mano** |
| Todo campo con etiqueta asociada | `Campo`, `Selector` y `Casillas` generan la asociación. Cypress localiza cada campo por su etiqueta visible | axe y `componentes.test.tsx` | Cumple |
| Errores con causa y corrección | Aviso general con foco, y mensaje por campo que dice cómo corregir, unido con `aria-describedby`. Lo escrito no se pierde, salvo contraseñas | Cypress y Vitest | Cumple |
| Contraste de al menos 4.5:1 | Paleta del planteamiento, con el gris de texto oscurecido | axe, regla `color-contrast`, y Lighthouse | Cumple |
| Estado no solo por color | Todo aviso lleva `Error:`, `Listo:` o `Aviso:`. Cuenta activa o inactiva, en texto. Página actual, en negrita y subrayada | `componentes.test.tsx` | Cumple |
| Zoom al 200 % sin ocultar acciones | Diseño fluido; sin alturas fijas | Cypress en 683×384, equivalente a 200 % sobre 1366×768. **Es una aproximación:** falta la prueba con zoom real en el navegador | Cumple en la prueba |
| Objetivo táctil de WCAG 2.2 | Controles de 44 px; el mínimo AA es de 24 px | Cypress mide cada control en las cuatro resoluciones | Cumple |

**Conectividad limitada (Tabla 15, Inclusividad):** cerca de 150 KB por página, según Lighthouse. Sin librerías de interfaz ni imágenes, y los formularios funcionan aunque no cargue JavaScript, porque son acciones de servidor. **Etiquetas sin diccionario técnico (Tabla 16):** los roles y estados se muestran en español legible, y Vitest lo comprueba para los roles.

## 2. Evaluación (28.2)

| Herramienta | Alcance | Resultado | Evidencia |
|---|---|---|---|
| axe-core 4.14, reglas WCAG 2.0, 2.1 y 2.2 A y AA | 32 páginas y estados: inicio de sesión con y sin errores; todas las del administrador; expedientes de control escolar, con y sin errores; coordinación, incluida la oferta con errores, con traslape y publicada, el cierre rechazado por D-16 y la corrección; mis grupos y la captura del profesor; mi expediente, mi horario y mis calificaciones; inscripción, con aviso de choque y con rechazo; sin permiso | Ver la corrida del PR | Artefacto `despliegue-pruebas`, `cypress/reportes/axe/` |
| Lighthouse 13 | 8 páginas, cinco de ellas con formularios, entre ellas la inscripción y la oferta, y las calificaciones del alumno | Ver la corrida del PR; umbral de accesibilidad de 90 | Artefacto `despliegue-pruebas`, `lighthouse/` |
| Teclado, revisión manual | — | **Pendiente: la hace QA** | Sección 4 |
| NVDA | — | **Pendiente, Batch 12:** requiere un equipo con Windows | — |

El manual no fija puntaje mínimo de Lighthouse. El 90 es criterio del equipo. axe no sustituye a una revisión manual: detecta una parte de los incumplimientos de WCAG.

## 3. Compatibilidad (Tabla 50)

| Plataforma | Estado |
|---|---|
| Resoluciones 1920×1080, 1366×768 y 390×844 | **Automatizado con Cypress:** sin desborde horizontal; las tablas se apilan en pantallas angostas |
| Chrome, Firefox, Edge, Safari en iOS y Chrome en Android | **Pendiente, Batch 12:** Playwright sobre Chromium, Firefox y WebKit (sección 27). Cypress corre aquí sobre Electron |

## 4. Registro de hallazgos

Clasificación de 28.2: Should o Could, salvo que bloqueen por completo un flujo Must.

| Hallazgo | Clase | Cómo se detectó | Estado |
|---|---|---|---|
| Al quitar un prerrequisito, el formulario desaparecía con su fila: sin confirmación y con el foco perdido | Should | Cypress | Corregido: un formulario único que no se desmonta |
| Tras un error, un selector volvía a la opción vacía | Should | Vitest | Corregido |
| Las casillas de opción heredaban negritas, y costaba distinguirlas de la leyenda del grupo | Could | Revisión de capturas | Corregido |

## 5. Revisión manual de QA

| Rol | Nombre | Teclado en todo el portal | Zoom real al 200 % | Resultado | Firma | Fecha |
|---|---|---|---|---|---|---|
| QA | Samuel Jezoar Ortiz Martínez | | | | | |
