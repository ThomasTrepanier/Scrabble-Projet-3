import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/classes/user.dart';

class PlayerUpdateData {
  String id;
  String? newId;
  PublicUser? publicUser;
  int? score;
  double? ratingVariation;
  double? adjustedRating;
  List<Tile>? tiles;

  PlayerUpdateData({
    required this.id,
    this.newId,
    this.publicUser,
    this.score,
    this.tiles,
    this.adjustedRating,
    this.ratingVariation,
  });

  factory PlayerUpdateData.fromJson(Map<String, dynamic> json) {
    return PlayerUpdateData(
      id: json['id'] as String,
      newId: json['newId'] as String?,
      publicUser: json['publicUser'] != null
          ? PublicUser.fromJson(json['publicUser'] as Map<String, dynamic>)
          : null,
      score: json['score'] as int?,
      adjustedRating: json['adjustedRating'] != null
          ? (json['adjustedRating'] as num).toDouble()
          : null,
      ratingVariation: json['ratingVariation'] != null
          ? (json['ratingVariation'] as num).toDouble()
          : null,
      tiles: json['tiles'] != null
          ? List<Tile>.from(
              (json['tiles'] as List).map((e) => Tile.fromJson(e)))
          : null,
    );
  }
}
