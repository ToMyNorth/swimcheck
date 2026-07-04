import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/dashboard', '/checkout', '/report/'],
      },
    ],
    sitemap: 'https://strokelab.app/sitemap.xml',
  }
}
