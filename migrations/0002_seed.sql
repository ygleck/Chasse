-- Seed data for D1 database

-- Insert sample souvenirs
INSERT INTO UserUpload (
  id, type, status, title, description, uploaderName, uploaderEmail,
  category, eventDate, participants, createdAt, updatedAt
) VALUES
  ('seed-souvenir-1', 'souvenir', 'approved', 'Ouverture Camp 2024', 'Belle journée d''ouverture avec toute l''équipe', 'Jean Chasseur', 'jean@example.com',
   'Camp', 1696118400000, 'Jean, Marc, Paul', 1696118400000, 1696118400000),
  ('seed-souvenir-2', 'souvenir', 'approved', 'Trail Cam - Gros buck', 'Magnifique 10 pointes capté sur trail cam', 'Marc Trappeur', 'marc@example.com',
   'Trail cam', 1698796800000, 'Marc', 1698796800000, 1698796800000);

-- Insert sample records
INSERT INTO UserUpload (
  id, type, status, title, description, uploaderName, uploaderEmail,
  species, huntDate, region, weight, weightUnit, points, weaponType, caliber,
  createdAt, updatedAt
) VALUES
  ('seed-record-1', 'record', 'approved', 'Mon premier orignal', 'Beau mâle pris à 200 yards', 'Paul Chasseur', 'paul@example.com',
   'Orignal', 1699401600000, 'Côte-Nord', 450.0, 'lb', 8, 'Carabine', '.308',
   1699401600000, 1699401600000),
  ('seed-record-2', 'record', 'approved', 'Chevreuil record du camp', 'Plus gros chevreuil depuis 10 ans', 'Luc Archer', 'luc@example.com',
   'Chevreuil', 1700611200000, 'Estrie', 185.0, 'lb', 12, 'Arc', 'Compound 70lb',
   1700611200000, 1700611200000);

-- Insert placeholder photos (you'll need to upload actual images to R2)
INSERT INTO Photo (id, uploadId, path, thumbnailPath, createdAt) VALUES
  ('photo-1', 'seed-souvenir-1', 'images/placeholder-1.webp', 'images/placeholder-1_thumb.webp', 1696118400000),
  ('photo-2', 'seed-souvenir-2', 'images/placeholder-2.webp', 'images/placeholder-2_thumb.webp', 1698796800000),
  ('photo-3', 'seed-record-1', 'images/placeholder-3.webp', 'images/placeholder-3_thumb.webp', 1699401600000),
  ('photo-4', 'seed-record-2', 'images/placeholder-4.webp', 'images/placeholder-4_thumb.webp', 1700611200000);
