import db from "../../../db";
import { advocates } from "../../../db/schema";
import { ilike, or, sql } from "drizzle-orm";

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

  // Get total count for pagination
  const totalCount = await db.select({ count: sql<number>`count(*)` }).from(advocates);
  const total = totalCount[0]?.count || 0;

  // Build and execute query with search, sorting, and pagination
  let data;
  if (searchTerm?.trim()) {
    // Search across multiple fields using ILIKE for case-insensitive search
    data = await db.select().from(advocates).where(
      or(
        ilike(advocates.firstName, `%${searchTerm.trim()}%`),
        ilike(advocates.lastName, `%${searchTerm.trim()}%`),
        ilike(advocates.city, `%${searchTerm.trim()}%`),
        ilike(advocates.degree, `%${searchTerm.trim()}%`),
        // Search in specialties array (JSONB)
        sql`${advocates.specialties}::text ILIKE ${`%${searchTerm.trim()}%`}`,
        // Search in years of experience (convert to string for partial matching)
        sql`CAST(${advocates.yearsOfExperience} AS TEXT) ILIKE ${`%${searchTerm.trim()}%`}`
      )
    ).orderBy(orderBy).limit(validLimit).offset(offset);
  } else {
    data = await db.select().from(advocates).orderBy(orderBy).limit(validLimit).offset(offset);
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
}