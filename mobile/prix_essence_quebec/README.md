# Prix Essence Québec Mobile

Application Flutter prête pour Android et iOS afin d'interroger l'API `prix-essence` existante et d'afficher la meilleure station, le top 10 et la carte du secteur.

## Architecture

L'application suit une séparation simple et maintenable :

- `lib/core/` : configuration, thème, widgets transverses et helpers
- `lib/models/` : modèles métier et sérialisation API
- `lib/services/` : HTTP, géolocalisation et stockage local
- `lib/providers/` : injection des services et providers Riverpod
- `lib/features/home/` : état, contrôleur et UI de l'écran principal

Le flux principal est :

1. l'utilisateur saisit une adresse ou utilise sa position
2. `HomeController` construit un `SearchRequest`
3. `PrixEssenceApiService` appelle l'API Astro/Cloudflare
4. le résultat met à jour la carte, la meilleure option, le top 10, l'historique et les favoris

## Dépendances

- `flutter_riverpod`
- `dio`
- `flutter_map`
- `latlong2`
- `geolocator`
- `permission_handler`
- `shared_preferences`
- `url_launcher`
- `intl`

## Variables et configuration

L'URL API est configurable via `--dart-define`.

Valeurs supportées :

- `API_BASE_URL`
- `MAP_PROVIDER`
- `MAP_TILE_TEMPLATE`
- `MAP_TILE_SUBDOMAINS`
- `MAP_ATTRIBUTION_LABEL`
- `MAP_ATTRIBUTION_URL`

Exemple :

```bash
flutter run --dart-define=API_BASE_URL=https://prix-essence-codex.ygleck.workers.dev
```

Par défaut, l'app utilise :

- API : `https://prix-essence-codex.ygleck.workers.dev`
- carte : OpenStreetMap via `flutter_map`
- tuiles : `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- sous-domaines : `a,b,c`

## Lancer l'application

Depuis le dossier du projet mobile :

```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=https://prix-essence-codex.ygleck.workers.dev
```

Si plusieurs appareils sont branchés :

```bash
flutter devices
flutter run -d <device-id> --dart-define=API_BASE_URL=https://prix-essence-codex.ygleck.workers.dev
```

## Vérifications locales

```bash
flutter analyze
flutter test
```

## Contrat API attendu

### `GET /api/prix-essence/status`

Retourne un état global du dataset, par exemple :

- fraîcheur du cache
- backend de cache utilisé
- nombre de stations

### `POST /api/prix-essence/search`

Payload :

```json
{
  "query": "Repentigny, Québec, Canada",
  "fuelType": "regular",
  "radiusKm": 20
}
```

ou

```json
{
  "location": {
    "latitude": 45.748,
    "longitude": -73.45,
    "label": "Ma position"
  },
  "fuelType": "diesel",
  "radiusKm": 10
}
```

Le résultat attendu contient notamment :

- `bestOption`
- `topStations`
- `stationsInRadius`
- `resolvedLocation`
- `effectiveRadiusKm`
- `radiusExpanded`
- `message`

## Fonctionnalités incluses

- recherche par adresse, ville ou code postal
- géolocalisation avec gestion de permission
- meilleure option mise en avant
- top 10 interactif
- carte OSM interactive
- favoris persistés localement
- historique récent persisté localement
- états loading, erreur, vide et skeleton
- ouverture du point sur la carte externe
- ouverture de l'itinéraire externe quand l'origine est disponible

## Évolutions prévues

- provider Google Maps branchable sans réécriture de l'écran
- offline caching plus riche avec Hive
- cartes favorites et filtres avancés
- widgets natifs de clustering avancé si nécessaire
