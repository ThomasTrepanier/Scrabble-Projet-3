import 'package:flutter/material.dart';
import 'package:mobile/classes/group.dart';

import '../classes/game-visibility.dart';
import '../components/group/group-management.dart';
import '../components/group/parameters.dart';
import '../components/group/player-waiting-list.dart';
import '../components/group/waiting-room.dart';
import '../components/scaffold-persistance.dart';
import '../view-methods/create-lobby-methods.dart';
import '../view-methods/group.methods.dart';

class CreateLobbyPage extends StatefulWidget {
  CreateLobbyPage({super.key, required this.group});

  final Group group;

  @override
  State<CreateLobbyPage> createState() => _CreateLobbyPageState();
}

class _CreateLobbyPageState extends State<CreateLobbyPage> {
  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);

    return MyScaffold(
      title: "Salle d'attente",
      body: FractionallySizedBox(
        widthFactor: 1,
        heightFactor: 1,
        child: Flex(
          direction: Axis.horizontal,
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Flexible(
              flex: 1,
              child: FractionallySizedBox(
                widthFactor:
                    widget.group.gameVisibility == GameVisibility.private
                        ? 0.75
                        : 0.5,
                heightFactor: 0.7,
                child: Container(
                  decoration: BoxDecoration(
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.5),
                          spreadRadius: 2,
                          blurRadius: 7,
                          offset: Offset(0, 3),
                        ),
                      ],
                      color: Colors.grey.shade200,
                      borderRadius: BorderRadius.all(Radius.circular(5.0))),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      children: <Widget>[
                        Text("Groupe de partie",
                            style: TextStyle(fontSize: 18)),
                        Expanded(
                          child: WaitingRoom(
                              virtualPlayerLevel:
                                  widget.group.virtualPlayerLevel),
                        ),
                        Row(children: <Widget>[
                          Expanded(
                            child: Divider(
                              height: 10,
                              thickness: 2,
                              indent: 5,
                              endIndent: 5,
                              color: Colors.grey.shade500,
                            ),
                          ),
                          Text("Paramètres de partie"),
                          Expanded(
                            child: Divider(
                              height: 10,
                              thickness: 2,
                              indent: 5,
                              endIndent: 5,
                              color: Colors.grey.shade500,
                            ),
                          ),
                        ]),
                        Parameters(
                            maxRoundTime: widget.group.maxRoundTime,
                            virtualPlayerLevel: widget.group.virtualPlayerLevel,
                            visibility: widget.group.gameVisibility),
                        StreamBuilder(
                            stream: currentGroupUpdateStream,
                            builder: (context, snapshot) {
                              Group group = snapshot.data ?? widget.group;
                              return Container(
                                width: 100,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                    color: theme.colorScheme.tertiary,
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(8))),
                                child: Padding(
                                  padding:
                                      const EdgeInsets.fromLTRB(16, 8, 16, 8),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.visibility),
                                      SizedBox(width: 8),
                                      Text(
                                        group.numberOfObservers.toString(),
                                        style: TextStyle(fontSize: 15),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }),
                        GroupManagement(widget.group),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(width: 50),
            widget.group.gameVisibility == GameVisibility.private
                ? Flexible(
                    flex: 1,
                    child: FractionallySizedBox(
                        widthFactor: 0.75,
                        heightFactor: 0.7,
                        child: Padding(
                          padding: EdgeInsets.only(
                              left: 0, right: 15.0, top: 0, bottom: 0),
                          child: Container(
                            decoration: BoxDecoration(
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.withOpacity(0.5),
                                    spreadRadius: 2,
                                    blurRadius: 7,
                                    offset: Offset(0, 3),
                                  ),
                                ],
                                color: Colors.grey.shade200,
                                borderRadius:
                                    BorderRadius.all(Radius.circular(1.0))),
                            child: Column(children: [
                              Text("Joueurs en attente",
                                  style: TextStyle(fontSize: 18)),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.all(10),
                                  child: Container(
                                    decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.all(
                                            Radius.circular(4))),
                                    child: PlayerWaitingList(
                                      playerListStream:
                                          playerWaitingList$.stream,
                                      isObserver: false,
                                    ),
                                  ),
                                ),
                              ),
                              Text("Observateurs en attente",
                                  style: TextStyle(fontSize: 18)),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.all(10),
                                  child: Container(
                                    decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.all(
                                            Radius.circular(4))),
                                    child: PlayerWaitingList(
                                      playerListStream:
                                          observerWaitingList$.stream,
                                      isObserver: true,
                                    ),
                                  ),
                                ),
                              ),
                            ]),
                          ),
                        )),
                  )
                : Container(),
          ],
        ),
      ),
    );
  }
}
