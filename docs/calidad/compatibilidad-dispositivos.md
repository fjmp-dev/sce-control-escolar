# Compatibilidad en dispositivos — SCE

**Fuente:** SCE-MC-001 v2.0, sección 27 y Tabla 50; `plan-de-sistema.md`, 6.2, sub-batch 12.4. **Criterio de auditoría:** AU-32.
**Versión:** 1.0, 11 de noviembre de 2026. Revisión manual que complementa la matriz automatizada de Playwright (CO-COM-01, `plan-de-pruebas.md`, 4.6).

## 1. Por qué y con qué

Playwright sustituye Safari de iOS con WebKit y el descriptor del iPhone, y Chrome de Android con Chromium y el descriptor del Pixel. Aquí se usan los navegadores reales en un simulador y un emulador ya instalados en el equipo de desarrollo. No se instalaron runtimes ni imágenes de sistema para esta revisión.

| Plataforma (Tabla 50) | Dispositivo | Navegador | Cómo se manejó |
|---|---|---|---|
| Safari en iOS reciente, Must | Simulador de Xcode, iPhone 17 con iOS 27.0 (24A434) | Safari de iOS 27 | `xcrun simctl boot`, `openurl` e `io screenshot`, sin ventana |
| Chrome en Android reciente, Must | Emulador `Pixel_10_Pro` (Android 17, API 37, Google APIs con Play Store), 1280×2856 a 480 dpi | Chrome 156.0.8078.79 | `emulator -read-only -no-window`; la página se manejó por CDP (`adb forward` y `connectOverCDP` de Playwright 1.65) y se capturó con `adb exec-out screencap` |

**Ambiente:** Compose aislado del sub-batch (proyecto `sce-124`, portal en el puerto 3240), con la semilla sintética, sobre el commit base `20965d7` más los cambios de 12.4. El emulador llega al equipo por `10.0.2.2` y el simulador por `localhost`. El emulador corrió en solo lectura: el AVD quedó como estaba.

**Límite del simulador.** `simctl` no teclea ni toca. Para abrir las páginas con sesión, una página auxiliar en `localhost:3250` escribió la cookie `sce_sesion` con el token de una cuenta sintética, pedido a la API. Las cookies no distinguen puerto, así que el portal la recibe como la de un inicio de sesión. Por eso, en iOS se revisó cómo se ve cada pantalla, pero no se llenó ni se envió ningún formulario.

## 2. Resultados

| Flujo Must (Tabla 50) | Pantallas | Safari en iOS 27 (simulador) | Chrome 156 en Android 17 (emulador) |
|---|---|---|---|
| Inicio de sesión | Ingresar; ingresar con errores | Se ve completo; campos, «Entrar» y el aviso de privacidad a la vista | Cumple. Se envió vacío (errores en cada campo) y luego con la cuenta |
| Inscripción | Oferta de 2027A | Cumple a la vista: casillas con su etiqueta completa, «30 lugares» con texto | Cumple: oferta, casillas y botones visibles |
| Pago | Mi cuenta, importe mayor que el adeudo, pasarela, recibo | Mi cuenta, pasarela y recibo se ven completos. El error no se probó (no hay tecleo) | Cumple. Error con aviso y campo marcado; pago de $10, aprobación y recibo con saldo |
| Consulta | Mi horario, mis calificaciones | Cumple a la vista: el horario se apila en tarjetas; promedio, créditos y avance con texto | Cumple: horario apilado y calificaciones |

**Medidas en Chrome de Android** (por CDP, en cada pantalla): ancho de 426 px CSS con `devicePixelRatio` 3; ningún desborde horizontal; ningún control visible menor de 24×24 px fuera de una frase. Lo mismo en las nueve pantallas: ingresar, ingresar con errores, inicio, inscripción, mi cuenta con error, pasarela, recibo, mi horario y mis calificaciones.

**Lo que se vio y no es del portal.** Chrome ofreció guardar la contraseña, lo que confirma que el gestor reconoce el formulario (WCAG 3.3.8), y ofreció traducir la página, porque el emulador está en inglés. La barra flotante de Safari tapa la parte baja de la pantalla hasta que se desplaza. Son controles del navegador, no contenido del portal, así que no cuentan para 2.4.11.

**Hallazgos:** ninguno nuevo. El enlace «Aviso de privacidad» ya se ve con la altura de un control tras HA-08 (`accesibilidad.md`, apartado 4).

## 3. Pendiente

| Qué | Por qué | Pasos |
|---|---|---|
| En Safari de iOS: llenar y enviar el inicio de sesión, la inscripción y el pago, incluido un importe mayor que el adeudo | `simctl` no teclea; no se usó automatización de la interfaz (Accesibilidad de macOS) para no cambiar permisos del sistema | Abrir el simulador con `open -a Simulator`, entrar a `http://localhost:3000/ingresar` con `alumno.dos@sce.test` y seguir la lista del apartado 2. Anotar el resultado en esta tabla |

## 4. Evidencia

| Archivo | Contenido |
|---|---|
| `docs/evidencias/fase-4/capturas/dispositivos/ios-safari.png` | Safari de iOS 27: ingresar, inscripción, mi cuenta, pasarela, recibo, mi horario y mis calificaciones |
| `docs/evidencias/fase-4/capturas/dispositivos/android-chrome.png` | Chrome 156 de Android 17: ingresar, inscripción, error del pago, recibo y mi horario |
