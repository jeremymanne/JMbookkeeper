"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function isPasswordSet(): Promise<boolean> {
  const setting = await prisma.setting.findUnique({
    where: { key: "password_hash" },
  });
  return !!setting?.value;
}

export async function setupPassword(password: string) {
  if (!password || password.length < 4) {
    return { success: false as const, error: "Password must be at least 4 characters" };
  }

  const existing = await prisma.setting.findUnique({
    where: { key: "password_hash" },
  });
  if (existing?.value) {
    return { success: false as const, error: "Password already set. Use change password instead." };
  }

  const { hash, salt } = hashPassword(password);

  await prisma.setting.upsert({
    where: { key: "password_hash" },
    update: { value: hash },
    create: { key: "password_hash", value: hash },
  });
  await prisma.setting.upsert({
    where: { key: "password_salt" },
    update: { value: salt },
    create: { key: "password_salt", value: salt },
  });

  await createSession();
  redirect("/");
}

export async function login(password: string) {
  if (!password) {
    return { success: false as const, error: "Password is required" };
  }

  const [hashSetting, saltSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "password_hash" } }),
    prisma.setting.findUnique({ where: { key: "password_salt" } }),
  ]);

  if (!hashSetting?.value || !saltSetting?.value) {
    return { success: false as const, error: "No password configured" };
  }

  const valid = verifyPassword(password, hashSetting.value, saltSetting.value);
  if (!valid) {
    return { success: false as const, error: "Invalid password" };
  }

  await createSession();
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function changePassword(currentPassword: string, newPassword: string) {
  if (!newPassword || newPassword.length < 4) {
    return { success: false as const, error: "New password must be at least 4 characters" };
  }

  const [hashSetting, saltSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "password_hash" } }),
    prisma.setting.findUnique({ where: { key: "password_salt" } }),
  ]);

  if (!hashSetting?.value || !saltSetting?.value) {
    return { success: false as const, error: "No password configured" };
  }

  const valid = verifyPassword(currentPassword, hashSetting.value, saltSetting.value);
  if (!valid) {
    return { success: false as const, error: "Current password is incorrect" };
  }

  const { hash, salt } = hashPassword(newPassword);

  await prisma.setting.upsert({
    where: { key: "password_hash" },
    update: { value: hash },
    create: { key: "password_hash", value: hash },
  });
  await prisma.setting.upsert({
    where: { key: "password_salt" },
    update: { value: salt },
    create: { key: "password_salt", value: salt },
  });

  // Re-create session with new credentials
  await createSession();
  return { success: true as const };
}
