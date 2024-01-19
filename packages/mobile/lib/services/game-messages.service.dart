import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/actions/action-place.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/rounds/round.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/constants/game-messages-constants.dart';
import 'package:mobile/constants/locale/game-message-constants.dart';
import 'package:mobile/services/action-service.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/services/user.service.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/game/game-message.dart';
import '../classes/game/game_messages.dart';
import '../constants/layout.constants.dart';
import '../controllers/game-play.controller.dart';
import '../locator.dart';
import '../utils/game_messages.dart';

class GameMessagesService {
  late BehaviorSubject<List<Widget>> messages$ =
      BehaviorSubject.seeded([_buildMessage(START_MESSAGE)]);

  GameMessagesService._privateConstructor() {
    resetMessages();
    _chatController.messageEvent
        .listen((GameMessage? gameMessage) => addMessage(gameMessage));
  }

  ActionService _actionService = getIt.get<ActionService>();
  GameService _gameService = getIt.get<GameService>();
  GameEventService _gameEventService = getIt.get<GameEventService>();
  final RoundService _roundService = getIt.get<RoundService>();

  Stream<List<Widget>> get messageEvent => messages$.stream;

  static final GameMessagesService _instance =
      GameMessagesService._privateConstructor();
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();

  factory GameMessagesService() {
    return _instance;
  }

  final _chatController = getIt.get<GamePlayController>();

  void addMessage(GameMessage? message) {
    if (message == null) return;
    if (message.content.startsWith('!')) return;

    List<Widget> messages = messages$.value;
    messages.add(_buildMessage(message));
    messages$.add(messages);
  }

  void resetMessages() {
    messages$ = BehaviorSubject.seeded([_buildMessage(START_MESSAGE)]);
  }

  Widget _buildMessage(GameMessage gameMessage) {
    String message = gameMessage.content;
    PlacementMessage? placement = getPlacementMessage(message);

    if (placement != null) return _buildPlacementMessage(placement);

    List<String> subMessages = message.split('<br>');
    if (_isHintMessage(subMessages)) return handleHintMessage(subMessages);

    return Container(
      margin: EdgeInsets.only(bottom: SPACE_2),
      child: Column(
        children: subMessages
            .map((String message) => MarkdownBody(
                  data: message,
                  styleSheet: MarkdownStyleSheet(
                      textAlign: WrapAlignment.center,
                      p: gameMessage.senderId == SYSTEM_ERROR_ID
                          ? TextStyle(color: Colors.red)
                          : null),
                ))
            .toList(),
      ),
    );
  }

  Widget handleHintMessage(List<String> subMessages) {
    subMessages.removeAt(0);
    HintMessage hints = getHintMessage(subMessages);
    return _buildHintMessage(hints);
  }

  Widget _buildHindMessagePayload(HintMessagePayload hintMessagePayload,
      {bool canPlay = true}) {
    return Container(
      margin: EdgeInsets.only(bottom: SPACE_1),
      child: Table(
        columnWidths: const <int, TableColumnWidth>{
          0: FlexColumnWidth(0.6),
          1: FlexColumnWidth(1.7),
          2: FlexColumnWidth(0.7),
          3: FlexColumnWidth(0.6),
        },
        children: [
          TableRow(children: [
            TableCell(
                verticalAlignment: TableCellVerticalAlignment.middle,
                child: Container(
                    padding: EdgeInsets.all(SPACE_1),
                    child: MarkdownBody(
                      data: '**${hintMessagePayload.position}**',
                    ))),
            TableCell(
                verticalAlignment: TableCellVerticalAlignment.middle,
                child: Container(
                  padding: EdgeInsets.all(SPACE_1),
                  child: _buildPlacementMessageLetters(hintMessagePayload),
                )),
            TableCell(
              verticalAlignment: TableCellVerticalAlignment.middle,
              child: _buildPoints(hintMessagePayload),
            ),
            TableCell(
              verticalAlignment: TableCellVerticalAlignment.middle,
              child: Container(
                padding: EdgeInsets.all(SPACE_1),
                child: _buildPlayButton(hintMessagePayload, canPlay: canPlay),
              ),
            )
          ])
        ],
      ),
    );
  }

  Widget _buildHintMessage(HintMessage subMessages) {
    return StreamBuilder(
        stream: _canPlayStream(),
        builder: ((context, snapshot) => Container(
              margin: EdgeInsets.only(bottom: SPACE_1),
              child: Column(
                children: [
                  MarkdownBody(data: HINT_MESSAGE),
                  ...subMessages.hints
                      .map((HintMessagePayload hintMessagePayload) =>
                          _buildHindMessagePayload(hintMessagePayload,
                              canPlay: snapshot.data ?? false))
                      .toList()
                ],
              ),
            )));
  }

  Widget _buildPlacementMessageLetters(PlacementMessage placement) {
    return Wrap(
      spacing: 2,
      alignment: WrapAlignment.center,
      children: [
        ...placement.letters.split('').map((letter) => Tile(
              tile: c.Tile(
                  letter: letter.toUpperCase(),
                  isWildcard: placement is HintMessagePayload &&
                      letter == letter.toUpperCase()),
              size: 22,
            ))
      ],
    );
  }

  Widget _buildPlacementMessage(PlacementMessage placement) {
    return Container(
      margin: EdgeInsets.only(bottom: SPACE_1),
      child: Table(
        columnWidths: const <int, TableColumnWidth>{
          0: FlexColumnWidth(0.7),
          1: FlexColumnWidth(1.6),
          2: FlexColumnWidth(0.6),
        },
        children: [
          TableRow(children: [
            TableCell(
                verticalAlignment: TableCellVerticalAlignment.middle,
                child: Container(
                    padding: EdgeInsets.all(SPACE_1),
                    child: Text(placement is OpponentPlacementMessage
                        ? placement.name
                        : "Vous"))),
            TableCell(
                verticalAlignment: TableCellVerticalAlignment.middle,
                child: Container(
                  padding: EdgeInsets.all(SPACE_1),
                  child: _buildPlacementMessageLetters(placement),
                )),
            TableCell(
              verticalAlignment: TableCellVerticalAlignment.middle,
              child: _buildPoints(placement),
            )
          ]),
        ],
      ),
    );
  }

  Widget _buildPoints(PlacementMessage placement) {
    return Container(
      padding: EdgeInsets.all(SPACE_1),
      child: Row(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Container(
            padding: EdgeInsets.all(SPACE_1),
            decoration: BoxDecoration(
                color: placement is OpponentPlacementMessage ||
                        placement is HintMessagePayload
                    ? Colors.black12
                    : _themeColorService.themeDetails.value.color.colorValue,
                borderRadius: BorderRadius.all(Radius.circular(6))),
            child: Wrap(
              spacing: 2,
              crossAxisAlignment: WrapCrossAlignment.end,
              children: [
                Text(
                  placement.points.toString(),
                  style: TextStyle(
                      color: placement is OpponentPlacementMessage ||
                              placement is HintMessagePayload
                          ? Colors.black
                          : Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600),
                ),
                Text(
                  "pts",
                  style: TextStyle(
                      color: placement is OpponentPlacementMessage ||
                              placement is HintMessagePayload
                          ? Colors.black
                          : Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlayButton(HintMessagePayload hintPayload,
      {bool canPlay = true}) {
    return AppButton(
      onPressed: canPlay ? () => _hanldePlaceAction(hintPayload) : null,
      icon: Icons.play_arrow_rounded,
      size: AppButtonSize.normal,
      type: AppButtonType.normal,
    );
  }

  bool _isHintMessage(List<String> subMessages) {
    if (subMessages[0] == HINT_MESSAGE) return true;
    return false;
  }

  void _hanldePlaceAction(HintMessagePayload hintPayload) async {
    _gameEventService.add<void>(PUT_BACK_TILES_ON_TILE_RACK, null);

    // Wait for tiles to be put back on tilerack
    await Future.delayed(Duration(milliseconds: 250));

    _sendAction(hintPayload);
  }

  void _sendAction(HintMessagePayload hintPayload) {
    ActionPlacePayload? hintActionPayload;

    try {
      hintActionPayload =
          hintPayload.toActionPayload(_gameService.getTileRack());
    } catch (_) {
      addMessage(GameMessage(
          content: CANNOT_PLAY_HINT,
          senderId: SYSTEM_ERROR_ID,
          gameId: _gameService.currentGameId ?? ''));
      return;
    }

    _actionService.sendAction(ActionType.place, hintActionPayload);
  }

  Stream<bool> _canPlayStream() {
    return CombineLatestStream<dynamic, bool>([
      _gameService.gameStream,
      _actionService.isActionBeingProcessedStream,
      _roundService.getActivePlayerId(),
      _roundService.currentRoundStream,
    ], (values) {
      MultiplayerGame game = values[0];
      bool isActionBeingProcessed = values[1];
      String activePlayerSocketId = values[2];
      Round? currentRound = values[3];

      if (currentRound == null) return false;

      return !getIt.get<UserService>().isObserver &&
          _roundService.isActivePlayer(
              activePlayerSocketId, game.players.getLocalPlayer().socketId) &&
          currentRound.socketIdOfActivePlayer == activePlayerSocketId &&
          !game.isOver &&
          !isActionBeingProcessed;
    });
  }
}
