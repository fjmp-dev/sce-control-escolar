import type { NextConfig } from 'next';

const configuracion: NextConfig = {
  output: 'standalone', // imagen sce-portal sin dependencias de desarrollo (Fig. 9)
  poweredByHeader: false,
  images: { unoptimized: true }, // el portal no usa imagenes: sin sharp en la imagen
  async headers() {
    return [
      {
        source: '/:ruta*',
        headers: [
          // La CSP lleva un nonce por petición: la pone proxy.ts (12.2).
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'same-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Aislamiento entre orígenes (ZAP 90004, 12.2): otra ventana no se queda con esta, ni otro sitio usa sus recursos.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default configuracion;
