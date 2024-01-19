import 'package:mobile/routes/routes.dart';

enum MusicType {
  noMusic,
  backgroundMusic,
  lobbyMusic,
}

enum Sound {
  click,
  lowTime,
  criticalLowTime,
  victory,
  endGame,
  tilePlacement,
}

extension SoundName on Sound {
  String get name {
    switch (this) {
      case Sound.click:
        return "TilePlacementSound";
      case Sound.lowTime:
        return "LowTimeSound";
      case Sound.criticalLowTime:
        return "LowTimeSound";
      //   return "CriticalLowTimeSound";
      case Sound.victory:
        return "VictorySound";
      case Sound.endGame:
        return "EndGameSound";
      case Sound.tilePlacement:
        return "TilePlacementSound";
    }
  }

  String get extension {
    switch (this) {
      default:
        return "mp3";
    }
  }

  String get path {
    return "sounds/$name.$extension";
  }
}

const backgroundMusic = [
  "sounds/BackgroundMusic1.mp3",
  "sounds/BackgroundMusic2.mp3",
  "sounds/BackgroundMusic3.mp3",
];

const lobbyMusic = [
  "sounds/LobbyMusic1.mp3",
  "sounds/LobbyMusic2.mp3",
  "sounds/LobbyMusic3.mp3",
];

const pagesNoMusic = [GAME_PAGE_ROUTE, PUZZLE_ROUTE];
const pageLobbyMusic = [
  CREATE_LOBBY_ROUTE,
  JOIN_WAITING_ROUTE,
  JOIN_LOBBY_ROUTE
];

const lowTime = 20;
const criticalLowTime = 5;
