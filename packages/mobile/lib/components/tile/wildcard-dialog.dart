import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/constants/layout.constants.dart';

Future<String> triggerWildcardDialog(BuildContext context,
    {required Square square}) async {
  return showDialog<String>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(CHOOSE_LETTER_FOR_WILDCARD),
          surfaceTintColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          content: SizedBox(
            width: 400,
            child: Wrap(
              alignment: WrapAlignment.center,
              spacing: SPACE_1,
              runSpacing: SPACE_1,
              children: ALPHABET
                  .split('')
                  .map((letter) => InkWell(
                        onTap: () {
                          Navigator.of(context).pop(letter);
                        },
                        child: Tile(
                          tile: c.Tile(letter: letter),
                        ),
                      ))
                  .toList(),
            ),
          ),
        );
      }).then((String? playedLetter) {
        if (playedLetter == null) throw Exception('Must choose letter for wildcard');
    return playedLetter;
  });
}
