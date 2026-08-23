import { prisma } from "@/utils/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { PlusCircle, Eye, Edit } from "lucide-react";

export const revalidate = 0; // Don't cache admin pages

export default async function AdminBlogList() {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-mono text-primary">Manage Blogs</h1>
        <Link href="/admin/blog/editor" className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/80 transition-colors">
          <PlusCircle size={20} /> Create New
        </Link>
      </div>

      <div className="bg-background/50 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b border-white/10">
            <tr>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Views</th>
              <th className="p-4 font-medium">Published</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {blogs.map(blog => (
              <tr key={blog.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-medium">{blog.title}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${blog.published ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {blog.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{blog.views}</td>
                <td className="p-4 text-muted-foreground">
                  {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/blog/${blog.slug}`} target="_blank" className="p-2 hover:bg-white/10 rounded-md transition-colors text-muted-foreground hover:text-foreground">
                      <Eye size={18} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {blogs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No blogs written yet. Click "Create New" to start!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}