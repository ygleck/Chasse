import Image from 'next/image';

interface TrophyCardProps {
  title: string;
  image: string;
  species: string;
  uploaderName: string;
  weight?: number | null;
  points?: number | null;
  region?: string | null;
}

export function TrophyCard({
  title,
  image,
  species,
  uploaderName,
  weight,
  points,
  region,
}: TrophyCardProps) {
  return (
    <div className="card-premium group cursor-pointer h-full">
      {/* Image with badge */}
      <div className="card-image relative">
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className="badge-primary text-xs">🏆 RECORD</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-heading text-lg text-hunting-dark mb-2 line-clamp-2 group-hover:text-hunting-orange transition-colors">
          {title}
        </h3>

        <p className="text-sm font-bold text-hunting-forest uppercase tracking-wider mb-4">
          {species}
        </p>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          {weight && (
            <div className="flex justify-between text-sm">
              <span className="text-hunting-slate/70">Poids:</span>
              <span className="font-semibold text-hunting-orange">{weight} kg</span>
            </div>
          )}
          {points && (
            <div className="flex justify-between text-sm">
              <span className="text-hunting-slate/70">Points:</span>
              <span className="font-semibold text-hunting-orange">{points}</span>
            </div>
          )}
          {region && (
            <div className="flex justify-between text-sm">
              <span className="text-hunting-slate/70">Région:</span>
              <span className="font-semibold text-hunting-forest">{region}</span>
            </div>
          )}
        </div>

        {/* Hunter */}
        <div className="pt-4 border-t border-hunting-gold/20">
          <p className="text-xs text-hunting-gold font-semibold">
            Par <span className="text-hunting-dark">{uploaderName}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
