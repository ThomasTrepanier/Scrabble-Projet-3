import '../../constants/erros/action-errors.dart';
import '../board/orientation.dart';
import '../tile/tile.dart';
import 'action-exchange.dart';
import 'action-place.dart';

const int OFFSET = 1;
const int A_LOWERCASE_VALUE = 97;

enum ActionType {
  place,
  exchange,
  pass,
  hint;

  String get name {
    switch (this) {
      case ActionType.place:
        return 'placer';
      case ActionType.exchange:
        return 'échanger';
      case ActionType.pass:
        return 'passer';
      case ActionType.hint:
        return 'indice';
    }
  }

  static ActionType fromString(String value) {
    return ActionType.values.firstWhere(
        (ActionType type) => type.name.toLowerCase() == value.toLowerCase());
  }

  static ActionType fromInteger(int value) {
    return ActionType.values[value];
  }

  static ActionType parse(dynamic value) {
    if (value is String) {
      return ActionType.fromString(value);
    } else if (value is int) {
      return ActionType.fromInteger(value);
    }
    throw Exception(NO_JSON_VALUE_MATCH);
  }
}

abstract class ActionPayload {
  ActionPayload();

  ActionPayload.fromJson(Map<String, dynamic> json);

  Map toJson();
}

class ActionData<T extends ActionPayload> {
  final ActionType type;
  String input;
  final T? payload;

  ActionData({
    required this.type,
    required this.payload,
    this.input = '',
  }) {
    this.input = formatInput(this);
  }

  factory ActionData.fromJson(Map<String, dynamic> json) {
    return ActionData(
        type: ActionType.parse(json['type']),
        input: json['input'],
        payload: json['payload'] ? json['payload'] as T : null);
  }

  Map<String, dynamic> toJson() => {
        'type': type.name,
        'input': input,
        'payload': payload != null ? payload!.toJson() : null,
      };
}

String formatInput(ActionData data) {
  switch (data.type) {
    case (ActionType.place):
      return placeActionPayloadToString(data.payload as ActionPlacePayload);
    case (ActionType.exchange):
      return exchangeActionPayloadToString(
          data.payload as ActionExchangePayload);
    default:
      return "!${data.type.name}";
  }
}

String placeActionPayloadToString(ActionPlacePayload payload) {
  String tilesString = tilesToString(payload.tiles);
  String positionRow =
      String.fromCharCode(payload.position.row + A_LOWERCASE_VALUE + OFFSET);
  String positionColumn = payload.position.column.toString();
  String orientation =
      payload.orientation == Orientation.horizontal ? 'h' : 'v';

  return '!${ActionType.place.name} $positionRow$positionColumn$orientation $tilesString';
}

String exchangeActionPayloadToString(ActionExchangePayload payload) {
  return '!${ActionType.exchange.name} ${tilesToString(payload.tiles)}';
}

String tilesToString(List<Tile> tiles) {
  return tiles
      .map((tile) => tile.letter != null
          ? tile.letter!.toLowerCase().toString()
          : tile.playedLetter.toString())
      .reduce((tilesToString, letter) => tilesToString + letter);
}
