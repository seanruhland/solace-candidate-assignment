import db from "../../../db";
import { advocates } from "../../../db/schema";
import { ilike, or, sql, count } from "drizzle-orm";

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface SearchParams {
  searchTerm?: string;
  pagination: PaginationParams;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdvocatesResponse {
  data: any[];
  pagination: PaginationResponse;
}

export async function getAdvocates({ searchTerm, pagination }: SearchParams): Promise<AdvocatesResponse> {
  const { page, limit, sortBy, sortOrder } = pagination;

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

  try {
    let data: any[] = [];
    let total = 0;

    if (searchTerm?.trim()) {
      // Build search condition
      const searchCondition = or(
        ilike(advocates.firstName, `%${searchTerm.trim()}%`),
        ilike(advocates.lastName, `%${searchTerm.trim()}%`),
        ilike(advocates.city, `%${searchTerm.trim()}%`),
        ilike(advocates.degree, `%${searchTerm.trim()}%`),
        // Search in specialties array (JSONB)
        sql`${advocates.specialties}::text ILIKE ${`%${searchTerm.trim()}%`}`,
        // Search in years of experience (convert to string for partial matching)
        sql`CAST(${advocates.yearsOfExperience} AS TEXT) ILIKE ${`%${searchTerm.trim()}%`}`
      );

      // Execute both count and data queries in parallel for better performance
      const [countResult, dataResult] = await Promise.all([
        db.select({ count: count() }).from(advocates).where(searchCondition),
        db.select().from(advocates).where(searchCondition).orderBy(orderBy).limit(validLimit).offset(offset)
      ]);

      total = countResult[0]?.count || 0;
      data = dataResult;
    } else {
      // For non-search queries, we can optimize by using a single query with window function
      // This avoids the separate count query for better performance
      const result = await db.select({
        id: advocates.id,
        firstName: advocates.firstName,
        lastName: advocates.lastName,
        city: advocates.city,
        degree: advocates.degree,
        specialties: advocates.specialties,
        yearsOfExperience: advocates.yearsOfExperience,
        phoneNumber: advocates.phoneNumber,
        createdAt: advocates.createdAt,
        total: sql<number>`count(*) over()`
      }).from(advocates).orderBy(orderBy).limit(validLimit).offset(offset);

      if (result.length > 0) {
        total = result[0].total || 0;
        // Remove the total field from the data
        data = result.map(({ total, ...rest }) => rest);
      } else {
        data = [];
        total = 0;
      }
    }

    return {
      data,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit)
      }
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Failed to fetch advocates from database');
  }
}