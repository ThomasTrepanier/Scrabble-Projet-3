import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/components/app_button.dart';

class ShuffleTileRackButton extends StatelessWidget {
  const ShuffleTileRackButton({
    super.key,
    required this.tileRack,
  });

  final TileRack tileRack;

  @override
  Widget build(BuildContext context) {
    return AppButton(
      onPressed: () {
        tileRack.shuffle();
      },
      icon: Icons.shuffle,
      iconOnly: true,
      theme: AppButtonTheme.tertiary,
    );
  }
}
