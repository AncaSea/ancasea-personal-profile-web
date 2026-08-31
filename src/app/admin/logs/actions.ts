"use server";

import { prisma } from "@/utils/prisma";

export async function logSystemEvent(level: 'INFO' | 'WARNING' | 'ERROR', message: string, context?: any) {
  try {
    await prisma.systemLog.create({
      data: {
        level,
        message,
        context: context ? JSON.stringify(context) : null,
      }
    });
  } catch (error) {
    console.error("Failed to write system log:", error);
  }
}