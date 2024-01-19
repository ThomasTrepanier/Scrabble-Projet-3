import 'package:flutter/material.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/user.service.dart';

import '../components/user-avatar.dart';
import '../routes/routes.dart';

class LeaderBoardPage extends StatelessWidget {
  UserService _userService = getIt.get<UserService>();

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);
    return MyScaffold(
      hasBackButton: true,
      backgroundColor: theme.colorScheme.background,
      title: "Classement Elo",
      body: Padding(
        padding: const EdgeInsets.all(15.0),
        child: SingleChildScrollView(
            child: Center(
          child: SizedBox(
            width: 600,
            child: Card(
              child: Column(
                children: [
                  SizedBox(height: 10),
                  Text(
                    'Classement des meilleurs utilisateurs',
                    style: TextStyle(fontSize: 19, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 15),
                  Padding(
                    padding: const EdgeInsets.only(
                        top: 8, left: 8, bottom: 8, right: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            SizedBox(width: 15),
                            Text('Rang'),
                            SizedBox(width: 15),
                            Text('Utilisateur'),
                          ],
                        ),
                        Text('Classement Elo'),
                      ],
                    ),
                  ),
                  Divider(
                    height: 5,
                    color: Colors.grey.shade300,
                  ),
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Padding(
                        padding: EdgeInsets.all(SPACE_2),
                        child: FutureBuilder(
                            future: _userService.requestRatingLeaderboard(),
                            builder: (context, users) => users.data != null &&
                                    users.data!.isNotEmpty
                                ? ListView.builder(
                                    scrollDirection: Axis.vertical,
                                    shrinkWrap: true,
                                    physics: NeverScrollableScrollPhysics(),
                                    itemCount: users.data!.length,
                                    itemBuilder: (_, int index) {
                                      return Container(
                                        decoration: BoxDecoration(
                                            border: _userService
                                                        .getUser()
                                                        .username ==
                                                    users.data![index].user
                                                        .username
                                                ? Border.all(
                                                    width: 1,
                                                    color: theme
                                                        .colorScheme.primary)
                                                : null,
                                            borderRadius: BorderRadius.all(
                                                Radius.circular(4.0))),
                                        child: Padding(
                                          padding: const EdgeInsets.all(8),
                                          child: InkWell(
                                            onTap: () {
                                              _userService.getProfileByUsername(
                                                  users.data![index].user
                                                      .username);
                                              Navigator.pushNamed(
                                                  context, PROFILE_ROUTE,
                                                  arguments:
                                                      users.data![index].user);
                                            },
                                            child: Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                Padding(
                                                  padding:
                                                      const EdgeInsets.only(
                                                          left: 8,
                                                          right: 8,
                                                          top: 4,
                                                          bottom: 4),
                                                  child: Row(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment.start,
                                                    children: [
                                                      handleUserRank(index),
                                                      SizedBox(width: 10),
                                                      Avatar(
                                                        avatar: users
                                                            .data![index]
                                                            .user
                                                            .avatar,
                                                        size: 48,
                                                        radius: 20,
                                                      ),
                                                      SizedBox(width: 10),
                                                      Text(users.data![index]
                                                          .user.username),
                                                    ],
                                                  ),
                                                ),
                                                Text(users.data![index].rating
                                                    .round()
                                                    .toString()),
                                              ],
                                            ),
                                          ),
                                        ),
                                      );
                                    })
                                : users.hasError
                                    ? handleTextResponse(
                                        "Une erreur s'est produite", Colors.red)
                                    : handleTextResponse('aucun résultat',
                                        Colors.grey.shade600)),
                      )
                    ],
                  ),
                ],
              ),
            ),
          ),
        )),
      ),
    );
  }
}

Widget handleUserRank(int index) {
  switch (index) {
    case (0):
      return Icon(Icons.star);
    case (1):
      return Icon(Icons.star_half);
    case (2):
      return Icon(Icons.star_border);
  }
  return Container(
    alignment: Alignment.center,
    width: 25,
    child: Text(
      "${index + 1}",
      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 19),
    ),
  );
}

Widget handleTextResponse(String text, Color color) {
  return SizedBox(
    width: 600,
    child: Padding(
      padding: const EdgeInsets.only(left: 8, right: 8, bottom: 8),
      child: Container(
        alignment: Alignment.center,
        decoration:
            BoxDecoration(borderRadius: BorderRadius.all(Radius.circular(4.0))),
        child: Padding(
          padding: const EdgeInsets.only(left: 8, right: 8, top: 4, bottom: 4),
          child: Text(text,
              style: TextStyle(color: color, fontWeight: FontWeight.bold)),
        ),
      ),
    ),
  );
}
