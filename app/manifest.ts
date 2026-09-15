import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NexaCart',
    short_name: 'NexaCart',
    description: 'Everything you need, one smart cart.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafd',
    theme_color: '#f45b2a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
