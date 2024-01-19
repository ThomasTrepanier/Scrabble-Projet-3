import 'package:flutter/material.dart';
import 'package:mobile/classes/game/player.dart' as c;
import 'package:mobile/components/player/abstract_player.dart';
import 'package:mobile/constants/layout.constants.dart';

import '../../locator.dart';
import '../../services/user.service.dart';

class Player extends AbstractPlayer {
  Player({
    required c.Player player,
    bool isPlaying = false,
    bool isObserved = false,
  }) : super(player: player, isPlaying: isPlaying, isObserved: isObserved);

  @override
  Widget getContent(BuildContext context) {
    return Card(
        color: getColor(),
        child: Container(
          decoration: BoxDecoration(
              border: isObserved
                  ? Border.all(width: 3, color: Color.fromRGBO(236, 182, 32, 1))
                  : Border.all(width: 3, color: getColor() ?? Colors.white),
              borderRadius: BorderRadius.all(Radius.circular(10))),
          padding: EdgeInsets.symmetric(
            horizontal: SPACE_2,
            vertical: SPACE_1,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(child: getPlayerInfo()),
              Text(
                '${player.score}',
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                  height: 1,
                  color: getTextColor(),
                ),
              ),
              SizedBox(
                width: 2,
              ),
              getIt.get<UserService>().isObserver
                  ? Icon(
                      Icons.visibility,
                      color: isObserved
                          ? Color.fromRGBO(236, 182, 32, 1)
                          : getTextColor(),
                    )
                  : Container(),
            ],
          ),
        ));
  }
}
