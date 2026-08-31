"use client";
import { useState } from "react";
import MDEditor from '@uiw/react-md-editor';
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminBlog() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("**Hello world!!!**");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!title || !content) return toast.error("Title and content are required");
    
    setLoading(true);
    const res = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, excerpt, published: true })
    });
    
    if (res.ok) {
      toast.success("Published successfully!");
      router.push('/blog');
    } else {
      toast.error("Error saving");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-mono text-primary">Write Article</h1>
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/80 transition-colors"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
      
      <div className="space-y-4">
        <input 
          type="text" 
          placeholder="Article Title..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-background/50 border border-white/10 rounded-lg p-4 text-2xl font-bold focus:outline-none focus:border-primary transition-colors"
        />
        <input 
          type="text" 
          placeholder="Short excerpt..." 
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full bg-background/50 border border-white/10 rounded-lg p-4 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div data-color-mode="dark">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || "")}
          height={500}
        />
      </div>
    </div>
  );
}