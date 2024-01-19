import 'dart:math';

import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/animation/wiggle.dart';
import 'package:mobile/constants/assets.constants.dart';
import 'package:mobile/constants/game.constants.dart';

class Tile extends StatelessWidget {
  Tile({
    this.tile,
    this.size = 40,
    this.shouldWiggle = false,
  });

  final c.Tile? tile;

  final double size;

  final bool shouldWiggle;


  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: _getOpacity(),
      child: Wiggle(
          active: shouldWiggle,
          amount: 0.025,
          speed: Duration(milliseconds: 125),
          child: Stack(
            children: [
              Container(
                height: size,
                width: size,
                decoration: BoxDecoration(
                  color: Colors.orange,
                  borderRadius: BorderRadius.all(Radius.circular(6 * size / 40)),
                ),
                clipBehavior: Clip.antiAlias,
                child: ColorFiltered(
                  colorFilter: ColorFilter.mode(_getTintColor(), BlendMode.color),
                  child: Image.asset(
                    ASSET_TILE,
                    height: size,
                    width: size,
                  ),
                ),
              ),
              SizedBox(
                  width: size,
                  height: size,
                  child: Stack(
                    children: [
                      Container(
                        transform: tile?.value != null
                            ? Matrix4.translationValues(-1, -1, 0)
                            : Matrix4.translationValues(0, 0, 0),
                        child: LayoutBuilder(
                          builder: (context, constraints) => Center(
                            child: Text(
                              tile != null
                                  ? (tile!.isWildcard &&
                                  tile?.playedLetter != null
                                  ? (tile!.playedLetter ?? '')
                                  : (tile!.letter ?? ''))
                                  : '',
                              textScaleFactor:
                              max(0.8, constraints.maxWidth / TILE_SIZE),
                              style: TextStyle(
                                color: (tile?.isWildcard ?? false)
                                    ? Colors.red
                                    : Color.fromRGBO(80, 55, 10, 1),
                                fontWeight: FontWeight.w600,
                                fontSize: size / 1.7,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Container(
                        width: double.maxFinite,
                        padding: EdgeInsets.only(
                          bottom: 2,
                          right: 4,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            LayoutBuilder(
                              builder: (context, constraints) => Text(
                                _getDisplayValue(tile),
                                textScaleFactor:
                                max(0.8, constraints.maxWidth / TILE_SIZE),
                                style: TextStyle(
                                  fontSize: size / 3.5,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            )
                          ],
                        ),
                      )
                    ],
                  ))
            ],
          )),
    );
  }

  String _getDisplayValue(c.Tile? tile) {
    return '${tile?.value != null && tile!.value != 0 ? tile.value : ''}';
  }

  Color _getTintColor() {
    return tile?.state.tint ?? Colors.transparent;
  }

  double _getOpacity() {
    return tile?.state.opacity ?? 1.0;
  }
}

