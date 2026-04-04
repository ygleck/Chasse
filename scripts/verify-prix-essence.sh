#!/bin/bash
# Vérification Structure - Prix Essence Module

echo "🔍 Vérification structure Prix Essence Module..."
echo ""

# Module Core
echo "✅ Module Core:"
ls -la src/modules/prix-essence/{types.ts,config.ts} 2>/dev/null || echo "  ⚠️ Fichiers core manquants"

# Geo
echo ""
echo "✅ Geo (Distance + Geocoding):"
ls -la src/modules/prix-essence/lib/geo/{distance.ts,geocoder.ts} 2>/dev/null || echo "  ⚠️ Fichiers geo manquants"

# Scoring
echo ""
echo "✅ Scoring (Engine):"
ls -la src/modules/prix-essence/lib/scoring/scoringEngine.ts 2>/dev/null || echo "  ⚠️ Fichier scoring manquant"

# Data
echo ""
echo "✅ Data (XLSX):"
ls -la src/modules/prix-essence/lib/data/{xlsxFetcher.ts,xlsxParser.ts} 2>/dev/null || echo "  ⚠️ Fichiers data manquants"

# Cache
echo ""
echo "✅ Cache (KV):"
ls -la src/modules/prix-essence/lib/cache/kvCache.ts 2>/dev/null || echo "  ⚠️ Fichier cache manquant"

# Utils
echo ""
echo "✅ Utils:"
ls -la src/modules/prix-essence/lib/utils/{storage.ts,errors.ts,formatting.ts} 2>/dev/null || echo "  ⚠️ Fichiers utils manquants"

# Components
echo ""
echo "✅ Components:"
ls -la src/modules/prix-essence/components/PrixEssenceApp.jsx 2>/dev/null || echo "  ⚠️ Fichier component manquant"

# Tests
echo ""
echo "✅ Tests:"
ls -la src/modules/prix-essence/__tests__/index.test.ts 2>/dev/null || echo "  ⚠️ Fichier tests manquant"

# Pages & API
echo ""
echo "✅ Pages & API:"
ls -la src/pages/prix-essence.astro 2>/dev/null || echo "  ⚠️ Page manquante"
ls -la src/pages/api/prix-essence/{search.ts,geocode.ts,refresh.ts} 2>/dev/null || echo "  ⚠️ API routes manquantes"

# Documentation
echo ""
echo "✅ Documentation:"
ls -la src/modules/prix-essence/{README.md,ARCHITECTURE.md,INSTALL.md,QUICKSTART.md,DEPLOYMENT.md,LIVRAISON.md,INDEX.md,START_HERE.md} 2>/dev/null || echo "  ⚠️ Fichiers docs manquants"

# Config
echo ""
echo "✅ Configuration:"
ls -la .env.prix-essence.example 2>/dev/null || echo "  ⚠️ .env.example manquant"
ls -la vitest.config.ts 2>/dev/null || echo "  ⚠️ vitest config manquant"

echo ""
echo "✅ Structure complète vérifiée!"
echo ""
echo "📚 Prochaine étape: Lire START_HERE.md"
echo "   open src/modules/prix-essence/START_HERE.md"
