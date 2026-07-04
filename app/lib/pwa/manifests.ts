import type { MetadataRoute } from 'next';

export const systemPwa = {
  name: 'Loja com app',
  shortName: 'Lojacomapp',
  description: 'Sistema para gerenciar sua loja online com cara de app.',
  startUrl: '/login',
  scope: '/',
  themeColor: '#000000',
  backgroundColor: '#000000',
  icons: {
    icon192: '/icon/icon-192.png',
    icon512: '/icon/icon-512.png',
    maskable192: '/icon/icon-maskable-192.png',
    maskable512: '/icon/icon-maskable-512.png',
  },
} as const;

export function createSystemManifest(): MetadataRoute.Manifest {
  return {
    name: systemPwa.name,
    short_name: systemPwa.shortName,
    description: systemPwa.description,
    start_url: systemPwa.startUrl,
    scope: systemPwa.scope,
    display: 'standalone',
    orientation: 'portrait',
    background_color: systemPwa.backgroundColor,
    theme_color: systemPwa.themeColor,
    icons: [
      {
        src: systemPwa.icons.icon192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: systemPwa.icons.icon512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: systemPwa.icons.maskable192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: systemPwa.icons.maskable512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
