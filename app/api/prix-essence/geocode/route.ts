/**
 * POST /api/prix-essence/geocode
 * Convertir une adresse en coordonnées GPS
 */

import { NextRequest, NextResponse } from "next/server";
import { NominatimProvider } from "@/lib/prix-essence/geo/geocoder";

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Adresse requise" },
        { status: 400 }
      );
    }

    const geocoder = new NominatimProvider();
    const result = await geocoder.geocode(address);

    if (!result) {
      return NextResponse.json(
        { error: "Adresse non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Erreur lors du géocodage" },
      { status: 500 }
    );
  }
}
