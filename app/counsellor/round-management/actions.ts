"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRound(data: { roundNumber: number; minRank: number; maxRank: number }) {
  await prisma.counsellingRound.create({
    data: {
      roundNumber: data.roundNumber,
      minRank: data.minRank,
      maxRank: data.maxRank,
      status: "not_started",
    },
  });
  revalidatePath("/counsellor/round-management");
  revalidatePath("/counsellor/dashboard");
}

export async function updateRound(id: number, data: { minRank: number; maxRank: number }) {
  await prisma.counsellingRound.update({
    where: { id },
    data: {
      minRank: data.minRank,
      maxRank: data.maxRank,
    },
  });
  revalidatePath("/counsellor/round-management");
  revalidatePath("/counsellor/dashboard");
}

export async function setRoundStatus(id: number, status: string) {
  await prisma.counsellingRound.update({
    where: { id },
    data: { status },
  });
  
  // If we complete a round, we might want to also lock all preferences for this round, etc.
  if (status === "completed") {
    await prisma.preference.updateMany({
      where: { roundId: id },
      data: { isLocked: true },
    });
  }
  
  revalidatePath("/counsellor/round-management");
  revalidatePath("/counsellor/dashboard");
}

export async function deleteRound(id: number) {
  await prisma.counsellingRound.delete({
    where: { id },
  });
  revalidatePath("/counsellor/round-management");
  revalidatePath("/counsellor/dashboard");
}
