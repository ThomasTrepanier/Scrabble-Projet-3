import 'dart:async';
import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:rxdart/rxdart.dart';

class GameEventService {
  final Map<String, Subject> _events;

  static final GameEventService _instance = GameEventService._();

  factory GameEventService() {
    return _instance;
  }

  GameEventService._() : _events = {} {
    _events[PLACE_TILE_ON_BOARD] = PublishSubject<TilePlacement>();
    _events[REMOVE_TILE_FROM_BOARD] = PublishSubject<TilePlacement>();
    _events[PUT_BACK_TILES_ON_TILE_RACK] = PublishSubject<void>();
    _events[CLEAR_PLACEMENT] = PublishSubject<void>();
    _events[CLEAR_SYNCED_TILES] = PublishSubject<void>();
    /// Uncomment to log events
    // for (var entry in _events.entries) {
    //   entry.value.listen((value) {
    //     log('\x1b[1m\x1b[3m<< Game event >>\x1b[0m ${entry.key}: $value');
    //   });
    // }
  }

  StreamSubscription<T> listen<T>(
    String key,
    void Function(T)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    return _getSubject<T>(key).listen(onData,
        onError: onError, onDone: onDone, cancelOnError: cancelOnError);
  }

  void add<T>(String key, T value) {
    _getSubject<T>(key).add(value);
  }

  Subject<T> _getSubject<T>(String key) {
    var subject = _events[key];

    if (subject == null) {
      throw Exception(
          'Could not get game event: Game event "$key" does not exists');
    }

    return subject as Subject<T>;
  }
}
