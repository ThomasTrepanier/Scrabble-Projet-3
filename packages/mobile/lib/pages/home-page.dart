import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/image.dart';
import 'package:mobile/components/puzzle/start-practice-puzzle-dialog.dart';
import 'package:mobile/components/puzzle/start-puzzle-dialog.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:url_launcher/url_launcher.dart';

import '../constants/home-page.constants.dart';
import '../constants/login-constants.dart';
import '../locator.dart';

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MyScaffold(
      title: "Accueil",
      body: Container(
        constraints: BoxConstraints.expand(),
        decoration: BoxDecoration(
            image: DecorationImage(
          opacity: 0.3,
          image: AssetImage(BACKGROUND_PATH),
          fit: BoxFit.cover,
        )),
        child: Center(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 100, bottom: 80),
                child: AppImage(
                  src: getIt
                      .get<ThemeColorService>()
                      .themeDetails
                      .value
                      .logoPath,
                  height: 100,
                ),
              ),
              SizedBox(
                width: 250,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppButton(
                      onPressed: () {
                        Navigator.pushNamed(context, CREATE_GAME);
                      },
                      size: AppButtonSize.large,
                      child: Text(CREATE_PAGE_MESSAGE,
                          style: TextStyle(color: Colors.white, fontSize: 18)),
                    ),
                    SizedBox(height: 10),
                    AppButton(
                      onPressed: () {
                        Navigator.pushNamed(context, GROUPS_ROUTE);
                      },
                      size: AppButtonSize.large,
                      child: Text(JOIN_PAGE_MESSAGE,
                          style: TextStyle(color: Colors.white, fontSize: 18)),
                    ),
                    SizedBox(height: 10),
                    AppButton(
                      onPressed: () {
                        _handleStartPuzzle(context);
                      },
                      size: AppButtonSize.large,
                      child: Text(PUZZLE_TITLE,
                          style: TextStyle(color: Colors.white, fontSize: 18)),
                    ),
                    SizedBox(height: 10),
                    AppButton(
                      onPressed: () {
                        Navigator.pushNamed(context, LEADERBOARD_ROUTE);
                      },
                      size: AppButtonSize.large,
                      child: Text(LEADERBOARD_MESSAGE,
                          style: TextStyle(color: Colors.white, fontSize: 18)),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 30),
              Text('Équipe 103', style: TextStyle(fontWeight: FontWeight.bold)),
              SizedBox(
                height: SPACE_2,
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    height: 32,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        tile('T', 'homas Trépanier',
                            'https://www.linkedin.com/in/thomas-tr%C3%A9panier/'),
                        tile('R', 'achad Chazbek',
                            'https://www.linkedin.com/in/rachad-chazbek-a06489212/'),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 32,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        tile('C', 'harles-François St-Cyr',
                            'https://www.linkedin.com/in/cfstcyr/'),
                        tile('A', 'hmed Mewloud',
                            'https://www.linkedin.com/in/ahmed-mewloud-b0a481195/'),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 32,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        tile('R', 'aphael Salvas',
                            'https://www.linkedin.com/in/raphael-salvas/'),
                        tile('A', 'mine Bourdache',
                            'https://www.linkedin.com/in/bourdache-amine-26b67a22a/'),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

_launchURL(String link) async {
  final uri = Uri.parse(link);
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri);
  } else {
    throw 'Could not launch $link';
  }
}

Widget tile(String letter, String name, String link) {
  return TextButton(
    style: TextButton.styleFrom(
      minimumSize: Size.zero,
      padding: EdgeInsets.symmetric(vertical: SPACE_1, horizontal: SPACE_2),
    ),
    onPressed: () => _launchURL(link),
    child: Row(children: [
      Tile(
        tile: c.Tile(letter: letter),
        size: 20,
      ),
      SizedBox(width: 2),
      Text(
        name,
        style: TextStyle(color: Colors.black),
      ),
    ]),
  );
}

void _handleStartPuzzle(BuildContext context) {
  showStartPuzzleDialog(context);
}
