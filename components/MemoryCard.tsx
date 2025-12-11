import Image from 'next/image';

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
    <div className="card-premium group cursor-pointer h-full">
      {/* Image */}
      <div className="card-image relative">
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <span className="badge-primary text-xs">{category}</span>
        </div>

        <h3 className="font-heading text-lg text-hunting-dark mb-2 line-clamp-2 group-hover:text-hunting-orange transition-colors">
          {title}
        </h3>

        <div className="space-y-2">
          <p className="text-sm text-hunting-slate/70">
            Par <span className="font-semibold text-hunting-gold">{uploaderName}</span>
          </p>
          {eventDate && (
            <p className="text-xs text-hunting-gold/70">
              {eventDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
