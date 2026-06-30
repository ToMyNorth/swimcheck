import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SwimCheck - AI Swimming Stroke Analysis',
    short_name: 'SwimCheck',
    description: 'Upload swimming photos and get instant AI-powered feedback on your technique.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#3b5ccc',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '64x64',
        type: 'image/x-icon',
      },
    ],
    categories: ['sports', 'health'],
    lang: 'en',
  };
}
