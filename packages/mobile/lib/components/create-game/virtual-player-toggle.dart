// ignore_for_file: non_constant_identifier_names

import 'package:flutter/material.dart';
import 'package:mobile/classes/virtual-player-level.dart';
import 'package:mobile/components/app-toggle-button.dart';

class VirtualPlayerToggle extends AppToggleOption {
  final String id;
  final VirtualPlayerLevel nameEnum;
  final List<IconData> icons;

  VirtualPlayerToggle({
    required this.id,
    required this.nameEnum,
    required this.icons,
  });

  String get name => VIRTUAL_PLAYER_LEVEL_NAME[nameEnum] ?? 'Inconnu';

  @override
  String getEnumName() {
    return nameEnum.name;
  }

  @override
  Enum getEnum() {
    return nameEnum;
  }
}

final VirtualPlayerToggle beginnerDifficultyLevel = VirtualPlayerToggle(
    id: '1',
    nameEnum: VirtualPlayerLevel.beginner,
    icons: [Icons.smart_toy_sharp]);

final VirtualPlayerToggle expertDifficultyLevel = VirtualPlayerToggle(
    id: '2',
    nameEnum: VirtualPlayerLevel.expert,
    icons: [
      Icons.smart_toy_sharp,
      Icons.smart_toy_sharp,
      Icons.smart_toy_sharp
    ]);

final Map<VirtualPlayerLevel, VirtualPlayerToggle> DIFFICULTY_LEVELS = {
  VirtualPlayerLevel.beginner: beginnerDifficultyLevel,
  VirtualPlayerLevel.expert: expertDifficultyLevel,
};

VirtualPlayerToggle getDifficultyLevelFromIndex(int index) {
  if (index < 0 ||
      VIRTUAL_PLAYER_LEVEL_NAME.isEmpty ||
      index >= VIRTUAL_PLAYER_LEVEL_NAME.values.length) {
    return expertDifficultyLevel;
  }

  return DIFFICULTY_LEVELS.values.toList()[index];
}

VirtualPlayerToggle getPlayerLevelFromName(VirtualPlayerToggle name) {
  return DIFFICULTY_LEVELS[name] ?? expertDifficultyLevel;
}
