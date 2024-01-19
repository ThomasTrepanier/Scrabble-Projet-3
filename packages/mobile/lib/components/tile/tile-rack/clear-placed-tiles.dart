import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-event.service.dart';

class ClearPlacedTilesWidget extends StatelessWidget {
  ClearPlacedTilesWidget(
      {super.key, required this.hasPlacementStream, required this.tileRack});

  final TileRack tileRack;
  final Stream<bool> hasPlacementStream;
  final GameEventService _gameEventService = getIt.get<GameEventService>();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<bool>(
      stream: hasPlacementStream,
      builder: (context, snapshot) => StreamBuilder(
          stream: tileRack.isExchangeModeEnabled,
          builder: (context, exchangeModeSnapshot) => AppButton(
                onPressed: snapshot.data ?? false
                    ? () {
                        _gameEventService.add<void>(
                            PUT_BACK_TILES_ON_TILE_RACK, null);
                      }
                    : exchangeModeSnapshot.data ?? false
                        ? () {
                            tileRack.disableExchangeMode();
                          }
                        : null,
                icon: Icons.clear,
                iconOnly: true,
              )),
    );
  }
}
