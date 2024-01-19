import 'package:flutter/material.dart';
import 'package:mobile/classes/puzzle/puzzle-level.dart';
import 'package:mobile/constants/layout.constants.dart';

class PuzzleLevelWidget extends StatefulWidget {
  PuzzleLevelWidget({required this.puzzleLevel});

  final PuzzleLevel puzzleLevel;

  @override
  State<PuzzleLevelWidget> createState() => _PuzzleLevelWidgetState();
}

class _PuzzleLevelWidgetState extends State<PuzzleLevelWidget> {
  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(minWidth: 128),
      padding:
          const EdgeInsets.symmetric(horizontal: SPACE_3, vertical: SPACE_2),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: widget.puzzleLevel.icons
                .map((IconData icon) => Icon(
                      icon,
                      size: 32,
                    ))
                .toList(),
          ),
          SizedBox(
            height: SPACE_1,
          ),
          Text(
            widget.puzzleLevel.name,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          SizedBox(
            height: SPACE_1,
          ),
          Opacity(
              opacity: 0.54,
              child: Text(
                widget.puzzleLevel.description,
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ))
        ],
      ),
    );
  }
}

Widget generatePuzzleLevelWidget(PuzzleLevel level) =>
    PuzzleLevelWidget(puzzleLevel: level);
