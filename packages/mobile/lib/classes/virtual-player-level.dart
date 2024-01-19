import '../constants/erros/game-visibility-errors.dart';

enum VirtualPlayerLevel {
  beginner,
  expert;

  String get levelName {
    return VIRTUAL_PLAYER_LEVEL_NAME[this] != null
        ? VIRTUAL_PLAYER_LEVEL_NAME[this]!
        : 'Inconnu';
  }

  static VirtualPlayerLevel fromString(String value) {
    return VirtualPlayerLevel.values.firstWhere((VirtualPlayerLevel level) =>
        level.levelName.toLowerCase() == value.toLowerCase());
  }

  static VirtualPlayerLevel fromInteger(int value) {
    return VirtualPlayerLevel.values[value];
  }

  static VirtualPlayerLevel fromJson(dynamic value) {
    if (value is String) {
      return VirtualPlayerLevel.fromString(value);
    } else if (value is int) {
      return VirtualPlayerLevel.fromInteger(value);
    }
    throw Exception(NO_JSON_VALUE_MATCH);
  }
}

final Map<VirtualPlayerLevel, String> VIRTUAL_PLAYER_LEVEL_NAME = {
  VirtualPlayerLevel.beginner: 'Débutant',
  VirtualPlayerLevel.expert: 'Expert'
};
