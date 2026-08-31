"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function savePreferences(departmentIds: number[], roundId: number) {
  const session = await auth();
  if (!session || session.user.role !== "student") {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: parseInt(session.user.id, 10) },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Check if preferences are already locked for this round
  const existingPreferences = await prisma.preference.findMany({
    where: { studentId: student.id, roundId },
  });

  if (existingPreferences.length > 0 && existingPreferences[0].isLocked) {
    throw new Error("Preferences are locked for this round.");
  }

  // Use a transaction to delete old and create new
  await prisma.$transaction(async (tx) => {
    await tx.preference.deleteMany({
      where: { studentId: student.id, roundId },
    });

    const newPreferences = departmentIds.map((deptId, index) => ({
      studentId: student.id,
      departmentId: deptId,
      roundId,
      priority: index + 1,
      isLocked: false,
    }));

    if (newPreferences.length > 0) {
      await tx.preference.createMany({
        data: newPreferences,
      });
    }
  });

  revalidatePath("/student/choice-filling");
  return { success: true };
}

export async function lockPreferences(roundId: number) {
  const session = await auth();
  if (!session || session.user.role !== "student") {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: parseInt(session.user.id, 10) },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  await prisma.preference.updateMany({
    where: { studentId: student.id, roundId },
    data: { isLocked: true },
  });

  revalidatePath("/student/choice-filling");
  revalidatePath("/student/dashboard");
  return { success: true };
}
