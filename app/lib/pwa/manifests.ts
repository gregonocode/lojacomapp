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

type StoreManifestInput = {
  name: string;
  shortName: string;
  description: string;
  slug: string;
  themeColor: string;
  iconUrl: string | null;
};

export function createStoreManifest({
  name,
  shortName,
  description,
  slug,
  themeColor,
  iconUrl,
}: StoreManifestInput): MetadataRoute.Manifest {
  const fallbackIcons = [
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
  ] satisfies MetadataRoute.Manifest['icons'];

  const storeIcons = iconUrl
    ? ([
        {
          src: iconUrl,
          sizes: iconUrl.endsWith('.svg') ? 'any' : '192x192',
          type: iconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
          purpose: 'any',
        },
        {
          src: iconUrl,
          sizes: iconUrl.endsWith('.svg') ? 'any' : '512x512',
          type: iconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
          purpose: 'maskable',
        },
      ] satisfies MetadataRoute.Manifest['icons'])
    : fallbackIcons;

  return {
    name,
    short_name: shortName,
    description,
    start_url: `/${slug}`,
    scope: `/${slug}`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f7f7f8',
    theme_color: themeColor,
    icons: storeIcons,
  };
}
