import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, LayoutDashboard, LogOut, BookOpen } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-muted-foreground mt-1 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-md transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/admin/cv" className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors">
            <FileText size={20} /> Import CV
          </Link>
          <Link href="/admin/blog" className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors">
            <BookOpen size={20} /> Manage Blogs
          </Link>
        </nav>
        <div className="p-4 border-t">
          <form action="/api/auth/signout" method="POST">
            <button className="flex w-full items-center gap-3 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
              <LogOut size={20} /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}