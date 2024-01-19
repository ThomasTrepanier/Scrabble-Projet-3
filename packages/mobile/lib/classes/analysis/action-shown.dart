// ignore_for_file: non_constant_identifier_names

import 'package:mobile/components/app-toggle-button.dart';

enum ActionShown {
  played,
  best;
}

class ActionShownValue extends AppToggleOption {
  final ActionShown actionShow;

  ActionShownValue({required this.actionShow});

  String get name => ACTION_SHOWN_NAMES[actionShow] ?? 'Inconnu';

  @override
  String getEnumName() {
    return actionShow.name;
  }

  @override
  Enum getEnum() {
    return actionShow;
  }
}

final Map<ActionShown, String> ACTION_SHOWN_NAMES = {
  ActionShown.played: 'Action faite',
  ActionShown.best: 'Action optimale',
};

final Map<ActionShown, ActionShownValue> ACTION_SHOWN_OPTIONS_TO_VALUES = {
  ActionShown.played: ActionShownValue(actionShow: ActionShown.played),
  ActionShown.best: ActionShownValue(actionShow: ActionShown.best),
};

