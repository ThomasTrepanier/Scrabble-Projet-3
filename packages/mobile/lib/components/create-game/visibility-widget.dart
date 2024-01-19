import 'package:flutter/material.dart';
import 'package:mobile/components/create-game/game-visibility-toggle.dart';
import 'package:mobile/constants/layout.constants.dart';

class VisibilityWidget extends StatelessWidget {
  VisibilityWidget({required this.visibility});

  final GameVisibilityToggle visibility;

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
          Center(
            child: Icon(
              visibility.icon,
              size: 32,
            ),
          ),
          SizedBox(
            height: SPACE_1,
          ),
          Text(
            visibility.nameEnum.visibilityName,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          SizedBox(
            height: SPACE_1,
          )
        ],
      ),
    );
  }
}

Widget generateVisibilityWidget(GameVisibilityToggle level) =>
    VisibilityWidget(visibility: level);
