import 'package:mobile/classes/actions/action-exchange.dart';
import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/classes/tile/tile-state.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:rxdart/rxdart.dart';

class TileRack {
  final GameEventService _gameEventService = getIt.get<GameEventService>();
  final BehaviorSubject<List<Tile>> _tiles;
  final BehaviorSubject<bool> _isExchangeModeEnabled$;

  TileRack({List<Tile> tiles = const []})
      : _tiles = BehaviorSubject.seeded(tiles),
        _isExchangeModeEnabled$ = BehaviorSubject.seeded(false) {
    _gameEventService.listen<TilePlacement>(PLACE_TILE_ON_BOARD, (placement) {
      removeTile(placement.tile);
    });
  }

  ValueStream<List<Tile>> get stream {
    return _tiles.stream;
  }

  ValueStream<bool> get isExchangeModeEnabled {
    return _isExchangeModeEnabled$.stream;
  }

  Stream<List<Tile>> get selectedTilesStream => stream.map((List<Tile> tiles) =>
      tiles.where((Tile tile) => tile.isSelectedForExchange).toList());

  List<Tile> get selectedTiles {
    return stream.value
        .where((Tile tile) => tile.isSelectedForExchange)
        .toList();
  }

  TileRack setTiles(List<Tile> tiles, {bool overrideState = true}) {
    _tiles.add(overrideState
        ? [
            ...tiles
                .map((t) => t.copy().withState(TileState.defaultState))
                .toList()
          ]
        : [...tiles]);
    return this;
  }

  TileRack addTiles(List<Tile> tiles) {
    _tiles.add([..._tiles.value, ...tiles]);
    return this;
  }

  TileRack removeTile(Tile tile) {
    List<Tile> tiles = _tiles.value;

    tiles.remove(tile);
    setTiles(tiles);
    return this;
  }

  placeTile(Tile tile, {int? from, int? to}) {
    List<Tile> tiles = _tiles.value;

    if (to != null) {
      int computedFrom = from ?? tiles.indexOf(tile);
      // If it was not in the tilerack
      if (computedFrom < 0 || tile.state == TileState.notApplied) {
        // Add to tile rack
        tiles.insert(to + 1, tile);
      } else {
        // Move from within tile rack
        if (computedFrom > to) to = to + 1;

        if (computedFrom < to) {
          tiles.setRange(computedFrom, to, tiles, computedFrom + 1);
        } else {
          tiles.setRange(to + 1, computedFrom + 1, tiles, to);
        }
        tiles[to] = tile;
      }
    } else {
      tiles.add(tile);
    }

    setTiles(tiles);
  }

  shuffle() {
    var tiles = _tiles.value;
    tiles.shuffle();
    setTiles(tiles);
  }

  void toggleExchangeMode() {
    bool currentMode = isExchangeModeEnabled.value;
    _isExchangeModeEnabled$.add(!currentMode);

    if (!isExchangeModeEnabled.value) _resetSelectedTiles();
  }

  void disableExchangeMode() {
    _isExchangeModeEnabled$.add(false);
    _resetSelectedTiles();
  }

  void toggleSelectedTile(Tile tile) {
    tile.toggleIsSelected();
    setTiles(stream.value, overrideState: false);
  }

  ActionExchangePayload getSelectedTilesPayload() {
    return ActionExchangePayload(tiles: selectedTiles);
  }

  void _resetSelectedTiles() {
    setTiles(stream.value.map((Tile tile) {
      tile.unselectTile();
      return tile;
    }).toList());
  }
}
