import db from "../../../db";
import { advocates } from "../../../db/schema";
import { ilike, or, eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search')?.trim();

    let data;

    if (searchTerm) {
      // Search across multiple fields using ILIKE for case-insensitive search
      data = await db.select().from(advocates).where(
        or(
          ilike(advocates.firstName, `%${searchTerm}%`),
          ilike(advocates.lastName, `%${searchTerm}%`),
          ilike(advocates.city, `%${searchTerm}%`),
          ilike(advocates.degree, `%${searchTerm}%`),
          // Search in specialties array (JSONB)
          sql`${advocates.specialties}::text ILIKE ${`%${searchTerm}%`}`,
          // Search in years of experience (convert to string for partial matching)
          sql`CAST(${advocates.yearsOfExperience} AS TEXT) ILIKE ${`%${searchTerm}%`}`
        )
      );
    } else {
      data = await db.select().from(advocates);
    }

    if (!data || data.length === 0) {
      return Response.json(
        { status: 404, error: "No data available", data: [] }
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
