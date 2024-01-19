import 'package:mobile/classes/actions/action-place.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/board/navigator.dart';
import 'package:mobile/classes/board/orientation.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-parser.dart';
import 'package:mobile/classes/tile/tile-state.dart';
import 'package:mobile/classes/tile/tile.dart';

class WordPlacement {
  final ActionPlacePayload actionPlacePayload;

  WordPlacement({required this.actionPlacePayload});

  Map<String, dynamic> toJson() => {
        'wordPlacement': {
          'tilesToPlace': actionPlacePayload.toJson()['tiles'],
          'orientation': actionPlacePayload.toJson()['orientation'],
          'startPosition': actionPlacePayload.toJson()['startPosition'],
        },
      };

  List<Square> toSquaresOnBoard(Board board) {
    List<Square> squares = [];
    Position currentPosition = actionPlacePayload.position;
    Navigator boardNavigator = board.navigate(currentPosition,
        orientation: actionPlacePayload.orientation);

    for (Tile tile in actionPlacePayload.tiles) {
      squares.add(Square(tile: tile.withState(TileState.notApplied), position: currentPosition.copy()));
      do {
        currentPosition = boardNavigator.forward().position;
      } while(boardNavigator.isWithinBounds() && boardNavigator.square.getTile() != null);
    }

    return squares;
  }

  String tilesToString() {
    return actionPlacePayload.tiles
        .map((Tile tile) => tile.letter ?? '*')
        .join();
  }
}

class ScoredWordPlacement extends WordPlacement {
  final int score;

  ScoredWordPlacement({required super.actionPlacePayload, required this.score});

  factory ScoredWordPlacement.fromJson(Map<String, dynamic> json) {
    ActionPlacePayload actionPlacePayload = ActionPlacePayload.fromJson(json);
    return ScoredWordPlacement(
        actionPlacePayload: actionPlacePayload, score: json['score'] as int);
  }
}
