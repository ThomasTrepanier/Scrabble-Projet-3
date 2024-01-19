import 'package:mobile/classes/game/player.dart';
import 'package:mobile/components/error-pop-up.dart';
import 'package:mobile/constants/create-lobby-constants.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/view-methods/create-lobby-methods.dart';

import '../../constants/erros/game-errors.dart';

class PlayersContainer {
  Player player1;
  Player player2;
  Player player3;
  Player player4;
  String? localPlayerId;

  PlayersContainer.fromPlayers(
      {required this.player1,
      required this.player2,
      required this.player3,
      required this.player4});

  PlayersContainer.fromList(List<Player> players)
      : this.fromPlayers(
            player1: players[0],
            player2: players[1],
            player3: players[2],
            player4: players[3]);

  Player getPlayer(int index) {
    switch (index) {
      case 1:
        return player1;
      case 2:
        return player2;
      case 3:
        return player3;
      case 4:
        return player4;
    }

    throw Exception(INVALID_PLAYER_INDEX);
  }

  Player getPlayerByName(String username) {
    return players.firstWhere((player) => player.user.username == username,
        orElse: () => player1);
  }

  Player getPlayerBySocketId(String socketId) {
    return players.firstWhere((player) => player.socketId == socketId,
        orElse: () => player1);
  }

  List<Player> get players => [player1, player2, player3, player4];

  setLocalPlayer(int playerNumber) {
    localPlayerId = getPlayer(playerNumber).socketId;
  }

  Player getLocalPlayer() {
    if (userService.isObserver) return player1;
    if (localPlayerId == null) {
      errorSnackBar(navigatorKey.currentContext!, NO_LOCAL_PLAYER_DEFINED);
    }
    return players.firstWhere((Player player) {
      return player.socketId == localPlayerId;
    }, orElse: () {
      errorSnackBar(navigatorKey.currentContext!, NO_LOCAL_PLAYER_DEFINED);
      return player1;
    });
  }

  Player getNextPlayerInList(Player player) {
    int givenPlayerIndex =
        players.indexOf(players.firstWhere((Player p) => p == player));
    int nextPlayerIndex = (givenPlayerIndex + 1) % MAX_PLAYER_COUNT + 1;
    return getPlayer(nextPlayerIndex);
  }
}
