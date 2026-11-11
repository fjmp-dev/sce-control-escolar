// CO-COM-01: lo que toda pantalla de un flujo Must cumple en cada combinación de la Tabla 50, con los criterios de 28.1.
import { expect, test as base, type Locator, type Page } from '@playwright/test';
import type { AxeResults } from 'axe-core';

export { expect };

/** Staging tiene su propia contraseña de la semilla (20.2), como en scripts/humo.sh. */
export const CONTRASENA = process.env.CONTRASENA_SEMILLA ?? 'sce-dev-2026';

/** El mismo axe-core que usa Cypress (28.2), sin otra dependencia. */
const AXE = require.resolve('axe-core/axe.min.js');

interface Revisiones {
  /** 12.2: la CSP con nonce no bloquea nada del portal. Automática: cualquier violación en la consola falla la prueba. */
  csp: void;
  /** Tabla 50: ni la página ni sus tablas desbordan a lo ancho (scrollWidth <= clientWidth). */
  sinDesborde: () => Promise<void>;
  /** 28.1-1: cada control crítico está visible, se alcanza con Tab y el foco se ve. */
  alcanzables: (...controles: Locator[]) => Promise<void>;
  /** WCAG 2.2, 2.5.8: en móvil, todo objetivo mide al menos 24x24 px. Los enlaces dentro de una frase quedan exentos. */
  objetivosTactiles: () => Promise<void>;
  /** 28.2: axe-core con las reglas WCAG 2.2 AA, cero incumplimientos serious o critical. */
  axe: (nombre: string) => Promise<void>;
  /** Las cuatro revisiones anteriores sobre la pantalla actual. */
  revisar: (nombre: string, ...controles: Locator[]) => Promise<void>;
  /** En móvil se toca; en escritorio se usa el teclado (28.1-1): Espacio en una casilla y Enter en lo demás. */
  activar: (control: Locator) => Promise<void>;
}

// El segundo argumento de cada fixture se llama `entregar` y no `use`: eslint-plugin-react-hooks toma `use` por el hook.
export const test = base.extend<Revisiones>({
  csp: [
    async ({ page }, entregar, testInfo) => {
      const violaciones: string[] = [];
      page.on('console', (m) => {
        if (/Content[- ]Security[- ]Policy/i.test(m.text())) violaciones.push(m.text());
      });
      await entregar();
      // En WebKit, la captura de una prueba fallida inyecta un estilo que la CSP rechaza: solo cuenta si la prueba pasó.
      if (testInfo.status === testInfo.expectedStatus) expect(violaciones, '12.2: violaciones de la CSP').toEqual([]);
    },
    { auto: true },
  ],

  sinDesborde: async ({ page }, entregar) => {
    await entregar(async () => {
      const desbordes = await page.evaluate(() => {
        const raiz = document.documentElement;
        const tablas = [...document.querySelectorAll('table')]
          .filter((t) => t.getBoundingClientRect().right > raiz.clientWidth + 1 || t.scrollWidth > t.clientWidth + 1)
          .map((t) => `tabla "${t.caption?.textContent ?? ''}"`);
        return raiz.scrollWidth > raiz.clientWidth
          ? [`página: ${raiz.scrollWidth} > ${raiz.clientWidth}`, ...tablas]
          : tablas;
      });
      expect(desbordes, 'Tabla 50: desborde horizontal').toEqual([]);
    });
  },

  alcanzables: async ({ page, browserName }, entregar) => {
    // WebKit en macOS solo lleva Tab a los campos; con Alt+Tab recorre también enlaces y botones, como Safari.
    const tab = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
    await entregar(async (...controles) => {
      if (controles.length === 0) return;
      for (const control of controles) await expect(control, '28.1: control crítico visible').toBeVisible();
      const elementos = await Promise.all(controles.map((c) => c.elementHandle()));
      const faltan = new Map(controles.map((c, i) => [i, c.toString()]));
      const sinFoco: string[] = [];
      // Dos vueltas al orden de tabulación alcanzan, empiece donde empiece el foco.
      const pasos =
        2 * (await page.locator('a[href], button, input, select, textarea, summary, [tabindex]').count()) + 2;
      for (let paso = 0; paso < pasos && faltan.size > 0; paso++) {
        await page.keyboard.press(tab);
        const enfocado = await page.evaluate((els) => {
          const i = els.indexOf(document.activeElement as HTMLElement);
          return i < 0 ? null : { i, visible: getComputedStyle(els[i] as Element).outlineStyle !== 'none' };
        }, elementos);
        if (!enfocado || !faltan.has(enfocado.i)) continue;
        if (!enfocado.visible) sinFoco.push(faltan.get(enfocado.i) as string);
        faltan.delete(enfocado.i);
      }
      expect([...faltan.values()], '28.1-1: controles críticos que Tab no alcanza').toEqual([]);
      expect(sinFoco, '28.1-1: controles críticos sin foco visible').toEqual([]);
    });
  },

  objetivosTactiles: async ({ page, isMobile }, entregar) => {
    await entregar(async () => {
      if (!isMobile) return;
      const pequenos = await page.evaluate(() =>
        [
          ...document.querySelectorAll<HTMLElement>(
            'a[href], button, input:not([type=hidden]), select, textarea, summary',
          ),
        ]
          .filter((el) => el.checkVisibility({ visibilityProperty: true }))
          .map((el) => {
            // Enlace que cubre su tarjeta con ::after (inset: 0, .tarjeta-enlace): el objetivo es la tarjeta.
            const extendido = getComputedStyle(el, '::after').position === 'absolute' ? el.offsetParent : null;
            // Una casilla se toca por su etiqueta.
            return { el, caja: (extendido ?? el.closest('label') ?? el).getBoundingClientRect() };
          })
          .filter(({ el, caja }) => {
            if (caja.width >= 24 && caja.height >= 24) return false;
            const enUnaFrase =
              el.tagName === 'A' &&
              getComputedStyle(el).display === 'inline' &&
              (el.parentElement?.textContent ?? '').trim() !== (el.textContent ?? '').trim();
            return !enUnaFrase;
          })
          .map(({ el, caja }) => {
            const nombre = el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.getAttribute('name');
            return `${el.tagName.toLowerCase()} "${nombre?.slice(0, 40)}": ${Math.round(caja.width)}x${Math.round(caja.height)}`;
          }),
      );
      expect(pequenos, 'WCAG 2.2, 2.5.8: objetivos menores de 24x24 px').toEqual([]);
    });
  },

  axe: async ({ page }, entregar, testInfo) => {
    await entregar(async (nombre) => {
      await page.addScriptTag({ path: AXE }); // lo inserta Playwright: la CSP con nonce (proxy.ts) no lo bloquea
      const resultado = await page.evaluate(() =>
        (window as unknown as { axe: { run: (contexto: Document, opciones: object) => Promise<AxeResults> } }).axe.run(
          document,
          { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } },
        ),
      );
      const graves = resultado.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      await testInfo.attach(`axe-${nombre}.json`, {
        contentType: 'application/json',
        body: JSON.stringify({
          pagina: resultado.url,
          motor: resultado.testEngine,
          reglasAprobadas: resultado.passes.length,
          incumplimientos: resultado.violations,
        }),
      });
      expect(resultado.passes.length, 'axe: reglas evaluadas').toBeGreaterThan(0); // falla cerrada
      expect(
        graves.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
        `axe en ${nombre}: incumplimientos serious o critical`,
      ).toEqual([]);
    });
  },

  revisar: async ({ sinDesborde, alcanzables, objetivosTactiles, axe }, entregar) => {
    await entregar(async (nombre, ...controles) => {
      await sinDesborde();
      await alcanzables(...controles);
      await objetivosTactiles();
      await axe(nombre);
    });
  },

  activar: async ({ page, isMobile }, entregar) => {
    await entregar(async (control) => {
      if (isMobile) return control.tap();
      await control.focus();
      await page.keyboard.press((await control.getAttribute('type')) === 'checkbox' ? 'Space' : 'Enter');
    });
  },
});

/** Inicio de sesión desde el formulario, enviado con Enter. */
export async function iniciarSesion(page: Page, correo: string) {
  await page.goto('/ingresar');
  await page.getByLabel('Correo institucional').fill(correo);
  await page.getByLabel('Contraseña').fill(CONTRASENA);
  await page.getByLabel('Contraseña').press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Inicio' })).toBeVisible();
}

export async function cerrarSesion(page: Page) {
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/ingresar/);
}
