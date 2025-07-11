import { getAdvocates } from "./api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search')?.trim();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'firstName';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

    const result = await getAdvocates({
      searchTerm,
      pagination: { page, limit, sortBy, sortOrder }
    });

    if (!result.data || result.data.length === 0) {
      return Response.json({
        status: 404,
        error: "No data available",
        data: [],
        pagination: result.pagination
      });
    }

    return Response.json({
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { status: 500, error: "Failed to fetch data from database", data: [] },
    );
  }
}
