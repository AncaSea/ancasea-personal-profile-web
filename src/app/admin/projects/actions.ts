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
