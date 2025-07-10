-- Add indexes for searchable fields
CREATE INDEX IF NOT EXISTS advocates_first_name_idx ON advocates(first_name);
CREATE INDEX IF NOT EXISTS advocates_last_name_idx ON advocates(last_name);
CREATE INDEX IF NOT EXISTS advocates_city_idx ON advocates(city);
CREATE INDEX IF NOT EXISTS advocates_degree_idx ON advocates(degree);
CREATE INDEX IF NOT EXISTS advocates_experience_idx ON advocates(years_of_experience);

-- Add composite index for better search performance
CREATE INDEX IF NOT EXISTS advocates_search_idx ON advocates(first_name, last_name, city, degree);

-- Add GIN index for JSONB specialties field for better search performance
CREATE INDEX IF NOT EXISTS advocates_specialties_gin_idx ON advocates USING GIN(specialties);