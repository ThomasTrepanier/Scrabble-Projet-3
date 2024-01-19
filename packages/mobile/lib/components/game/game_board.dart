import 'package:flutter/material.dart';
import 'package:mobile/classes/abstract-game.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/vector.dart';
import 'package:mobile/components/game/game_square.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';
import 'package:rxdart/rxdart.dart';

import '../../constants/game.constants.dart';

class GameBoard extends StatelessWidget {
  GameBoard(
      {required this.gameStream,
      this.isInteractable = true,
      this.size = 630,
      this.isLocalPlayerPlaying})
      : assert(
            gameStream is ValueStream<MultiplayerGame?>
                ? isLocalPlayerPlaying != null
                : true,
            'You have to define a isLocalPlayerPlaying stream in a Multiplayer Game');

  final Stream<AbstractGame?> gameStream;
  final Stream<bool>? isLocalPlayerPlaying;
  final bool isInteractable;
  double size;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        padding: EdgeInsets.all(SPACE_2),
        child: AspectRatio(
          aspectRatio: 1,
          child: StreamBuilder<dynamic>(
            stream: gameBoardStream(),
            builder: (context, snapshot) {
              if (!snapshot.hasData) return SizedBox.shrink();

              AbstractGame? game =
                  snapshot.data! is List ? snapshot.data![0] : snapshot.data!;
              bool isLocalPlayerPlaying =
                  game is MultiplayerGame? ? snapshot.data![1] : true;

              return GridView.count(
                crossAxisCount: GRID_SIZE + 1,
                physics: NeverScrollableScrollPhysics(),
                mainAxisSpacing: SPACE_1 / 2,
                crossAxisSpacing: SPACE_1 / 2,
                shrinkWrap: true,
                childAspectRatio: 1,
                children: _buildGridChildren(game, isLocalPlayerPlaying),
              );
            },
          ),
        ),
      ),
    );
  }

  List<Widget> _buildGridChildren(
      AbstractGame? game, bool isLocalPlayerPlaying) {
    List<Widget> children = [];

    // add the column headers row
    children.add(_buildGridNumber(''));
    for (int col = 0; col < GRID_SIZE; col++) {
      children.add(_buildGridNumber((col + 1).toString()));
    }

    for (int col = 0; col < GRID_SIZE; col++) {
      // add the row header cell
      children
          .add(_buildGridNumber(String.fromCharCode('A'.codeUnitAt(0) + col)));

      for (int row = 0; row < GRID_SIZE; row++) {
        var position = Position(row, col);
        children.add(GameSquare(
          tileRack: game?.tileRack,
          square: game?.board.getSquare(position) ??
              Square(position: Position(0, 0)),
          boardSize: size,
          isInteractable: isInteractable,
          isLocalPlayerPlaying: isLocalPlayerPlaying,
        ));
      }
    }

    return children;
  }

  Widget _buildGridNumber(String number) {
    return Container(
      alignment: Alignment.center,
      color: Colors.white,
      child: Text(
        number is int ? number.toString() : number,
        style: TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 16,
          fontFamily: 'CaveStoryRegular',
        ),
      ),
    );
  }

  Stream<dynamic> gameBoardStream() {
    if (isLocalPlayerPlaying == null) return gameStream;
    return CombineLatestStream<dynamic, dynamic>(
        [gameStream, isLocalPlayerPlaying!], (values) => values);
  }
}
