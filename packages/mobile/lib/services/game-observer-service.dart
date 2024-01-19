import 'package:mobile/services/tile-synchronisation.service.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/game/players_container.dart';
import '../classes/tile/tile-placement.dart';
import '../classes/tile/tile.dart';
import '../locator.dart';

class GameObserverService {
  late BehaviorSubject<List<Tile>> _tiles =
      BehaviorSubject<List<Tile>>.seeded([]);
  late BehaviorSubject<List<Tile>> _syncedTiles =
      BehaviorSubject<List<Tile>>.seeded([]);
  late BehaviorSubject<int> _observedPlayerIndex =
      BehaviorSubject<int>.seeded(1);
  late BehaviorSubject<String> activePlayerId =
      BehaviorSubject<String>.seeded('');
  late BehaviorSubject<PlayersContainer> playersContainer =
      BehaviorSubject<PlayersContainer>();

  final TileSynchronisationService _tileSyncService =
      getIt.get<TileSynchronisationService>();

  GameObserverService._()
      : _tiles = BehaviorSubject<List<Tile>>.seeded([]),
        _syncedTiles = BehaviorSubject<List<Tile>>.seeded([]),
        _observedPlayerIndex = BehaviorSubject<int>.seeded(1) {
    setPlayerTileRack(_observedPlayerIndex.value);
    playersContainer.stream.listen((_) {
      syncActiveTiles([]);
    });

    _tileSyncService.synchronisedTiles.listen(
        (List<TilePlacement> synchronisedTiles) =>
            syncActiveTiles(synchronisedTiles));
  }

  static final GameObserverService _instance = GameObserverService._();

  factory GameObserverService() {
    return _instance;
  }

  ValueStream<List<Tile>> get tilesStream => _tiles.stream;
  ValueStream<int> get observedPlayerIndexStream => _observedPlayerIndex.stream;

  void setPlayerTileRack(int playerNumber) {
    if (!playersContainer.hasValue) return;
    List<Tile> tilesToShow = activePlayerId.value !=
            playersContainer.value.getPlayer(playerNumber).socketId
        ? [...playersContainer.value.getPlayer(playerNumber).tiles]
        : [..._syncedTiles.value];
    _tiles.add(tilesToShow);
    _observedPlayerIndex.add(playerNumber);
  }

  void syncActiveTiles(List<TilePlacement> synchronisedTiles) {
    List<Tile> currentPlayerTilesCopy = playersContainer.value
            .getPlayerBySocketId(activePlayerId.value)
            .tiles ??
        [];
    List<Tile> currentPlayerTiles = [...currentPlayerTilesCopy];

    List<TilePlacement> syncTilePlacements = [...synchronisedTiles];
    List<Tile> syncTiles =
        syncTilePlacements.map((placement) => placement.tile).toList();
    List<Tile> shownTiles = [...currentPlayerTiles];
    syncTiles.forEach((syncedTile) {
      if (shownTiles.contains(syncedTile)) shownTiles.remove(syncedTile);
    });
    _syncedTiles.add(shownTiles);
    setPlayerTileRack(_observedPlayerIndex.value);
  }
}
