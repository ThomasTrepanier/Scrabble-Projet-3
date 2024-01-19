import 'dart:async';

import 'package:mobile/classes/rounds/round.dart';
import 'package:rxdart/rxdart.dart';

class RoundService {
  final Subject<Duration> _startRound$ = PublishSubject();
  final Subject _endRound$ = PublishSubject();
  final Subject _roundTimeout$ = PublishSubject();
  late DateTime startTime;
  late Duration elapsed;
  BehaviorSubject<Round?> currentRound$ = BehaviorSubject.seeded(null);

  RoundService._privateConstructor();

  Stream<Duration> get startRoundEvent => _startRound$.stream;
  Stream<void> get endRoundEvent => _endRound$.stream;
  Stream<void> get roundTimeoutStream => _roundTimeout$.stream;
  ValueStream<Round?> get currentRoundStream => currentRound$.stream;

  StreamSubscription<void>? roundTimeoutSubscription;

  String? _localPlayerId;

  Round get currentRound {
    if (currentRound$.value == null) throw Exception('No current round');

    return currentRoundStream.value!;
  }

  static final RoundService _instance = RoundService._privateConstructor();

  factory RoundService() {
    return _instance;
  }

  Stream<String> getActivePlayerId() {
    return Stream.value(currentRound.socketIdOfActivePlayer);
  }

  bool isActivePlayer(String currentActivePlayerSocketId, String socketId) {
    return currentActivePlayerSocketId == socketId;
  }

  void setLocalPlayerId(String? localPlayerId) {
    _localPlayerId = localPlayerId;
  }

  void startRound(Round round, Function timerExpiresCallback) async {
    startTime = DateTime.now();
    currentRound$.add(round);

    await roundTimeoutSubscription?.cancel();

    roundTimeoutSubscription = roundTimeoutStream.listen((event) {
      timerExpiresCallback();
    });
    _startRound$.add(round.duration);
  }

  void endRound() {
    _endRound$.add(null);
  }

  void roundTimeout() {
    _roundTimeout$.add(null);
  }

  getStartRoundDate() {
    return startTime;
  }

  void updateRoundData(Round round, Function timerExpiresCallback) {
    endRound();
    startRound(round, timerExpiresCallback);
  }
}
