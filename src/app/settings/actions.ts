"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings(): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany();
  const result: Record<string, string> = {};
  for (const s of settings) {
    result[s.key] = s.value ?? "";
  }
  return result;
}

export async function updateSettings(data: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(data)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    revalidatePath("/settings");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: "Failed to save settings" };
  }
}
