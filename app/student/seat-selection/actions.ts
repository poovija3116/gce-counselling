"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function selectSeat(departmentId: number) {
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

  const currentRound = await prisma.counsellingRound.findFirst({
    where: { status: { not: "completed" } },
    orderBy: { roundNumber: "asc" },
  });

  if (!currentRound) {
    throw new Error("No active counselling round.");
  }

  const existingAllotment = await prisma.allotment.findFirst({
    where: { studentId: student.id, roundId: currentRound.id },
  });

  if (existingAllotment) {
    throw new Error("You already have an allotment for this round.");
  }

  await prisma.$transaction(async (tx) => {
    const department = await tx.department.findUnique({
      where: { id: departmentId },
    });

    if (!department || department.availableSeats <= 0) {
      throw new Error("No seats available in this department.");
    }

    await tx.department.update({
      where: { id: departmentId },
      data: { availableSeats: { decrement: 1 } },
    });

    await tx.allotment.create({
      data: {
        studentId: student.id,
        departmentId: departmentId,
        roundId: currentRound.id,
        seatNumber: `${department.code}-${1000 + department.totalSeats - department.availableSeats + 1}`,
        status: "allotted",
        studentDecision: "pending",
      },
    });
  });

  revalidatePath("/student/seat-selection");
  revalidatePath("/student/dashboard");
  return { success: true };
}
