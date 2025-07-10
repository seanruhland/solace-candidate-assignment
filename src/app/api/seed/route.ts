import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function POST() {
  try {
    const records = await db.insert(advocates).values(advocateData).returning();
    return Response.json({ advocates: records });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { status: 500, error: "Failed to seed database" },
    );
  }
}
