/**
 * Common types used across the application
 */

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  order: SortOrder;
}

/**
 * Filter parameters
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * Query parameters for data fetching
 */
export interface QueryParams extends PaginationParams {
  sort?: SortParams;
  filters?: FilterParams;
  search?: string;
}

/**
 * Status types
 */
export type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Async state
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  status: Status;
}

/**
 * Form field validation
 */
export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

/**
 * Form field state
 */
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * Form state
 */
export interface FormState<T extends Record<string, any>> {
  fields: {
    [K in keyof T]: FormField<T[K]>;
  };
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

/**
 * Date range
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Time period
 */
export type TimePeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

/**
 * Currency amount
 */
export interface CurrencyAmount {
  amount: number;
  currency: string;
  formatted?: string;
}

/**
 * Percentage
 */
export interface Percentage {
  value: number;
  formatted?: string;
  isPositive?: boolean;
}

/**
 * ID type
 */
export type ID = string;

/**
 * Timestamp
 */
export interface Timestamped {
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Soft deletable
 */
export interface SoftDeletable extends Timestamped {
  deletedAt?: Date | string;
}

/**
 * With ID
 */
export interface WithId {
  id: ID;
}

/**
 * Base entity
 */
export interface BaseEntity extends WithId, Timestamped {}

/**
 * Base soft deletable entity
 */
export interface BaseSoftDeletableEntity extends BaseEntity, SoftDeletable {}

