import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SVOV Academy',
    short_name: 'SVOV',
    description: 'Spec, Orchestrate, Verify Academy',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f6fb',
    theme_color: '#2563eb',
    icons: []
  };
}
