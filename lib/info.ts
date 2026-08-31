import fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "counselling-info.json");

export type CounsellingInfo = {
  date: string;
  time: string;
  announcement: string;
  documents: string;
  guidelines: string;
};

const defaultInfo: CounsellingInfo = {
  date: "",
  time: "",
  announcement: "No announcements available.",
  documents: "No document information available.",
  guidelines: "No guidelines available.",
};

export async function getCounsellingInfo(): Promise<CounsellingInfo> {
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return defaultInfo;
  }
}

export async function setCounsellingInfo(info: CounsellingInfo) {
  await fs.writeFile(dataFilePath, JSON.stringify(info, null, 2), "utf8");
}
