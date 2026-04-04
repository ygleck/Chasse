/**
 * POST /api/prix-essence/refresh
 * Rafraîchir le cache des stations (endpoint sécurisé)
 */

export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import * as XLSX from 'xlsx';
import { cacheStations } from "@/lib/prix-essence/cache/kvCache";
import { fetchLatestXLSX } from "@/lib/prix-essence/data/xlsxFetcher";
import { parseXLSXData } from "@/lib/prix-essence/data/xlsxParser";
import type { XLSXRawData, CacheMetadata } from "@/lib/prix-essence/types";

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

    // Parser le XLSX avec la bibliothèque
    const workbook = XLSX.read(xlsxBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    // Parser les données
    const stations = await parseXLSXData(rawData as XLSXRawData[]);

    // Créer les métadonnées
    const metadata: CacheMetadata = {
      xlsxUrl: 'detected-from-official-site', // TODO: récupérer l'URL réelle
      downloadedAt: new Date().toISOString(),
      parsedAt: new Date().toISOString(),
      stationCount: stations.length,
      version: '1.0'
    };

    // Mettre en cache
    await cacheStations(stations, metadata);

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
