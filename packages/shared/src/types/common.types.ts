export interface PaginatedResponse<T> { data: T[]; total: number; page: number; limit: number; totalPages: number; }
export interface ApiResponse<T> { success: boolean; data?: T; error?: { code: string; message: string; details?: unknown }; }
export interface PaginationQuery { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; }
