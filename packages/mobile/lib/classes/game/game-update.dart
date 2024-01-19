import 'package:mobile/classes/player/player-data.dart';
import 'package:mobile/classes/rounds/round.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-reserve.dart';
import 'package:mobile/classes/tile/tile-state.dart';

class GameUpdateData {
  final PlayerUpdateData? player1;
  final PlayerUpdateData? player2;
  final PlayerUpdateData? player3;
  final PlayerUpdateData? player4;
  final bool? isGameOver;
  final List<String>? winners;
  final List<Square>? board;
  final Round? round;
  final List<TileReserveData>? tileReserve;
  final int? idGameHistory;

  GameUpdateData(
      {this.player1,
      this.player2,
      this.player3,
      this.player4,
      this.isGameOver,
      this.winners,
      this.board,
      this.round,
      this.tileReserve,
      this.idGameHistory});

  factory GameUpdateData.fromJson(Map<String, dynamic> json) {
    return GameUpdateData(
        player1: json['player1'] != null
            ? PlayerUpdateData.fromJson(json['player1'])
            : null,
        player2: json['player2'] != null
            ? PlayerUpdateData.fromJson(json['player2'])
            : null,
        player3: json['player3'] != null
            ? PlayerUpdateData.fromJson(json['player3'])
            : null,
        player4: json['player4'] != null
            ? PlayerUpdateData.fromJson(json['player4'])
            : null,
        isGameOver: json['isGameOver'] as bool?,
        winners: json['winners'] != null
            ? List<String>.from(json['winners'] as List)
            : null,
        board: json['board'] != null
            ? List<Square>.from(
                (json['board'] as List).map((e) => Square.fromJson(e)).toList())
            : null,
        round: json['round'] != null
            ? Round.fromJson(json['round'] as Map<String, dynamic>)
            : null,
        tileReserve: json['tileReserve'] != null &&
                (json['tileReserve'] as List<dynamic>).isNotEmpty
            ? (json['tileReserve'] as List<dynamic>)
                .map((dynamic tile) => TileReserveData.fromJson(tile))
                .toList()
            : null,
        idGameHistory: json['idGameHistory'] as int? ?? -1);
  }
}
