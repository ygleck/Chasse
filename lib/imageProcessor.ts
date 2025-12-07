import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Traitement des images avec sharp
 * - Conversion en WebP
 * - Génération de vignette
 * - Suppression des métadonnées EXIF
 * 
 * NOTE: Si vous avez des problèmes avec sharp sur votre plateforme de déploiement:
 * - Vercel: supprimer sharp et utiliser une API externe (imgix, Cloudinary, etc.)
 * - Self-hosted: installer libvips (dépendance système)
 * - TODO: Ajouter fallback vers service externe si sharp échoue
 */

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';
const THUMBNAIL_SIZE = 300;

export async function processImage(
  file: Buffer,
  fileName: string
): Promise<{
  webpPath: string;
  thumbnailPath: string;
}> {
  try {
    // Create upload directory if needed
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // Remove extension and create new name
    const nameWithoutExt = path.parse(fileName).name;
    const timestamp = Date.now();
    const webpFileName = `${nameWithoutExt}-${timestamp}.webp`;
    const thumbnailFileName = `${nameWithoutExt}-${timestamp}-thumb.webp`;

    const webpPath = path.join(UPLOAD_DIR, webpFileName);
    const thumbnailPath = path.join(UPLOAD_DIR, thumbnailFileName);

    // Process with sharp: convert to WebP and remove EXIF
    const image = sharp(file).withMetadata(false);

    // Write main image (WebP format, removes EXIF automatically)
    await image
      .clone()
      .webp({ quality: 80 })
      .toFile(webpPath);

    // Write thumbnail
    await image
      .clone()
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 75 })
      .toFile(thumbnailPath);

    // Return relative paths for storage in DB
    return {
      webpPath: `/uploads/${webpFileName}`,
      thumbnailPath: `/uploads/${thumbnailFileName}`,
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Erreur lors du traitement de l\'image');
  }
}

/**
 * Nettoyage des fichiers d'image
 */
export async function deleteImage(imagePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}
