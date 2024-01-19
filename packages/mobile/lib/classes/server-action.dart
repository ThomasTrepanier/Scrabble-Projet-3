// ignore_for_file: constant_identifier_names

const ACTION_LOGIN = 'login';
const ACTION_LOGOUT = 'logout';
const ACTIONS = [ACTION_LOGIN, ACTION_LOGOUT];

class ServerAction {
  DateTime timestamp;
  String actionType;

  ServerAction({required this.timestamp, required this.actionType})
      : assert(ACTIONS.contains(actionType));

  ServerAction.fromJson(Map<String, dynamic> json)
      : this(
            actionType: json['actionType'],
            timestamp: DateTime.parse(json['timestamp']));

  static List<ServerAction> fromJsonList(List<dynamic> list) {
    return list
        .map((json) => ServerAction.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
