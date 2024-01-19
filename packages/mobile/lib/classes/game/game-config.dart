import 'package:mobile/classes/game/player.dart';
import 'package:mobile/classes/tile/tile-reserve.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/utils/round-utils.dart';

import '../rounds/round.dart';

class StartGameData {
  final Player player1;
  final Player player2;
  final Player player3;
  final Player player4;
  final String gameId;
  final Round firstRound;
  final List<TileReserveData> tileReserve;

  StartGameData({
    required this.player1,
    required this.player2,
    required this.player3,
    required this.player4,
    required this.gameId,
    required this.firstRound,
    required this.tileReserve,
  });

  factory StartGameData.fromJson(Map<String, dynamic> json) {
    return StartGameData(
        player1: Player.fromJson(json['player1']),
        player2: Player.fromJson(json['player2']),
        player3: Player.fromJson(json['player3']),
        player4: Player.fromJson(json['player4']),
        gameId: json['gameId'],
        firstRound: Round.fromJson(json['round']),
        tileReserve: json['tileReserve'] != null && (json['tileReserve'] as List<dynamic>).isNotEmpty
            ? (json['tileReserve'] as List<dynamic>)
                .map((dynamic tile) =>
                    TileReserveData.fromJson(tile)).toList()
            : List<TileReserveData>.empty());
  }
}

class InitializeGameData {
  final String localPlayerSocketId;
  final StartGameData startGameData;

  InitializeGameData(
      {required this.localPlayerSocketId, required this.startGameData});
}
