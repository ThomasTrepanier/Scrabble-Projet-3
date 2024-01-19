class AchievementLevel {
  int value;
  String image;

  AchievementLevel({required this.value, required this.image});

  AchievementLevel.fromJson(Map<String, dynamic> json)
      : this(value: (json['value'] as num).toInt(), image: (json['image']));

  static List<AchievementLevel> fromJsonList(List<dynamic> list) {
    return list
        .map<AchievementLevel>((json) => AchievementLevel.fromJson(json))
        .toList();
  }
}

class Achievement {
  String name;
  String description;
  String defaultImage;
  int zeroValue;
  List<AchievementLevel> levels;

  Achievement({
    required this.name,
    required this.description,
    required this.defaultImage,
    required this.zeroValue,
    required this.levels,
  });

  Achievement.fromJson(Map<String, dynamic> json)
      : this(
          name: json['name'],
          description: json['description'],
          defaultImage: json['defaultImage'],
          zeroValue: (json['zeroValue'] as num).toInt(),
          levels: AchievementLevel.fromJsonList(json['levels']),
        );
}

class UserAchievement {
  Achievement achievement;
  AchievementLevel? level;
  int? levelIndex;
  double value;

  UserAchievement({
    required this.achievement,
    this.level,
    required this.value,
    this.levelIndex,
  });

  UserAchievement.fromJson(Map<String, dynamic> json)
      : this(
            achievement: Achievement.fromJson(json['achievement']),
            level: (json['level'] == null
                ? null
                : AchievementLevel.fromJson(json['level'])),
            levelIndex: json['levelIndex'],
            value: (json['value'] as num).toDouble());

  static List<UserAchievement> fromJsonList(List<dynamic> list) {
    return list
        .map<UserAchievement>((json) => UserAchievement.fromJson(json))
        .toList();
  }
}
