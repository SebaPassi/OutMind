-- Migration: Create aruco_mappings table
-- This table maps ArUco marker IDs to user profiles
-- Execute this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS aruco_mappings (
  id SERIAL PRIMARY KEY,
  aruco_id INTEGER UNIQUE NOT NULL,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups by aruco_id
CREATE INDEX IF NOT EXISTS idx_aruco_mappings_aruco_id ON aruco_mappings(aruco_id);

-- Create index for faster lookups by profile_id
CREATE INDEX IF NOT EXISTS idx_aruco_mappings_profile_id ON aruco_mappings(profile_id);

-- Add comment to table
COMMENT ON TABLE aruco_mappings IS 'Maps ArUco marker IDs (100, 200, 300, etc.) to user profiles for face recognition replacement';

