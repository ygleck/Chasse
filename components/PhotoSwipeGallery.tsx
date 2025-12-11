'use client';

import { useEffect, useRef } from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

interface PhotoItem {
  src: string;
  width?: number;
  height?: number;
  title?: string;
  alt?: string;
}

interface PhotoSwipeGalleryProps {
  images: PhotoItem[];
  galleryId?: string;
  thumbnailSelector?: string;
}

export function PhotoSwipeGallery({
  images,
  galleryId = 'gallery',
  thumbnailSelector = 'a[data-pswp-index]',
}: PhotoSwipeGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || images.length === 0) return;

    const lightbox = new PhotoSwipeLightbox({
      gallery: `#${galleryId}`,
      children: thumbnailSelector,
      pswpModule: () => import('photoswipe'),
    });

    lightbox.init();

    return () => {
      lightbox.destroy();
    };
  }, [galleryId, thumbnailSelector, images.length]);

  return (
    <div ref={containerRef} id={galleryId} className="gallery">
      {/* Children will be added via DOM manipulation by PhotoSwipe */}
    </div>
  );
}

// Utility component for individual photo links
interface PhotoLinkProps {
  src: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  title?: string;
  alt?: string;
  className?: string;
  index: number;
  children?: React.ReactNode;
}

export function PhotoLink({
  src,
  thumbnail,
  width = 1200,
  height = 800,
  title,
  alt,
  className,
  index,
  children,
}: PhotoLinkProps) {
  return (
    <a
      href={src}
      data-pswp-width={width}
      data-pswp-height={height}
      data-pswp-index={index}
      target="_blank"
      rel="noreferrer"
      className={className}
      data-title={title}
    >
      {children || (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail || src}
            alt={alt || title || 'Gallery image'}
            className="w-full h-full object-cover"
          />
        </>
      )}
    </a>
  );
}
