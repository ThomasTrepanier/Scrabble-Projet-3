// ignore_for_file: non_constant_identifier_names

import 'package:flutter/material.dart';
import 'package:mobile/components/game/game_square.dart';

enum TileState { defaultState, notApplied, selectedForExchange, synced;

  Color get tint {
    switch (this) {
      case (TileState.selectedForExchange):
        return Colors.lightBlue;
      case (TileState.notApplied):
        return NOT_APPLIED_COLOR;
      case (TileState.defaultState):
      case (TileState.synced):
        return Colors.transparent;
    }
  }

  double get opacity {
    switch (this) {
      case(TileState.synced):
        return 0.5;
      case (TileState.defaultState):
      case (TileState.selectedForExchange):
      case (TileState.notApplied):
        return 1.0;
    }
  }
}
