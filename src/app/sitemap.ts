import { MetadataRoute } from 'next'
import { prisma } from '@/utils/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ancasea.com'

  const blogs = await prisma.blog.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const blogEntries: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: ${"${baseUrl}/blog/"},
    lastModified: blog.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...blogEntries,
  ]
}