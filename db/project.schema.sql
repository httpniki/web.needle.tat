CREATE TABLE IF NOT EXISTS projects (
   id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   customer_id BIGINT NOT NULL,
   observations TEXT,
   images TEXT[] default '{}',
   "references" TEXT[] default '{}',
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   project_name VARCHAR(150) NOT NULL DEFAULT '',
   body_part VARCHAR(100) NOT NULL DEFAULT '',

   CONSTRAINT fk_project_customer
      FOREIGN KEY (customer_id)
      REFERENCES customers (id)
      ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_customers_id ON projects(customer_id);
