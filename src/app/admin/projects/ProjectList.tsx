"use client";

import { useState } from "react";
import type { Project } from "@prisma/client";
import { toggleFeaturedProject, updateProjectImage, updateProjectsOrder, updateFeaturedProjectsOrder } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { logSystemEvent } from "../logs/actions";
import { ImageIcon, Trash2, ArrowUp, ArrowDown } from "lucide-react";

const BUCKET_NAME = 'portofolio-images';

type ProjectWithOrder = Project & { order: number; featuredOrder: number };

export function ProjectList({ initialProjects }: { initialProjects: ProjectWithOrder[] }) {
  const [projects, setProjects] = useState<ProjectWithOrder[]>(initialProjects);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const supabase = createClient();

  const featuredProjects = projects.filter(p => p.isFeatured).sort((a, b) => a.featuredOrder - b.featuredOrder);
  const allProjects = [...projects].sort((a, b) => a.order - b.order);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setProjects(projects.map(p => p.id === id ? { ...p, isFeatured: newStatus } : p));
    
    const res = await toggleFeaturedProject(id, newStatus);
    if (!res.success) {
      setProjects(projects.map(p => p.id === id ? { ...p, isFeatured: currentStatus } : p));
      toast.error("Gagal memperbarui status featured");
      logSystemEvent("ERROR", "Failed to update featured status", res);
    }
  };

  const handleFileUpload = async (id: string, file: File) => {
    try {
      setUploadingId(id);
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      const publicUrl = data.publicUrl;
      const res = await updateProjectImage(id, publicUrl);
      if (res.success) {
        setProjects(projects.map(p => p.id === id ? { ...p, imageUrl: publicUrl } : p));
        toast.success("Gambar berhasil diunggah!");
      } else {
        toast.error("Gagal menyimpan URL gambar ke database.");
      }
    } catch (error: any) {
      toast.error("Gagal mengunggah gambar.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteImage = async (id: string, currentUrl: string | null) => {
    try {
      setUploadingId(id);
      if (currentUrl && currentUrl.includes('supabase.co')) {
        const fileName = currentUrl.split('/').pop();
        if (fileName) await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      }
      const res = await updateProjectImage(id, null);
      if (res.success) {
        setProjects(projects.map(p => p.id === id ? { ...p, imageUrl: null } : p));
        toast.success("Gambar berhasil dihapus.");
      } else {
        toast.error("Gagal menghapus gambar dari database.");
      }
    } catch (error: any) {
      toast.error("Terjadi kesalahan saat menghapus gambar.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleMoveFeatured = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === featuredProjects.length - 1) return;
    setIsReordering(true);
    const newArr = [...featuredProjects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
    
    const updates = newArr.map((p, i) => ({ id: p.id, featuredOrder: i }));
    
    setProjects(prev => prev.map(p => {
      const update = updates.find(u => u.id === p.id);
      if (update) return { ...p, featuredOrder: update.featuredOrder };
      return p;
    }));

    const res = await updateFeaturedProjectsOrder(updates);
    if (!res.success) toast.error("Gagal menyimpan urutan.");
    setIsReordering(false);
  };

  const handleMoveAll = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === allProjects.length - 1) return;
    setIsReordering(true);
    const newArr = [...allProjects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
    
    const updates = newArr.map((p, i) => ({ id: p.id, order: i }));
    
    setProjects(prev => prev.map(p => {
      const update = updates.find(u => u.id === p.id);
      if (update) return { ...p, order: update.order };
      return p;
    }));

    const res = await updateProjectsOrder(updates);
    if (!res.success) toast.error("Gagal menyimpan urutan.");
    setIsReordering(false);
  };

  return (
    <div className="space-y-12">
      {/* FEATURED PROJECTS CARD */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/50 p-6 border-b border-border">
          <h2 className="text-xl font-bold text-primary">Featured Projects (Podium)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Atur urutan proyek yang tampil di atas halaman. Peringkat 1 akan berada di tengah Podium, Peringkat 2 di Kiri, Peringkat 3 di Kanan.
          </p>
        </div>
        <div className="p-6 space-y-4">
          {featuredProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Belum ada proyek yang ditandai Featured.</p>
          ) : (
            featuredProjects.map((project, index) => (
              <div key={project.id} className="p-4 border border-border rounded-xl bg-background flex justify-between items-center gap-4 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => handleMoveFeatured(index, 'up')} 
                      disabled={index === 0 || isReordering}
                      className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleMoveFeatured(index, 'down')} 
                      disabled={index === featuredProjects.length - 1 || isReordering}
                      className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold">{project.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm">{project.description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ALL PROJECTS CARD */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/50 p-6 border-b border-border">
          <h2 className="text-xl font-bold">All Projects Archive</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Atur urutan semua proyek, upload gambar, dan tentukan mana yang ingin dijadikan Featured.
          </p>
        </div>
        <div className="p-6 space-y-4">
          {allProjects.map((project, index) => (
            <div key={project.id} className="p-4 border border-border rounded-xl bg-background flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => handleMoveAll(index, 'up')} 
                    disabled={index === 0 || isReordering}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleMoveAll(index, 'down')} 
                    disabled={index === allProjects.length - 1 || isReordering}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="w-16 h-16 object-cover rounded-md border border-border shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center border border-border shrink-0">
                    <ImageIcon className="text-muted-foreground w-6 h-6 opacity-50" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{project.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">{project.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 self-end md:self-auto">
                <div className="flex items-center gap-3">
                  <label className={`text-sm font-bold ${uploadingId === project.id ? 'text-muted-foreground' : 'text-primary hover:underline cursor-pointer'}`}>
                    {uploadingId === project.id ? "Processing..." : (project.imageUrl ? "Ganti" : "Upload")}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(project.id, e.target.files[0]);
                        }
                      }}
                      disabled={uploadingId === project.id}
                    />
                  </label>

                  {project.imageUrl && (
                    deleteConfirmId === project.id ? (
                      <div className="flex items-center gap-2 bg-destructive/10 px-2 py-1 rounded-md animate-in fade-in slide-in-from-right-2">
                        <span className="text-xs font-bold text-destructive mr-1">Hapus?</span>
                        <button 
                          onClick={() => handleDeleteImage(project.id, project.imageUrl)}
                          disabled={uploadingId === project.id}
                          className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded hover:bg-destructive/90 transition-colors"
                        >
                          Ya
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(null)}
                          disabled={uploadingId === project.id}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeleteConfirmId(project.id)}
                        disabled={uploadingId === project.id}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors disabled:opacity-50"
                        title="Hapus Gambar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-muted px-3 py-1.5 rounded-md border border-border hover:bg-background transition-colors ml-2">
                  <span className="text-sm font-medium">Featured</span>
                  <input 
                    type="checkbox" 
                    checked={project.isFeatured}
                    onChange={() => handleToggle(project.id, project.isFeatured)}
                    className="accent-primary w-4 h-4"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
