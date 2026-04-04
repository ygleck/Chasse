/**
 * POST /api/prix-essence/search
 * Recherche des stations à proximité avec scoring intelligent
 */

import { NextRequest, NextResponse } from "next/server";
import { scoreStations } from "@/lib/prix-essence/scoring/scoringEngine";
import { calculateDistance, filterByRadius, addDistanceToStations } from "@/lib/prix-essence/geo/distance";
import { getCachedStations } from "@/lib/prix-essence/cache/kvCache";
import { AUTO_EXPAND_RADII } from "@/lib/prix-essence/config";

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

    // Scorer et filtrer
    const results = scoreStations(stations, fuelType, radius);

    if (results.topStations.length === 0) {
      // Auto-expansion si aucun résultat
      for (const expandedRadius of AUTO_EXPAND_RADII) {
        if (expandedRadius > radius) {
          const expandedResults = scoreStations(stations, fuelType, expandedRadius);
          if (expandedResults.topStations.length > 0) {
            expandedResults.expandedRadius = expandedRadius;
            expandedResults.message = `Aucune station trouvée dans les ${radius} km. Affichage des stations dans les ${expandedRadius} km.`;
            return NextResponse.json(expandedResults);
          }
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
