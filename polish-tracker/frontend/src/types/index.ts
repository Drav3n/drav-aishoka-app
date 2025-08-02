export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'google' | 'github' | 'dev';
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  website_url?: string;
  logo_url?: string;
  polish_count?: number;
}

export interface Polish {
  id: string;
  user_id: string;
  brand_id?: string;
  name: string;
  color_hex?: string;
  finish_type: 'cream' | 'shimmer' | 'glitter' | 'matte' | 'magnetic' | 'thermal';
  collection_name?: string;
  purchase_date?: string;
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
  created_at: string;
  updated_at: string;
  brand_name?: string;
  brand_website?: string;
  brand_logo?: string;
  last_used_at?: string;
  usage_count?: number;
}

export interface PolishUsage {
  id: string;
  polish_id: string;
  user_id: string;
  used_at: string;
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
  created_at: string;
  polish_count?: number;
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
  created_at: string;
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
  brand_distribution: { brand: string; count: number; value: number }[];
  finish_type_distribution: { finish_type: string; count: number }[];
  color_distribution: { color_family: string; count: number }[];
  usage_stats: {
    most_used: Polish[];
    least_used: Polish[];
    never_used: Polish[];
    usage_by_month: { month: string; count: number }[];
  };
  collection_growth: { month: string; count: number }[];
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

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export interface UploadedImage {
  url: string;
  thumbnail_url: string;
  type?: string;
  filename?: string;
  original_name?: string;
}

export interface ColorPalette {
  name: string;
  colors: string[];
}

export interface SearchSuggestion {
  type: 'brand' | 'polish' | 'collection' | 'tag';
  value: string;
  count?: number;
}

export interface NotificationSettings {
  usage_reminders: boolean;
  collection_milestones: boolean;
  new_features: boolean;
  email_notifications: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  default_view: 'grid' | 'list';
  items_per_page: number;
  default_sort: string;
  notifications: NotificationSettings;
}

// Form types
export interface PolishFormData {
  name: string;
  brand_id?: string;
  color_hex?: string;
  finish_type: string;
  collection_name?: string;
  purchase_date?: string;
  purchase_price?: number;
  purchase_location?: string;
  notes?: string;
  rating?: number;
  is_favorite: boolean;
  custom_tags: string[];
}

export interface CollectionFormData {
  name: string;
  description?: string;
  color?: string;
}

export interface UsageFormData {
  occasion?: string;
  notes?: string;
}

// Component prop types
export interface PolishCardProps {
  polish: Polish;
  onEdit?: (polish: Polish) => void;
  onDelete?: (polishId: string) => void;
  onUse?: (polishId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface FilterBarProps {
  filters: PolishFilters;
  onFiltersChange: (filters: PolishFilters) => void;
  brands: Brand[];
  totalCount: number;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}