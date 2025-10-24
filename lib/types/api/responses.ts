// API response type definitions
// This file contains standardized API response patterns

/**
 * Generic API response wrapper for all server actions
 * @template T - The type of data returned on success
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    warnings?: string[];
}

/**
 * Paginated response wrapper for list endpoints
 * @template T - The type of items in the paginated list
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}

/**
 * Validation-specific response for form submissions and data validation
 */
export interface ValidationResponse extends ApiResponse {
    violations?: ValidationViolation[];
}

/**
 * Individual validation violation details
 */
export interface ValidationViolation {
    field: string;
    message: string;
    code: string;
}

/**
 * Error response for API failures
 */
export interface ErrorResponse extends ApiResponse<never> {
    success: false;
    error: string;
    errorCode?: string;
    details?: Record<string, unknown>;
}

/**
 * Success response for API operations
 * @template T - The type of data returned
 */
export interface SuccessResponse<T> extends ApiResponse<T> {
    success: true;
    data: T;
}