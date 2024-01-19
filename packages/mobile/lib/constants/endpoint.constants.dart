// ignore_for_file: non_constant_identifier_names

import 'package:mobile/environments/environment.dart';

final String BASE_ENDPOINT = Environment().config.apiUrl;
final String GAME_ENDPOINT = "$BASE_ENDPOINT/games";
final String CHAT_ENDPOINT = "$BASE_ENDPOINT/channel:";
final String PUZZLE_ENDPOINT = "$BASE_ENDPOINT/puzzles";
final String ANALYSIS_ENDPOINT = "$BASE_ENDPOINT/analysis";
final String NOTIFICATION_ENDPOINT = "$BASE_ENDPOINT/notification";
