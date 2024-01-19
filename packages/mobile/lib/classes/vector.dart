import 'package:mobile/constants/game.constants.dart';

class Vec2 {
  int x;
  int y;

  Vec2(this.x, this.y);

  Vec2.fromXY({
    required int x,
    required int y,
  }) : this(x, y);

  Vec2.fromRowCol({
    required int column,
    required int row,
  }) : this(column, row);

  Vec2.from1D(int index) : this(index % GRID_SIZE, (index / GRID_SIZE).floor());

  int get column => x;

  int get row => y;

  set column(int col) {
    x = col;
  }

  set row(int row) {
    y = row;
  }

  int to1D() {
    return x + y * GRID_SIZE;
  }

  Vec2 add(Vec2 v) {
    x += v.x;
    y += v.y;
    return this;
  }

  Vec2 scalar(int i) {
    x *= i;
    y *= i;
    return this;
  }

  Vec2 operator +(Vec2 v) {
    return add(v);
  }

  Vec2 operator *(int i) {
    return scalar(i);
  }
}
