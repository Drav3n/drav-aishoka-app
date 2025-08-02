import { Request } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    provider: 'google' | 'github' | 'dev';
    provider_id?: string;
    created_at: Date;
    updated_at: Date;
}
export interface Brand {
    id: string;
    name: string;
    website_url?: string;
    logo_url?: string;
    created_at: Date;
}
export interface Polish {
    id: string;
    user_id: string;
    brand_id?: string;
    name: string;
    color_hex?: string;
    finish_type: 'cream' | 'shimmer' | 'glitter' | 'matte' | 'magnetic' | 'thermal';
    collection_name?: string;
    purchase_date?: Date;
    purchase_price?: number;
    purchase_location?: string;
    bottle_image_url?: string;
    swatch_image_url?: string;
    nail_art_images?: string[];
    notes?: string;
    rating?: number;
    is_favorite: boolean;
    custom_tags: string[];
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    brand?: Brand;
}
export interface PolishUsage {
    id: string;
    polish_id: string;
    user_id: string;
    used_at: Date;
    occasion?: string;
    notes?: string;
    nail_art_image_url?: string;
}
export interface CustomCollection {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    color?: string;
    created_at: Date;
    polishes?: Polish[];
}
export interface WishlistItem {
    id: string;
    user_id: string;
    brand_name?: string;
    polish_name?: string;
    color_hex?: string;
    estimated_price?: number;
    priority: number;
    notes?: string;
    image_url?: string;
    created_at: Date;
}
export interface PolishFilters {
    brand_id?: string;
    finish_type?: string;
    color_family?: string;
    price_min?: number;
    price_max?: number;
    is_favorite?: boolean;
    has_rating?: boolean;
    rating_min?: number;
    custom_tags?: string[];
    search?: string;
    sort_by?: 'name' | 'brand' | 'purchase_date' | 'created_at' | 'last_used';
    sort_order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
export interface AnalyticsData {
    total_polishes: number;
    total_value: number;
    average_price: number;
    brand_distribution: {
        brand: string;
        count: number;
        value: number;
    }[];
    finish_type_distribution: {
        finish_type: string;
        count: number;
    }[];
    color_distribution: {
        color_family: string;
        count: number;
    }[];
    usage_stats: {
        most_used: Polish[];
        least_used: Polish[];
        never_used: Polish[];
        usage_by_month: {
            month: string;
            count: number;
        }[];
    };
    collection_growth: {
        month: string;
        count: number;
    }[];
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
export interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export interface AuthRequest extends Request {
    user?: User;
}
//# sourceMappingURL=index.d.ts.map