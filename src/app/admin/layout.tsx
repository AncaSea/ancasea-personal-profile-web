import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './AdminSidebar'

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

  // Phase 1: Security & RBAC. Only the owner can access the admin panel.
  const adminEmail = process.env.ADMIN_EMAIL || 'rekaasae255@gmail.com'
  if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    // If a normal user (from Guestbook) tries to access Admin, kick them to home page
    redirect('/?error=admin_access_denied')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background relative selection:bg-primary/30">
      {/* Mesh Gradient Background: Space (Purple) + Ocean (Teal) + Sky (Blue) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px]" />
         <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="z-10 flex flex-col shrink-0 h-full py-4 pl-4">
        <AdminSidebar email={user.email} />
      </div>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
        {children}
      </main>
    </div>
  )
}