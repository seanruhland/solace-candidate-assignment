import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function GET() {
  try {
    // Try to fetch from database
    const data = await db.select().from(advocates);

    // If database is empty, return error
    if (!data || data.length === 0) {
      return Response.json(
        {  status: 404, error: "No data available", data: [] }
      );
    }

    return Response.json({ data });
  } catch (error) {
    console.error("Database error:", error);
    // Return error response if database query fails
    return Response.json(
      { status: 500, error: "Failed to fetch data from database" },
      { }
    );
  }
}
