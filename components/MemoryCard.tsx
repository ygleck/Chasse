import Image from 'next/image';
/**
 * Card component for displaying memory (souvenir)
 */
interface MemoryCardProps {
  title: string;
  image: string;
  category: string;
  uploaderName: string;
  eventDate?: string;
}

export function MemoryCard({
  title,
  image,
  category,
  uploaderName,
  eventDate,
}: MemoryCardProps) {
  return (
    <div className="trophy-card cursor-pointer">
      <div className="relative w-full h-64 overflow-hidden bg-gray-200">
        <Image
          src={image}
          alt={title}
          width={800}
          height={600}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg text-hunting-dark flex-1">{title}</h3>
          <span className="hunting-badge text-xs">{category}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">Par {uploaderName}</p>
        {eventDate && (
          <p className="text-xs text-hunting-kaki">{eventDate}</p>
        )}
      </div>
    </div>
  );
}
