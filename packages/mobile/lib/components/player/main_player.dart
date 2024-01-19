import 'package:flutter/material.dart';
import 'package:mobile/classes/game/player.dart';
import 'package:mobile/components/player/abstract_player.dart';
import 'package:mobile/constants/layout.constants.dart';

class MainPlayer extends AbstractPlayer {
  MainPlayer({
    required Player player,
    bool isPlaying = false,
  }) : super(player: player, isPlaying: isPlaying);

  @override
  Widget getContent(BuildContext context) {
    return Card(
      color: getColor(),
      child: Container(
        padding: EdgeInsets.all(SPACE_2),
        child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              getPlayerInfo(large: true),
              Expanded(
                  child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Padding(
                    padding: EdgeInsets.only(bottom: SPACE_1),
                    child: Text(
                      '${player.score}',
                      textAlign: TextAlign.right,
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w600,
                        height: 1,
                        color: getTextColor(),
                      ),
                    ),
                  ),
                  Opacity(
                    opacity: 0.54,
                    child: Text(
                      "Points",
                      textAlign: TextAlign.right,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: getTextColor(),
                        height: 1,
                      ),
                    ),
                  )
                ],
              ))
            ]),
      ),
    );
  }
}
