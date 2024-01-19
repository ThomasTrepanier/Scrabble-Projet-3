import 'dart:convert';

import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/classes/actions/word-placement.dart';
import 'package:mobile/classes/puzzle/puzzle-result.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import '../locator.dart';
import '../services/client.dart';

class PuzzleController {
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();

  InterceptedHttp get http => httpClient.http;

  final String endpoint = PUZZLE_ENDPOINT;

  PuzzleController._privateConstructor();

  Future<Response> startPuzzle() async {
    return http.post(Uri.parse("$endpoint/start"));
  }

  Future<Response> completePuzzle(WordPlacement placement) async {
    return http.post(Uri.parse("$endpoint/complete"), body: jsonEncode(placement));
  }

  Future<Response> abandonPuzzle({required PuzzleResultStatus resultStatus}) async {
    return http.post(Uri.parse("$endpoint/abandon"), body: jsonEncode(resultStatus));
  }

  void quitPuzzle() {
    http.post(Uri.parse("$endpoint/abandon"));
  }

  Future<Response> startDailyPuzzle() async {
    return http.post(Uri.parse("$endpoint/daily/start"));
  }

  Future<Response> isDailyCompleted() async {
    return http.post(Uri.parse("$endpoint/daily/is-completed"));
  }

  Future<Response> getDailyPuzzleLeaderboard() {
    return http.post(Uri.parse("$endpoint/daily/leaderboard"));
  }

  static final PuzzleController _instance =
      PuzzleController._privateConstructor();

  factory PuzzleController() {
    return _instance;
  }
}
