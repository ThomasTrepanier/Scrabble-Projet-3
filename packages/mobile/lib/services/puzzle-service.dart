import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'package:mobile/classes/actions/word-placement.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/http/ResponseResult.dart';
import 'package:mobile/classes/puzzle/daily-puzzle.dart';
import 'package:mobile/classes/puzzle/puzzle-config.dart';
import 'package:mobile/classes/puzzle/puzzle-level.dart';
import 'package:mobile/classes/puzzle/puzzle-player.dart';
import 'package:mobile/classes/puzzle/puzzle-result.dart';
import 'package:mobile/classes/puzzle/puzzle-type.dart';
import 'package:mobile/classes/puzzle/puzzle.dart';
import 'package:mobile/classes/rounds/round.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/components/puzzle/puzzle-result-dialog.dart';
import 'package:mobile/constants/puzzle-constants.dart';
import 'package:mobile/constants/socket-constants.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/controllers/puzzle-controller.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/services/round-service.dart';
import 'package:mobile/services/user.service.dart';
import 'package:rxdart/rxdart.dart';

import '../locator.dart';

class PuzzleService {
  final PuzzleController _puzzleController = getIt.get<PuzzleController>();
  final RoundService _roundService = getIt.get<RoundService>();
  final UserService _userService = getIt.get<UserService>();
  final GamePlayController _gamePlayController =
      getIt.get<GamePlayController>();
  final BehaviorSubject<PuzzleGame?> _puzzle;

  PuzzleService._privateConstructor() : _puzzle = BehaviorSubject.seeded(null);

  static final PuzzleService _instance = PuzzleService._privateConstructor();

  factory PuzzleService() {
    return _instance;
  }

  ValueStream<PuzzleGame?> get puzzleStream => _puzzle.stream;

  Future<bool> startPuzzle(PuzzleLevel puzzleLevel) async {
    return await _puzzleController.startPuzzle().then((Response value) {
      _handleStartPuzzle(StartPuzzle.fromJson(jsonDecode(value.body))
          .withPuzzleLevel(puzzleLevel)
          .withPuzzleType(PuzzleType.practice));
      return true;
    }).catchError((error) => false);
  }

  void _handleStartPuzzle(StartPuzzle startPuzzle) {
    List<Square> gridConfig = startPuzzle.board;
    List<Tile> tileRackConfig = startPuzzle.tiles;

    Board board = Board();
    board.updateBoardData(gridConfig);

    TileRack tileRack = TileRack().setTiles(tileRackConfig);

    PuzzlePlayer player = _getPuzzlePlayerForGame();
    _puzzle.add(PuzzleGame(
        board: board,
        tileRack: tileRack,
        puzzlePlayer: player,
        puzzleLevel: startPuzzle.puzzleLevel,
        gridConfig: gridConfig,
        puzzleType: startPuzzle.puzzleType));

    Round firstRound = Round(
        socketIdOfActivePlayer: UNDEFINED_SOCKET,
        duration: startPuzzle.puzzleLevel.roundDuration);

    _roundService.startRound(firstRound, _onTimerExpires);
  }

  Future<ResponseResult> completePuzzle() {
    if (!(_puzzle.value?.board.isValidPlacement ?? false)) {
      return abandonPuzzle(resultStatus: PuzzleResultStatus.timeout);
    }

    Placement? placement = _puzzle.value?.board.currentPlacement;

    if (placement == null) {
      throw Exception('Cannot play placement, placement is null');
    }

    WordPlacement wordPlacement =
        WordPlacement(actionPlacePayload: placement.toActionPayload());
    return _puzzleController.completePuzzle(wordPlacement).then(
        (Response response) {
      PuzzleResult puzzleResult =
          PuzzleResult.fromJson(jsonDecode(response.body));

      _handlePuzzleResult(
          puzzleResult,
          _puzzle.value!,
          ScoredWordPlacement(
              actionPlacePayload: wordPlacement.actionPlacePayload,
              score: puzzleResult.userPoints));

      return ResponseResult.success();
    }, onError: (_) => ResponseResult.error());
  }

  Future<ResponseResult> abandonPuzzle(
      {PuzzleResultStatus resultStatus = PuzzleResultStatus.abandoned}) {
    _puzzleController
        .abandonPuzzle(resultStatus: resultStatus)
        .then((Response response) {
      PuzzleResult puzzleResult =
          PuzzleResult.fromJson(jsonDecode(response.body));

      _handlePuzzleResult(puzzleResult, _puzzle.value!, null);

      return ResponseResult.success();
    });

    return Future.value(ResponseResult.success());
  }

  void quitPuzzle() {
    _puzzleController.quitPuzzle();
    clearPuzzle();
    _roundService.endRound();
  }

  void clearPuzzle() {
    _puzzle.add(null);
  }

  Future<bool> startDailyPuzzle() async {
    return await _puzzleController.startDailyPuzzle().then((Response value) {
      _handleStartPuzzle(StartPuzzle.fromJson(jsonDecode(value.body))
          .withPuzzleLevel(advancedPuzzleLevel)
          .withPuzzleType(PuzzleType.daily));
      return true;
    }).catchError((error) => false);
  }

  Future<bool> isDailyCompleted() async {
    return await _puzzleController.isDailyCompleted().then((Response value) {
      DailyCompletionStatus isCompletedStatus =
          DailyCompletionStatus.fromJson(jsonDecode(value.body));
      return isCompletedStatus.isCompleted;
    }).catchError((error) => true);
  }

  Future<DailyPuzzleLeaderboard> getDailyPuzzleLeaderboard() async {
    return await _puzzleController
        .getDailyPuzzleLeaderboard()
        .then((Response value) {
      DailyPuzzleLeaderboard leaderboard =
          DailyPuzzleLeaderboard.fromJson(jsonDecode(value.body));
      return leaderboard;
    });
  }

  void _handlePuzzleResult(PuzzleResult puzzleResult, PuzzleGame puzzleGame,
      ScoredWordPlacement? playedPlacement) {
    PuzzlePlayed puzzlePlayed = PuzzlePlayed.afterPlayed(
        _puzzle.value!.puzzleLevel.nameEnum,
        puzzleGame.gridConfig,
        playedPlacement,
        puzzleResult);

    _roundService.endRound();
    PuzzleResultDialog(puzzlePlayed: puzzlePlayed, puzzleType: puzzleGame.puzzleType)
        .openAnalysisResultDialog(navigatorKey.currentContext!);

    _puzzle.value?.puzzlePlayer.updateStreak(puzzleResult);
    _puzzle.add(_puzzle.value);

    if (playedPlacement != null) {
      _gamePlayController.gameMessage$
          .add(puzzlePlayed.placementToGameMessage());
    }
  }

  void _onTimerExpires() {
    completePuzzle();
  }

  PuzzlePlayer _getPuzzlePlayerForGame() {
    return _puzzle.value?.puzzlePlayer ??
        PuzzlePlayer(
            user: _userService.user.value ?? UNKNOWN_USER,
            streakPoints: 0,
            streakMaxPoints: 0);
  }
}
