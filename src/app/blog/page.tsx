import { prisma } from "@/utils/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const revalidate = 3600;

export default async function BlogIndex() {
  const posts = await prisma.blog.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 max-w-4xl mx-auto">
      <Link href="/" className="text-primary hover:underline mb-12 block">&larr; Back to Home</Link>
      <h1 className="text-5xl font-black mb-12">Writings</h1>
      
      <div className="space-y-8">
        {posts.map(post => (
          <Link href={`/blog/${post.slug}`} key={post.id} className="block group">
            <article className="glass-panel p-8 rounded-3xl hover:border-primary/50 transition-colors">
              <h2 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors">{post.title}</h2>
              {post.excerpt && <p className="text-muted-foreground mb-4 text-lg">{post.excerpt}</p>}
              <div className="flex items-center text-sm text-muted-foreground gap-4">
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                <span>•</span>
                <span>{post.views} views</span>
              </div>
            </article>
          </Link>
        ))}
        {posts.length === 0 && (
          <p className="text-muted-foreground text-xl">No articles published yet.</p>
        )}
      </div>
    </main>
  );
}