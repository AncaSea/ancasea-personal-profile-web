"use client";
import { useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

function AlertHandlerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasFired = useRef(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'admin_access_denied' && !hasFired.current) {
      hasFired.current = true;
      toast.error("Akses Ditolak! 🛑", {
        description: "Mohon maaf, pintu rahasia ini hanya khusus untuk Ancasea.",
        duration: 5000,
      });
      
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('error');
      const newUrl = pathname + (newParams.toString() ? '?' + newParams.toString() : '');
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  return null;
}

export function AlertHandler() {
  return (
    <Suspense fallback={null}>
      <AlertHandlerInner />
    </Suspense>
  );
}
