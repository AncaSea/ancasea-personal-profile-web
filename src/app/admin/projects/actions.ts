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

export async function updateProjectImage(id: string, imageUrl: string) {
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