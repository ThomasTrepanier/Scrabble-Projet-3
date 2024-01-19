import 'package:mobile/classes/board/direction.dart';
import 'package:mobile/classes/board/orientation.dart';
import 'package:mobile/classes/vector.dart';

class Position extends Vec2 {
  Position(int column, int row) : super.fromRowCol(column: column, row: row);

  Position.fromVec2(Vec2 v) : super(v.x, v.y);

  Position forward(Orientation orientation, {int distance = 1}) {
    return move(orientation, Direction.forward, distance: distance);
  }

  Position backward(Orientation orientation, {int distance = 1}) {
    return move(orientation, Direction.backward, distance: distance);
  }

  Position move(Orientation orientation, Direction direction,
      {int distance = 1}) {
    add(orientation.vec2 * direction.scalar * distance);

    return this;
  }

  Position copy() {
    return Position(x, y);
  }

  bool equals(Position other) {
    return other.x == x && other.y == y;
  }

  int getComponentFromOrientation(Orientation orientation) {
    switch (orientation) {
      case Orientation.horizontal:
        return x;
      case Orientation.vertical:
        return y;
    }
  }

  factory Position.fromJson(Map<String, dynamic> json) {
    return Position(json['column'] as int, json['row'] as int);
  }

  static fromString(String position) {
    String letter = position.substring(0, 1);
    String number = position.substring(1, position.length - 1);

    int row = letter.codeUnitAt(0) - 96 - 1;
    int column = int.parse(number) - 1;

    return Position(column, row);
  }

  Map<String, dynamic> toJson() => {'row': row, 'column': column};
}
