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
          // Next.js incrusta scripts de arranque: 'unsafe-inline' hasta adoptar nonces (STRIDE, Batch 12).
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'same-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default configuracion;
