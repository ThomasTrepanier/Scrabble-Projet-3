import 'package:mobile/classes/vector.dart';

enum Orientation {
  horizontal,
  vertical,
}

extension OrientationExtension on Orientation {
  Orientation reverse() {
    switch (this) {
      case Orientation.horizontal:
        return Orientation.vertical;
      case Orientation.vertical:
        return Orientation.horizontal;
    }
  }

  Vec2 get vec2 {
    switch (this) {
      case Orientation.horizontal:
        return Vec2.fromRowCol(column: 1, row: 0);
      case Orientation.vertical:
        return Vec2.fromRowCol(column: 0, row: 1);
    }
  }

  int toInt() {
    switch (this) {
      case Orientation.horizontal:
        return 0;
      case Orientation.vertical:
        return 1;
    }
  }
}

Orientation orientationFromInt(int n) {
  switch (n) {
    case 0:
      return Orientation.horizontal;
    case 1:
      return Orientation.vertical;
  }

  throw Exception('Cannot get orientation from int: invalid value "$n"');
}
