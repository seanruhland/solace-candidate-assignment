import db from "../../../db";
import { advocates } from "../../../db/schema";
import { ilike, or, eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search')?.trim();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'firstName';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit)); // Max 100 items per page
    const offset = (validPage - 1) * validLimit;

    // Validate sort parameters
    const validSortFields = ['firstName', 'lastName', 'city', 'degree', 'yearsOfExperience', 'createdAt'];
    const validSortBy = validSortFields.includes(sortBy) ? sortBy : 'firstName';
    const validSortOrder = sortOrder === 'desc' ? 'desc' : 'asc';

    // Build sort object
    const sortField = advocates[validSortBy as keyof typeof advocates];
    const orderBy = validSortOrder === 'desc' ? sql`${sortField} DESC` : sql`${sortField} ASC`;

    // Get total count for pagination
    const totalCount = await db.select({ count: sql<number>`count(*)` }).from(advocates);
    const total = totalCount[0]?.count || 0;

    // Build and execute query with search, sorting, and pagination
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
      ).orderBy(orderBy).limit(validLimit).offset(offset);
    } else {
      data = await db.select().from(advocates).orderBy(orderBy).limit(validLimit).offset(offset);
    }

    if (!data || data.length === 0) {
      return Response.json({
        status: 404,
        error: "No data available",
        data: [],
        pagination: {
          page: validPage,
          limit: validLimit,
          total: total,
          totalPages: Math.ceil(total / validLimit)
        }
      });
    }

    return Response.json({
      data,
      pagination: {
        page: validPage,
        limit: validLimit,
        total: total,
        totalPages: Math.ceil(total / validLimit)
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { status: 500, error: "Failed to fetch data from database", data: [] },
    );
  }
}
