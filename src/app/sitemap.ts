import { MetadataRoute } from 'next'
import { swimAnalysisPages } from '@/data/swimAnalysisPages'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://strokelab.app'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/analyze`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/analyze/video`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const swimAnalysisRoutes: MetadataRoute.Sitemap = swimAnalysisPages.map((page) => ({
    url: `${baseUrl}/swim-analysis/${page.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  return [...staticPages, ...swimAnalysisRoutes]
}
