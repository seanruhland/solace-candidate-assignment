import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function GET() {
  try {
    // Try to fetch from database
    const data = await db.select().from(advocates);

    // If database is empty, use seed data as fallback
    if (!data || data.length === 0) {
      return Response.json({ data: advocateData });
    }

    return Response.json({ data });
  } catch (error) {
    console.error("Database error:", error);
    // Fallback to seed data if database query fails
    return Response.json({ data: advocateData });
  }
}
