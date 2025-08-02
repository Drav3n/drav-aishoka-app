-- Polish Tracker Database Schema
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    provider VARCHAR(50) NOT NULL, -- 'google', 'github', 'dev'
    provider_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Brands table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    website_url TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Polish collections table
CREATE TABLE polishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255) NOT NULL,
    color_hex VARCHAR(7), -- #RRGGBB format
    finish_type VARCHAR(50) NOT NULL, -- cream, shimmer, glitter, matte, magnetic, thermal
    collection_name VARCHAR(255),
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    purchase_location VARCHAR(255),
    bottle_image_url TEXT,
    swatch_image_url TEXT,
    nail_art_images TEXT[], -- Array of image URLs
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_favorite BOOLEAN DEFAULT FALSE,
    custom_tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}', -- Flexible storage for additional properties
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking table
CREATE TABLE polish_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    polish_id UUID NOT NULL REFERENCES polishes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    occasion VARCHAR(255),
    notes TEXT,
    nail_art_image_url TEXT
);

-- Custom collections table (for user-defined groupings)
CREATE TABLE custom_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Theme color for the collection
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for polishes in custom collections
CREATE TABLE collection_polishes (
    collection_id UUID NOT NULL REFERENCES custom_collections(id) ON DELETE CASCADE,
    polish_id UUID NOT NULL REFERENCES polishes(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, polish_id)
);

-- Wishlist table
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_name VARCHAR(255),
    polish_name VARCHAR(255),
    color_hex VARCHAR(7),
    estimated_price DECIMAL(10,2),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_polishes_user_id ON polishes(user_id);
CREATE INDEX idx_polishes_brand_id ON polishes(brand_id);
CREATE INDEX idx_polishes_color_hex ON polishes(color_hex);
CREATE INDEX idx_polishes_finish_type ON polishes(finish_type);
CREATE INDEX idx_polishes_created_at ON polishes(created_at);
CREATE INDEX idx_polish_usage_polish_id ON polish_usage(polish_id);
CREATE INDEX idx_polish_usage_user_id ON polish_usage(user_id);
CREATE INDEX idx_polish_usage_used_at ON polish_usage(used_at);
CREATE INDEX idx_custom_collections_user_id ON custom_collections(user_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);

-- Full-text search indexes
CREATE INDEX idx_polishes_search ON polishes USING gin(to_tsvector('english', name || ' ' || COALESCE(collection_name, '') || ' ' || COALESCE(notes, '')));
CREATE INDEX idx_brands_search ON brands USING gin(to_tsvector('english', name));

-- Insert some default brands
INSERT INTO brands (name, website_url) VALUES
    ('OPI', 'https://www.opi.com'),
    ('Essie', 'https://www.essie.com'),
    ('Sally Hansen', 'https://www.sallyhansen.com'),
    ('China Glaze', 'https://www.chinaglaze.com'),
    ('Zoya', 'https://www.zoya.com'),
    ('Orly', 'https://orlybeauty.com'),
    ('Butter London', 'https://www.butterlondon.com'),
    ('Deborah Lippmann', 'https://www.deborahlippmann.com'),
    ('ILNP', 'https://www.ilnp.com'),
    ('Holo Taco', 'https://www.holotaco.com');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_polishes_updated_at BEFORE UPDATE ON polishes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();