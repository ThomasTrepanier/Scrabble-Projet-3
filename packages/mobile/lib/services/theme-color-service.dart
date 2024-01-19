import 'package:flutter/material.dart';
import 'package:mobile/constants/theme-constants.dart';
import 'package:rxdart/rxdart.dart';

class ThemeColorService {
  ThemeColorService._privateConstructor();

  static final ThemeColorService _instance =
      ThemeColorService._privateConstructor();

  factory ThemeColorService() {
    return _instance;
  }

  BehaviorSubject<ThemeDetails> themeDetails =
      BehaviorSubject<ThemeDetails>.seeded(setTheme(ThemeColor.green));

  Color secondaryButton = Color.fromRGBO(216, 216, 216, 1);

  Color menuSecondaryButton = Color.fromRGBO(222, 239, 223, 1);

  Color cardColor = Color.fromRGBO(255, 255, 255, 1);
}

ThemeDetails setTheme(ThemeColor color) {
  switch (color) {
    case ThemeColor.green:
      return ThemeDetails(color: color, logoPath: LOGO_PATH_GREEN);
    case ThemeColor.blue:
      return ThemeDetails(color: color, logoPath: LOGO_PATH_BLUE);
    case ThemeColor.pink:
      return ThemeDetails(color: color, logoPath: LOGO_PATH_PINK);
    case ThemeColor.purple:
      return ThemeDetails(color: color, logoPath: LOGO_PATH_PURPLE);
    case ThemeColor.black:
      return ThemeDetails(color: color, logoPath: LOGO_PATH_BLACK);
    case ThemeColor.red:
      return ThemeDetails(color: color, logoPath: LOGO_PATH_RED);
  }
}

enum ThemeColor {
  green,
  blue,
  purple,
  pink,
  red,
  black;

  Color get colorValue {
    switch (this) {
      case green:
        return Color.fromRGBO(27, 94, 32, 1);
      case blue:
        return Color.fromRGBO(10, 59, 72, 1);
      case purple:
        return Color.fromRGBO(168, 1, 255, 1);
      case pink:
        return Color.fromRGBO(255, 1, 162, 1);
      case red:
        return Color.fromRGBO(185, 0, 76, 1);
      case black:
        return Colors.black;
    }
  }
}

class ThemeDetails {
  ThemeColor color;
  String logoPath;

  ThemeDetails({required this.color, required this.logoPath});
}
