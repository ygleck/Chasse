import 'package:flutter/material.dart';

class SkeletonBox extends StatelessWidget {
  const SkeletonBox({
    super.key,
    required this.height,
    this.width = double.infinity,
    this.borderRadius = 18,
  });

  final double height;
  final double width;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: const Color(0xFFE7EDF1),
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }
}

class SearchSkeletonView extends StatelessWidget {
  const SearchSkeletonView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: const [
        SkeletonBox(height: 180, borderRadius: 28),
        SizedBox(height: 16),
        SkeletonBox(height: 340, borderRadius: 28),
        SizedBox(height: 16),
        SkeletonBox(height: 420, borderRadius: 28),
      ],
    );
  }
}
