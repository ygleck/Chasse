import 'package:flutter/material.dart';

import '../../../../models/fuel_type.dart';

class SearchControls extends StatelessWidget {
  const SearchControls({
    super.key,
    required this.queryController,
    required this.onQueryChanged,
    required this.onSubmit,
    required this.onLocate,
    required this.onFuelChanged,
    required this.onRadiusChanged,
    required this.selectedFuel,
    required this.selectedRadiusKm,
    required this.availableRadiusKm,
    required this.isSearching,
    required this.isLocating,
  });

  final TextEditingController queryController;
  final ValueChanged<String> onQueryChanged;
  final VoidCallback onSubmit;
  final VoidCallback onLocate;
  final ValueChanged<FuelType> onFuelChanged;
  final ValueChanged<int> onRadiusChanged;
  final FuelType selectedFuel;
  final int selectedRadiusKm;
  final List<int> availableRadiusKm;
  final bool isSearching;
  final bool isLocating;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Adresse, ville ou code postal',
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                fontWeight: FontWeight.w700,
                color: const Color(0xFF5F7480),
              ),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: queryController,
          onChanged: onQueryChanged,
          textInputAction: TextInputAction.search,
          onSubmitted: (_) => onSubmit(),
          decoration: const InputDecoration(
            hintText: 'Ex. Montréal, G1R 5M1 ou 1506 route 101',
            prefixIcon: Icon(Icons.search_rounded),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<FuelType>(
                initialValue: selectedFuel,
                items: FuelType.values
                    .map(
                      (fuelType) => DropdownMenuItem(
                        value: fuelType,
                        child: Text(fuelType.label),
                      ),
                    )
                    .toList(growable: false),
                onChanged: isSearching
                    ? null
                    : (value) {
                        if (value != null) {
                          onFuelChanged(value);
                        }
                      },
                decoration: const InputDecoration(
                  labelText: 'Carburant',
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: DropdownButtonFormField<int>(
                initialValue: selectedRadiusKm,
                items: availableRadiusKm
                    .map(
                      (radius) => DropdownMenuItem(
                        value: radius,
                        child: Text('$radius km'),
                      ),
                    )
                    .toList(growable: false),
                onChanged: isSearching
                    ? null
                    : (value) {
                        if (value != null) {
                          onRadiusChanged(value);
                        }
                      },
                decoration: const InputDecoration(
                  labelText: 'Rayon',
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: isSearching ? null : onSubmit,
                icon: isSearching
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2.2),
                      )
                    : const Icon(Icons.search_rounded),
                label: Text(isSearching ? 'Recherche…' : 'Rechercher'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: isLocating ? null : onLocate,
                icon: isLocating
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2.2),
                      )
                    : const Icon(Icons.my_location_rounded),
                label: const Text('Ma position'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
