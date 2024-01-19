import 'package:flutter/material.dart';
import 'package:mobile/constants/game.constants.dart';

final Map<MultiplierType, String> MULTIPLIER_NAMES = {
  MultiplierType.letter: 'Lettre',
  MultiplierType.word: 'Mot',
};

enum MultiplierType {
  letter,
  word;

  String get name => MULTIPLIER_NAMES[this] ?? 'Inconnu';

  static MultiplierType fromJson(String value) => MultiplierType.values
      .firstWhere((MultiplierType type) => type.name == value);
}

class Multiplier {
  Multiplier({
    required this.value,
    required this.type,
  });

  final int value;

  final MultiplierType type;

  String getType() {
    switch (type) {
      case MultiplierType.letter:
        return LETTER;
      case MultiplierType.word:
        return WORD;
    }
  }

  Color getColor() {
    switch (type) {
      case MultiplierType.letter:
        switch (value) {
          case 2:
            return Color.fromRGBO(160, 213, 243, 1);
          case 3:
            return Color.fromRGBO(34, 162, 236, 1);
        }
        break;
      case MultiplierType.word:
        switch (value) {
          case 2:
            return Color.fromRGBO(245, 173, 170, 1);
          case 3:
            return Color.fromRGBO(248, 100, 95, 1);
        }
    }

    return Colors.transparent;
  }

  factory Multiplier.fromJson(Map<String, dynamic> json) {
    return Multiplier(
      value: json['multiplier'] as int,
      type: MultiplierType.fromJson(json['multiplierEffect']),
    );
  }

  Multiplier copy() {
    return Multiplier(value: value, type: type);
  }
}
