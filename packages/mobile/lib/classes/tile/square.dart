import 'package:flutter/material.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/tile/multiplier.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:rxdart/rxdart.dart';

class Square {
  Position position;
  Multiplier? multiplier;
  bool isCenter;
  BehaviorSubject<Tile?> _tile;

  Square({
    required this.position,
    this.multiplier,
    this.isCenter = false,
    Tile? tile,
    bool isApplied = false,
  })  : _tile = BehaviorSubject.seeded(tile) {
    if (isApplied) applyTile();
  }

  Color getColor() {
    return multiplier?.getColor() ?? Colors.transparent;
  }

  ValueStream<Tile?> get tile {
    return _tile.stream;
  }

  Stream<bool> hasTile() {
    return _tile.map((tile) => tile != null);
  }

  Stream<bool> get isAppliedStream {
    return tile.switchMap((Tile? tile) => Stream.value(tile?.isApplied ?? false));
  }

  bool getIsApplied() {
    return getTile()?.isApplied ?? false;
  }

  Square setTile(Tile tile) {
    _tile.add(tile);
    return this;
  }

  Tile? getTile() {
    return _tile.value;
  }

  Square applyTile() {
    getTile()?.applyTile();
    return this;
  }

  Square removeTile() {
    _tile.add(null);
    return this;
  }

  factory Square.fromJson(Map<String, dynamic> json) {
    return Square(
      position: Position.fromJson(json['position'] as Map<String, dynamic>),
      multiplier: json['scoreMultiplier'] != null
          ? Multiplier.fromJson(json['scoreMultiplier'] as Map<String, dynamic>)
          : null,
      isCenter: json['isCenter'] as bool,
      tile: json['tile'] != null
          ? Tile.fromJson(json['tile'] as Map<String, dynamic>)
          : null,
      isApplied: json['isApplied'] != null
          ? json['isApplied'] as bool
          : json['tile'] != null,
    );
  }

  Square copy() {
    return Square(
      position: position.copy(),
      tile: _tile.value?.copy(),
      multiplier: multiplier?.copy(),
      isCenter: isCenter,
      isApplied: getIsApplied(),
    );
  }
}
