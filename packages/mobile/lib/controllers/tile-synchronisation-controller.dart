import 'dart:convert';

import 'package:http/http.dart';
import 'package:http_interceptor/http/http.dart';
import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/constants/socket-events/game-events.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:rxdart/subjects.dart';

import '../services/client.dart';

class TileSynchronisationController {
  final GamePlayController _gamePlayController =
      getIt.get<GamePlayController>();
  final SocketService _socketService = getIt.get<SocketService>();

  final String baseEndpoint = GAME_ENDPOINT;
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();

  InterceptedHttp get http => httpClient.http;

  TileSynchronisationController._privateConstructor() {
    _configureSocket();
  }

  final PublishSubject<List<TilePlacement>> _synchronisedTiles$ =
      PublishSubject();

  Stream<List<TilePlacement>> get synchronisedTiles =>
      _synchronisedTiles$.stream;

  Future<Response> sendSyncedTilePlacement(List<TilePlacement> tilePlacements) {
    return http.post(
        Uri.parse(
            '$GAME_ENDPOINT/${_gamePlayController.currentGameId}/squares/place'),
        body: jsonEncode({'tilePlacement': tilePlacements}));
  }

  void _configureSocket() {
    _socketService.on(SYNCED_TILE_PLACED_EVENT_NAME, (receivedTilePlacements) {
      List<TilePlacement> tilePlacements =
          (receivedTilePlacements as List<dynamic>)
              .map((tilePlacement) => TilePlacement.fromJson(tilePlacement))
              .toList();

      _synchronisedTiles$.add(tilePlacements);
    });
  }

  static final TileSynchronisationController _instance =
      TileSynchronisationController._privateConstructor();

  factory TileSynchronisationController() {
    return _instance;
  }
}
