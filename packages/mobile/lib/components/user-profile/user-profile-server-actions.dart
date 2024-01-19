import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/classes/server-action.dart';
import 'package:mobile/components/table.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/user.service.dart';

class UserProfileServerActions extends StatelessWidget {
  final UserService _userService = getIt.get<UserService>();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(SPACE_3),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Historique d\'actions',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.w500),
            ),
            FutureBuilder<List<ServerAction>>(
              future: _userService.getServerActions(),
              builder: (context, snapshot) => snapshot.hasData
                  ? AppTable(
                      data: snapshot.data!.map((action) {
                        action.timestamp =
                            action.timestamp.add(Duration(hours: 8));
                        return action;
                      }).toList(),
                      columns: [
                          AppTableColumn(
                            title: 'Date',
                            builder: (context, row) => Text(
                                DateFormat('d MMMM yyyy, h:mm:ss', 'fr')
                                    .format(row.data.timestamp)),
                          ),
                          AppTableColumn(
                            title: 'Action',
                            builder: (context, row) => Wrap(
                              spacing: SPACE_2,
                              children: row.data.actionType == 'login'
                                  ? [
                                      Icon(Icons.login_rounded),
                                      Text('Connexion'),
                                    ]
                                  : [
                                      Icon(Icons.logout_rounded),
                                      Text('Déconnexion'),
                                    ],
                            ),
                          )
                        ])
                  : snapshot.hasError
                      ? Text('Impossible de charge l\'historique des actions')
                      : Container(),
            )
          ],
        ),
      ),
    );
  }
}
