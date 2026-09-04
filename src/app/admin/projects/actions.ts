"use server";
import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFeaturedProject(id: string, isFeatured: boolean) {
  try {
    await prisma.project.update({
      where: { id },
      data: { isFeatured },
    });
    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update project" };
  }
}

export async function updateProjectImage(id: string, imageUrl: string | null) {
  try {
    await prisma.project.update({
      where: { id },
      data: { imageUrl },
    });
    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update image" };
  }
}
export async function updateProjectsOrder(updates: { id: string; order: number }[]) {
  try {
    await prisma.$transaction(
      updates.map((update) => 
        prisma.project.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );
    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update projects order" };
  }
}

export async function updateFeaturedProjectsOrder(updates: { id: string; featuredOrder: number }[]) {
  try {
    await prisma.$transaction(
      updates.map((update) => 
        prisma.project.update({
          where: { id: update.id },
          data: { featuredOrder: update.featuredOrder },
        })
      )
    );
    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update featured projects order" };
  }
}

export async function syncGithubProjects() {
  try {
    const res = await fetch('https://api.github.com/users/AncaSea/repos?per_page=100&type=owner&sort=updated', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}` // Optional if rate limited
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch from GitHub API');
    }

    const repos = await res.json();
    
    // Sort by stars descending to easily pick top 3
    repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

    let syncedCount = 0;

    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i];
      // Skip forks or whatever if needed, but let's sync all for now
      if (repo.fork) continue;

      const githubId = repo.id;
      const title = repo.name.replace(/-/g, ' '); // simple formatting
      const description = repo.description || '';
      const link = repo.html_url;
      const language = repo.language;
      const stars = repo.stargazers_count;
      const techStack = repo.topics ? JSON.stringify(repo.topics) : (language ? JSON.stringify([language]) : null);

      // Check if cover.png or cover.jpg exists
      const coverPngUrl = `https://raw.githubusercontent.com/AncaSea/${repo.name}/main/cover.png`;
      const coverJpgUrl = `https://raw.githubusercontent.com/AncaSea/${repo.name}/main/cover.jpg`;
      
      let imageUrl = null;
      
      // Simple head request to check if image exists
      try {
        const pngRes = await fetch(coverPngUrl, { method: 'HEAD' });
        if (pngRes.ok) imageUrl = coverPngUrl;
        else {
          const jpgRes = await fetch(coverJpgUrl, { method: 'HEAD' });
          if (jpgRes.ok) imageUrl = coverJpgUrl;
        }
      } catch (e) {
        // ignore fetch errors
      }

      // Check if project exists
      const existingProject = await prisma.project.findUnique({
        where: { githubId }
      });

      if (existingProject) {
        // Update existing (don't overwrite imageUrl if already set in DB, maybe?)
        // Let's only update image if DB is empty to respect manual overrides
        await prisma.project.update({
          where: { githubId },
          data: {
            title,
            description,
            link,
            language,
            stars,
            techStack: existingProject.techStack ? existingProject.techStack : techStack,
            imageUrl: existingProject.imageUrl ? existingProject.imageUrl : imageUrl,
          }
        });
      } else {
        // Insert new
        await prisma.project.create({
          data: {
            githubId,
            title,
            description,
            link,
            language,
            stars,
            techStack,
            imageUrl,
            isFeatured: i < 3, // Auto feature top 3 stars initially
            order: syncedCount,
          }
        });
      }
      syncedCount++;
    }

    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true, count: syncedCount };
  } catch (error) {
    console.error("Sync Error:", error);
    return { success: false, error: "Failed to sync GitHub projects" };
  }
}
