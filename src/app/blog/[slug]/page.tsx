import { prisma } from "@/utils/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.blog.findUnique({ where: { slug: params.slug } });
  if (!post) return { title: 'Not Found' };
  
  return {
    title: `${post.title} | Blog`,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
    }
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await prisma.blog.findUnique({
    where: { slug: params.slug }
  });

  if (!post) {
    notFound();
  }

  // Increment views
  await prisma.blog.update({
    where: { id: post.id },
    data: { views: { increment: 1 } }
  });

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 max-w-3xl mx-auto">
      <Link href="/blog" className="text-primary hover:underline mb-8 block font-mono text-sm uppercase tracking-wider">&larr; Back to all posts</Link>
      
      <article className="glass-panel p-8 md:p-12 rounded-3xl">
        <header className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">{post.title}</h1>
          <div className="flex items-center text-muted-foreground gap-4">
            <span>Published {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            <span>•</span>
            <span>{post.views + 1} views</span>
          </div>
        </header>

        <div className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}