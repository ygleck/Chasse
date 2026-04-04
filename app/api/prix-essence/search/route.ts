/**
 * POST /api/prix-essence/search
 * Recherche des stations à proximité avec scoring intelligent
 */

import { NextRequest, NextResponse } from "next/server";
import { scoreStations, calculateAveragePrice } from "@/lib/prix-essence/scoring/scoringEngine";
import { addDistanceToStations } from "@/lib/prix-essence/geo/distance";
import { getCachedStations } from "@/lib/prix-essence/cache/kvCache";
import { AUTO_EXPAND_RADII } from "@/lib/prix-essence/config";
import type { GasStation } from "@/lib/prix-essence/types";

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, radius, fuelType } = await request.json();

    // Validation
    if (!latitude || !longitude || !radius) {
      return NextResponse.json(
        { error: "Paramètres requis manquants" },
        { status: 400 }
      );
    }

    // Récupérer les stations en cache
    let stations = await getCachedStations();
    if (!stations || stations.length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée de station disponible" },
        { status: 503 }
      );
    }

    // Ajouter les distances
    stations = addDistanceToStations(stations, latitude, longitude);

    // Filtrer les stations avec distance valide
    const stationsWithDistance = stations.filter(s => s.distance !== undefined) as Array<GasStation & { distance: number }>;

    // Scorer et filtrer
    const allResults = scoreStations(stationsWithDistance, fuelType);
    const filteredResults = allResults.filter(station => station.distance !== undefined && station.distance <= radius);

    if (filteredResults.length === 0) {
      // Auto-expansion si aucun résultat
      for (const expandedRadius of AUTO_EXPAND_RADII) {
        if (expandedRadius > radius) {
          const expandedFiltered = allResults.filter(station => station.distance !== undefined && station.distance <= expandedRadius);
          if (expandedFiltered.length > 0) {
            const results = {
              bestOption: expandedFiltered[0] || null,
              topStations: expandedFiltered.slice(0, 10),
              averagePrice: calculateAveragePrice(expandedFiltered),
              expandedRadius,
              message: `Aucune station trouvée dans les ${radius} km. Affichage des stations dans les ${expandedRadius} km.`,
            };
            return NextResponse.json(results);
          }
        }
      }
    }

    const results = {
      bestOption: filteredResults[0] || null,
      topStations: filteredResults.slice(0, 10),
      averagePrice: calculateAveragePrice(filteredResults),
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
