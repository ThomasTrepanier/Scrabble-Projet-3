import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/classes/tile/tile-state.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/controllers/tile-synchronisation-controller.dart';
import 'package:mobile/locator.dart';
import 'package:rxdart/rxdart.dart';

class TileSynchronisationService {
  final TileSynchronisationController _tileSynchronisationController =
      getIt.get<TileSynchronisationController>();

  TileSynchronisationService._privateConstructor() {
    _tileSynchronisationController.synchronisedTiles.listen(
        (List<TilePlacement> tilePlacements) =>
            _synchronisedTiles$.add(tilePlacements));
  }

  final PublishSubject<List<TilePlacement>> _synchronisedTiles$ =
      PublishSubject();

  Stream<List<TilePlacement>> get synchronisedTiles =>
      _synchronisedTiles$.stream.doOnData(
          (List<TilePlacement> tilePlacements) =>
              tilePlacements.map((TilePlacement tilePlacement) {
                tilePlacement.tile =
                    tilePlacement.tile.withState(TileState.synced);
                return tilePlacement;
              }).toList());

  void sendPlacementForSynchronisation(Placement placement) async {
    await _tileSynchronisationController.sendSyncedTilePlacement(placement.tiles);
  }

  static final TileSynchronisationService _instance =
      TileSynchronisationService._privateConstructor();

  factory TileSynchronisationService() {
    return _instance;
  }
}
