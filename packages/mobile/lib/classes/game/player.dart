import 'package:mobile/classes/player/player-data.dart';
import 'package:mobile/classes/tile/tile-parser.dart';
import 'package:mobile/classes/user.dart';

import '../../constants/user-constants.dart';
import '../tile/tile.dart';

class Player {
  String socketId;
  PublicUser user;
  int score;
  bool isLocalPlayer;
  double adjustedRating;
  double ratingVariation;
  List<Tile> tiles;

  Player({
    required this.socketId,
    required this.user,
    required this.score,
    this.isLocalPlayer = false,
    required this.tiles,
    this.adjustedRating = DEFAULT_RATING,
    this.ratingVariation = DEFAULT_RATING_VARIATION,
  });

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      socketId: json['id'],
      user: PublicUser.fromJson(json['publicUser']),
      score: json['score'] ?? 0,
      adjustedRating: json['adjustedRating'] ?? DEFAULT_RATING,
      ratingVariation: json['ratingVariation'] ?? DEFAULT_RATING_VARIATION,
      tiles:
          json['tiles'] != null && (json['tiles'] as List<dynamic>).isNotEmpty
              ? TilesParser().parseTiles(json['tiles'] as List<dynamic>)
              : List<Tile>.empty(),
    );
  }

  void updatePlayerData(PlayerUpdateData playerData) {
    socketId = playerData.newId ?? socketId;
    user = playerData.publicUser ?? user;
    score = playerData.score ?? score;
    tiles = playerData.tiles ?? tiles;
    ratingVariation = playerData.ratingVariation ?? DEFAULT_RATING_VARIATION;
    adjustedRating = playerData.adjustedRating ?? DEFAULT_RATING;
  }

  Map<String, dynamic> toJson() => {
        'id': socketId,
        'publicUser': user,
        'score': score,
      };
}
