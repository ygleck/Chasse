/**
 * POST /api/prix-essence/refresh
 * Rafraîchir le cache des stations (endpoint sécurisé)
 */

import { NextRequest, NextResponse } from "next/server";
import { cacheStations } from "@/lib/prix-essence/lib/cache/kvCache";
import { fetchLatestXLSX } from "@/lib/prix-essence/lib/data/xlsxFetcher";
import { parseXLSXData } from "@/lib/prix-essence/lib/data/xlsxParser";

export async function POST(request: NextRequest) {
  try {
    // Vérification du secret (si configuré)
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.PRIX_ESSENCE_REFRESH_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Télécharger le dernier XLSX
    const xlsxBuffer = await fetchLatestXLSX();

    // Parser les données
    const stations = await parseXLSXData(xlsxBuffer);

    // Mettre en cache
    await cacheStations(stations);

    return NextResponse.json({
      success: true,
      stationsCount: stations.length,
      message: `${stations.length} stations mises en cache`
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Erreur lors du rafraîchissement du cache" },
      { status: 500 }
    );
  }
}
