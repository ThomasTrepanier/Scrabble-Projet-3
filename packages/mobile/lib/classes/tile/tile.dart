import 'package:mobile/classes/tile/tile-state.dart';
import 'package:rxdart/rxdart.dart';

class Tile {
  final String? letter;
  final int? value;
  final bool isWildcard;
  String? playedLetter;
  BehaviorSubject<TileState> _state;

  Tile(
      {this.letter,
      this.value,
      this.isWildcard = false,
      this.playedLetter,
      TileState state = TileState.defaultState})
      : _state = BehaviorSubject.seeded(state);

  static Tile wildcard() {
    return Tile(value: 0, letter: '*', isWildcard: true);
  }

  static Tile create(String letter, int value) {
    return Tile(letter: letter, value: value);
  }

  factory Tile.fromJson(Map<String, dynamic> json) {
    return Tile(
      letter: json['letter'] as String?,
      value: json['value'] as int?,
      isWildcard: json['isBlank'] as bool? ?? false,
      playedLetter: json['playedLetter'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'letter': letter,
        'value': value,
        'isBlank': isWildcard,
        'playedLetter': playedLetter,
      };

  TileState get state => _state.value;

  Tile withState(TileState state) {
    _state.add(state);
    return this;
  }

  bool get isApplied => _state.value == TileState.defaultState;

  Tile applyTile() {
    _state.add(TileState.defaultState);
    return this;
  }

  bool get isSelectedForExchange =>
      _state.value == TileState.selectedForExchange;

  void unselectTile() => _state.add(TileState.defaultState);

  void toggleIsSelected() {
    _state.add(_state.value == TileState.defaultState
        ? TileState.selectedForExchange
        : TileState.defaultState);
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Tile &&
          runtimeType == other.runtimeType &&
          letter == other.letter &&
          value == other.value;

  @override
  int get hashCode => letter.hashCode ^ value.hashCode;

  Tile copy() {
    return Tile(
        value: value,
        letter: letter,
        playedLetter: playedLetter,
        isWildcard: isWildcard,
        state: state);
  }
}


