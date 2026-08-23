"use client";

import { useState } from "react";
import type { Project } from "@prisma/client";
import { toggleFeaturedProject, updateProjectImage } from "./actions";

export function ProjectList({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic update
    setProjects(projects.map(p => p.id === id ? { ...p, isFeatured: newStatus } : p));
    
    const res = await toggleFeaturedProject(id, newStatus);
    if (!res.success) {
      // Revert if failed
      setProjects(projects.map(p => p.id === id ? { ...p, isFeatured: currentStatus } : p));
      alert("Failed to update featured status");
    }
  };

  const handleImageUrl = async (id: string) => {
    const url = prompt("Enter new Image URL (e.g. from unsplash or imgur):");
    if (url === null) return;
    
    const res = await updateProjectImage(id, url);
    if (res.success) {
      setProjects(projects.map(p => p.id === id ? { ...p, imageUrl: url } : p));
    } else {
      alert("Failed to update image");
    }
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="p-4 border border-border rounded-xl bg-card/50 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={project.title} className="w-16 h-16 object-cover rounded-md" />
            ) : (
              <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground text-center p-1">No Image</div>
            )}
            <div>
              <h3 className="font-bold text-lg">{project.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">{project.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleImageUrl(project.id)}
              className="text-sm text-primary hover:underline"
            >
              Set Image
            </button>
            <label className="flex items-center gap-2 cursor-pointer bg-background px-3 py-1.5 rounded-md border border-border">
              <span className="text-sm">Featured</span>
              <input 
                type="checkbox" 
                checked={project.isFeatured}
                onChange={() => handleToggle(project.id, project.isFeatured)}
                className="w-4 h-4 accent-primary"
              />
            </label>
          </div>
        </div>
      ))}
      {projects.length === 0 && (
        <p className="text-muted-foreground">No projects found. Upload your CV to extract projects automatically via AI!</p>
      )}
    </div>
  );
}