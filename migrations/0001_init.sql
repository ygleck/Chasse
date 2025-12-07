-- Create UserUpload table
CREATE TABLE IF NOT EXISTS UserUpload (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  uploaderName TEXT NOT NULL,
  uploaderEmail TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  species TEXT,
  huntDate INTEGER,
  region TEXT,
  weight REAL,
  weightUnit TEXT DEFAULT 'lb',
  points INTEGER,
  weaponType TEXT,
  caliber TEXT,
  eventDate INTEGER,
  category TEXT,
  participants TEXT,
  rejectionReason TEXT
);

-- Create Photo table
CREATE TABLE IF NOT EXISTS Photo (
  id TEXT PRIMARY KEY,
  uploadId TEXT NOT NULL,
  path TEXT NOT NULL,
  thumbnailPath TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (uploadId) REFERENCES UserUpload(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_upload_status ON UserUpload(status);
CREATE INDEX IF NOT EXISTS idx_upload_type ON UserUpload(type);
CREATE INDEX IF NOT EXISTS idx_photo_uploadId ON Photo(uploadId);
