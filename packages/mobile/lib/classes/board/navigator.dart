import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/board/direction.dart';
import 'package:mobile/classes/board/orientation.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/constants/game.constants.dart';

class Navigator {
  Board board;
  Orientation orientation;
  Position position;

  Navigator({
    required this.board,
    required this.orientation,
    required this.position,
  }) {
    position = position.copy();
  }

  Square get square => board.getSquare(position);

  Navigator move(Direction direction, {int distance = 1}) {
    position.move(orientation, direction, distance: distance);
    return this;
  }

  Navigator forward({int distance = 1}) {
    position.forward(orientation, distance: distance);
    return this;
  }

  Navigator backward({int distance = 1}) {
    position.backward(orientation, distance: distance);
    return this;
  }

  Navigator go(Position position) {
    this.position = position;
    return this;
  }

  Navigator nextLine() {
    switch (orientation) {
      case Orientation.horizontal:
        position.row += 1;
        position.column = 0;
        break;
      case Orientation.vertical:
        position.row = 0;
        position.column += 1;
        break;
    }

    return this;
  }

  Navigator switchOrientation() {
    orientation = orientation.reverse();
    return this;
  }

  Navigator clone() {
    return Navigator(
        board: board, orientation: orientation, position: position);
  }

  bool isEmpty() {
    return !isWithinBounds() || square.getTile() == null;
  }

  bool isWithinBounds() {
    return position.column >= 0 &&
        position.column < GRID_SIZE &&
        position.row >= 0 &&
        position.row < GRID_SIZE;
  }

  bool hasNonEmptyNeighbor({bool perpendicular = true}) {
    var navigator = perpendicular ? clone().switchOrientation() : clone();
    return !navigator.clone().forward().isEmpty() ||
        !navigator.clone().backward().isEmpty();
  }
}
