import Image from 'next/image';
/**
 * Card component for displaying trophy/record
 */
interface TrophyCardProps {
  id: string;
  title: string;
  image: string;
  species: string;
  hunterName: string;
  year: number;
  weight?: number;
  points?: number;
}

export function TrophyCard({
  id: _id,
  title,
  image,
  species,
  hunterName,
  year,
  weight,
  points,
}: TrophyCardProps) {
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
        <div className="absolute top-0 left-0 bg-hunting-orange text-white px-3 py-1 m-2 rounded">
          🏆 Record
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-hunting-dark mb-1">{title}</h3>
        <p className="text-sm font-semibold text-hunting-kaki mb-3">{species}</p>
        <div className="flex flex-col gap-2 text-sm mb-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Chasseur:</span>
            <span className="font-semibold text-hunting-dark">{hunterName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Année:</span>
            <span className="font-semibold text-hunting-dark">{year}</span>
          </div>
          {weight && (
            <div className="flex justify-between">
              <span className="text-gray-600">Poids:</span>
              <span className="font-semibold text-hunting-orange">{weight} lb</span>
            </div>
          )}
          {points && (
            <div className="flex justify-between">
              <span className="text-gray-600">Points:</span>
              <span className="font-semibold text-hunting-orange">{points}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
