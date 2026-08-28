export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function parsePaginationQuery(query: any) {
  const q = query || {};
  const page = Math.max(1, parseInt(q.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(q.limit || '10', 10)));
  const skip = (page - 1) * limit;
  
  return {
    page,
    limit,
    skip,
    take: limit,
    sortBy: q.sortBy || 'createdAt',
    sortOrder: (q.sortOrder === 'asc' || q.sortOrder === 'desc') ? q.sortOrder : 'desc',
  };
}
