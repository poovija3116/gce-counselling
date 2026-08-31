"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

export async function addStudentAndGenerateRank(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const dob = formData.get("dob") as string;
  const applicationNumber = formData.get("applicationNumber") as string;
  const cutoff = parseFloat(formData.get("cutoff") as string);
  const community = formData.get("community") as string;

  if (!name || !email || !dob || !applicationNumber || isNaN(cutoff) || !community) {
    return { success: false, message: "Please fill all details correctly." };
  }

  try {
    // Generate password: DDMMYYYY from YYYY-MM-DD
    const dateParts = dob.split("-");
    const dobForPassword = dateParts.length === 3 ? `${dateParts[2]}${dateParts[1]}${dateParts[0]}` : "12345678";
    const cleanName = name.replace(/\s+/g, "");
    const temporaryPassword = `${cleanName}@${dobForPassword}`;
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "student",
        },
      });

      // Create student
      const student = await tx.student.create({
        data: {
          userId: user.id,
          dateOfBirth: new Date(dob),
          cutoffMark: cutoff,
          community,
        },
      });

      // Create application
      await tx.application.create({
        data: {
          studentId: student.id,
          applicationNumber,
          status: "pending",
        },
      });

      // Recalculate ranks for all students based on cutoff
      const allStudents = await tx.student.findMany({
        orderBy: [
          { cutoffMark: 'desc' },
          { user: { name: 'asc' } }
        ],
        include: { user: true }
      });

      for (let i = 0; i < allStudents.length; i++) {
        await tx.student.update({
          where: { id: allStudents[i].id },
          data: { rankNumber: i + 1 },
        });
      }
    });

    revalidatePath("/admin/rank");
    return { 
      success: true, 
      message: "Student added and ranks regenerated.",
      credentials: {
        username: email,
        password: temporaryPassword
      }
    };
  } catch (error: any) {
    console.error("Add student error:", error);
    return { success: false, message: "Error adding student. May be duplicate email or application number." };
  }
}

export async function deleteAllData() {
  try {
    await prisma.student.deleteMany();
    await prisma.user.deleteMany({ where: { role: "student" } });
    revalidatePath("/admin/rank");
    return { success: true, message: "All student data deleted." };
  } catch (error) {
    return { success: false, message: "Error deleting data." };
  }
}
