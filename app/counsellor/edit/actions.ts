"use server";

import { setCounsellingInfo, CounsellingInfo } from "@/lib/info";
import { revalidatePath } from "next/cache";

export async function saveCounsellingInfo(info: CounsellingInfo) {
  await setCounsellingInfo(info);
  revalidatePath("/counsellor/info");
  revalidatePath("/counsellor/edit");
}
