import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET() {
  try {
    const data = await db.select().from(advocates);

    if (!data || data.length === 0) {
      return Response.json(
        {  status: 404, error: "No data available", data: [] }
      );
    }

    return Response.json({ data });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { status: 500, error: "Failed to fetch data from database", data: [] },
    );
  }
}
