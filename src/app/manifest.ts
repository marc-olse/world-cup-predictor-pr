import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Primicos World Cup',
    short_name: 'Primicos WC',
    description: 'A private World Cup score prediction game.',
    start_url: '/matches/today',
    id: '/',
    scope: '/',
    display: 'standalone',
    categories: ['sports', 'games'],
    background_color: '#f7f8f3',
    theme_color: '#16784b',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
