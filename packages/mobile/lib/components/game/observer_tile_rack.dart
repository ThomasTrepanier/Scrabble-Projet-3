import 'package:flutter/material.dart';

import '../../constants/game.constants.dart';
import '../../constants/layout.constants.dart';
import '../../locator.dart';
import '../../services/game-observer-service.dart';
import '../tile/tile.dart';

class ObserverTiles extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        alignment: Alignment.center,
        padding: EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
        height: 70,
        child: Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            alignment: WrapAlignment.spaceBetween,
            children: [
              StreamBuilder(
                  stream: getIt.get<GameObserverService>().tilesStream,
                  builder: ((context, snapshot) {
                    return snapshot.data != null
                        ? Wrap(
                            children: [
                              ...List.generate(
                                snapshot.data!.length,
                                (index) => Card(
                                  color: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  child: Tile(
                                    tile: snapshot.data![index],
                                    size: TILE_SIZE_DRAG,
                                    shouldWiggle: false,
                                  ),
                                ),
                              )
                            ],
                          )
                        : Container();
                  })),
            ]),
      ),
    );
  }
}
