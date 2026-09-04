"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CVImportPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    files.forEach(file => formData.append("cv", file));

    try {
      const res = await fetch("/api/upload-cv", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse documents");
      }
      
      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Data via AI</h1>
        <p className="text-muted-foreground mt-2">Unggah CV (PDF). AI kami akan otomatis mengekstrak profile, pengalaman, pendidikan, dan keahlianmu. (Catatan: Proyek portofolio kini tersinkronisasi via GitHub).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload PDFs</CardTitle>
          <CardDescription>Pilih file PDF CV kamu.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cv-upload">Documents (.pdf)</Label>
              <Input 
                id="cv-upload" 
                type="file" 
                accept=".pdf" 
                multiple
                onChange={handleFileChange}
                required
              />
              {files.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {files.length} file(s) selected
                </p>
              )}
            </div>
            <Button type="submit" disabled={files.length === 0 || loading}>
              {loading ? "Parsing with AI (might take a minute)..." : "Extract & Save"}
            </Button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-md">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-green-500/10 text-green-700 dark:text-green-400 rounded-md">
                <p className="font-semibold">Successfully Extracted & Saved!</p>
                <p className="text-sm">
                  Found {result.experiences} experiences, {result.education} education entries, {result.skills} skills, and {result.projects} projects.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}