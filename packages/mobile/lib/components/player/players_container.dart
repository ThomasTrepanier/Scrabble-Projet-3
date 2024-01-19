import 'package:flutter/material.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/game/player.dart' as c;
import 'package:mobile/classes/game/players_container.dart' as p;
import 'package:mobile/components/player/main_player.dart';
import 'package:mobile/components/player/player.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:rxdart/rxdart.dart';

import '../../services/game-observer-service.dart';
import '../../services/user.service.dart';
import '../../view-methods/group.methods.dart';

const VIRTUAL_PLAYER_ID_PREFIX = 'virtual-player';

class PlayersContainer extends StatelessWidget {
  GameService _gameService = getIt.get<GameService>();
  RoundService _roundService = getIt.get<RoundService>();
  GameObserverService _gameObserverService = getIt.get<GameObserverService>();
  List<c.Player> generateOrderedPlayerList(
      p.PlayersContainer playersContainer) {
    List<c.Player> playerList = List.of([playersContainer.getLocalPlayer()]);

    c.Player lastPlayerPushed = playerList.last;
    do {
      playerList.add(playersContainer.getNextPlayerInList(playerList.last));
      lastPlayerPushed = playerList.last;
    } while (lastPlayerPushed != playersContainer.getLocalPlayer());

    return playerList;
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: CombineLatestStream.list<dynamic>(
          [_gameService.gameStream, _roundService.getActivePlayerId()]),
      builder: (context, snapshot) {
        if (snapshot.data == null) return Container();

        MultiplayerGame game = snapshot.data![0];
        String activePlayerId = snapshot.data![1];

        List<c.Player> orderedPlayerList =
            generateOrderedPlayerList(game.players);

        return getIt.get<UserService>().isObserver
            ? handleObserversContainer(orderedPlayerList, activePlayerId)
            : handlePlayersContainer(orderedPlayerList, activePlayerId);
      },
    );
  }

  Widget handlePlayersContainer(
      List<c.Player> orderedPlayerList, String activePlayerId) {
    return IntrinsicHeight(
        child: Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
            child: MainPlayer(
                player: orderedPlayerList[0],
                isPlaying: _roundService.isActivePlayer(
                    activePlayerId, orderedPlayerList[0].socketId))),
        Expanded(
          child: Column(
            children: [
              Player(
                  player: orderedPlayerList[1],
                  isPlaying: _roundService.isActivePlayer(
                      activePlayerId, orderedPlayerList[1].socketId)),
              Player(
                player: orderedPlayerList[2],
                isPlaying: _roundService.isActivePlayer(
                    activePlayerId, orderedPlayerList[2].socketId),
              ),
              Player(
                player: orderedPlayerList[3],
                isPlaying: _roundService.isActivePlayer(
                    activePlayerId, orderedPlayerList[3].socketId),
              ),
            ],
          ),
        )
      ],
    ));
  }

  Widget handleObserver(c.Player observer, int index, String activePlayerId,
      int observedIndex, List<c.Player> orderedPlayerList) {
    return GestureDetector(
      onTap: () {
        changeObservedPlayer$.add(index);
        isObservingVirtualPlayer$.add(orderedPlayerList[index - 1]
            .socketId
            .contains(VIRTUAL_PLAYER_ID_PREFIX));
        _gameObserverService.setPlayerTileRack(index);
      },
      child: Player(
        player: observer,
        isPlaying:
            _roundService.isActivePlayer(activePlayerId, observer.socketId),
        isObserved: observedIndex == (index),
      ),
    );
  }

  Widget handleObserversContainer(
      List<c.Player> orderedPlayerList, String activePlayerId) {
    return StreamBuilder(
        stream: _gameObserverService.observedPlayerIndexStream,
        builder: (context, snapshot) {
          int observedIndex = snapshot.data ?? 0;
          return IntrinsicHeight(
              child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: Column(
                  children: [
                    handleObserver(orderedPlayerList[0], 1, activePlayerId,
                        observedIndex, orderedPlayerList),
                    handleObserver(orderedPlayerList[1], 2, activePlayerId,
                        observedIndex, orderedPlayerList),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  children: [
                    handleObserver(orderedPlayerList[2], 3, activePlayerId,
                        observedIndex, orderedPlayerList),
                    handleObserver(orderedPlayerList[3], 4, activePlayerId,
                        observedIndex, orderedPlayerList),
                  ],
                ),
              )
            ],
          ));
        });
  }
}
