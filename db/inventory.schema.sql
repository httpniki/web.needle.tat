CREATE TABLE IF NOT EXISTS attributes (
   attribute_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
   product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   name VARCHAR(100) NOT NULL,
   stock INTEGER NOT NULL DEFAULT 0,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   product_type_id BIGINT NOT NULL,

   CONSTRAINT chk_product_name_not_empty CHECK (length(trim(name)) > 0),
   CONSTRAINT chk_stock_quantity_positive CHECK (stock >= 0)
);

CREATE TABLE IF NOT EXISTS product_type (
   product_type_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   value VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS product_attributes (
    product_id BIGINT NOT NULL,
    attribute_id BIGINT NOT NULL,
    value TEXT NOT NULL,

    PRIMARY KEY (product_id, attribute_id),
    
    CONSTRAINT fk_pa_product 
        FOREIGN KEY (product_id) 
        REFERENCES products (product_id) 
        ON DELETE CASCADE,

    CONSTRAINT fk_pa_attribute 
        FOREIGN KEY (attribute_id) 
        REFERENCES attributes (attribute_id) 
        ON DELETE CASCADE
);
