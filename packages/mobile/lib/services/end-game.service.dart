import 'package:rxdart/rxdart.dart';

class EndGameService {
  BehaviorSubject<bool> _isOver$ = BehaviorSubject<bool>.seeded(false);
  BehaviorSubject<List<String>> winners$ =
      BehaviorSubject<List<String>>.seeded([]);

  EndGameService._privateConstructor();

  static final EndGameService _instance = EndGameService._privateConstructor();

  Stream<bool> get endGameStream => _isOver$.stream;

  factory EndGameService() {
    return _instance;
  }

  void resetEndGame() {
    _isOver$ = BehaviorSubject<bool>.seeded(false);
    winners$ = BehaviorSubject<List<String>>.seeded([]);
  }

  void setEndGame(bool value, List<String> winners) {
    _isOver$.add(value);
    winners$.add(winners);
  }
}
