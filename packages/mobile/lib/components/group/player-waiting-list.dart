import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/error-pop-up.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/avatars-constants.dart';
import 'package:mobile/constants/user-constants.dart';
import 'package:rxdart/rxdart.dart';

import '../../constants/create-lobby-constants.dart';
import '../../view-methods/create-lobby-methods.dart';

class PlayerWaitingList extends StatefulWidget {
  const PlayerWaitingList(
      {super.key, required this.playerListStream, required this.isObserver});

  final ValueStream<List<PublicUser>> playerListStream;
  final bool isObserver;

  @override
  State<PlayerWaitingList> createState() => _PlayerWaitingListState();
}

class _PlayerWaitingListState extends State<PlayerWaitingList> {
  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    var style = theme.textTheme.displayMedium!.copyWith(
      color: theme.colorScheme.onPrimary,
    );
    return StreamBuilder<List<PublicUser>>(
        stream: widget.playerListStream,
        builder: (context, snapshot) {
          return Container(
            child: ListView.builder(
              itemCount: snapshot.data?.length ?? 0,
              itemBuilder: (_, int index) {
                return Padding(
                  padding: EdgeInsets.only(
                      left: 15.0, right: 15.0, top: 5.0, bottom: 5.0),
                  child: Container(
                    decoration: BoxDecoration(
                        color: theme.colorScheme.primaryContainer,
                        borderRadius: BorderRadius.all(Radius.circular(10.0))),
                    child: Row(
                      children: <Widget>[
                        Padding(
                          padding: EdgeInsets.only(
                              left: 15.0, right: 0, top: 10.0, bottom: 10.0),
                          child: Avatar(
                            avatar: snapshot.data![index].avatar,
                            initials: getUsersInitials(
                                snapshot.data![index].username),
                            size: LOBBY_AVATAR_SIZE,
                            radius: LOBBY_AVATAR_RADIUS,
                          ),
                        ),
                        Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(
                                left: 15.0, right: 5.0, top: 0, bottom: 0),
                            child: Text(
                              snapshot.data![index].username,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(fontSize: 16),
                            ),
                          ),
                        ),
                        Padding(
                          padding: EdgeInsets.only(
                              left: 5.0, right: 5.0, top: 0, bottom: 0),
                          child: Container(
                            child: IconButton(
                              onPressed: () {
                                setState(() async {
                                  bool isAccepted = await addPlayerToLobby(
                                      snapshot.data![index], widget.isObserver);
                                  if (!isAccepted) {
                                    if (context.mounted) {
                                      errorSnackBar(context, FULL_LOBBY_ERROR);
                                    }
                                  }
                                });
                              },
                              icon: Icon(Icons.check),
                              style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.grey.shade200,
                                  foregroundColor: Colors.green.shade900,
                                  shape: CircleBorder()),
                            ),
                          ),
                        ),
                        Padding(
                          padding: EdgeInsets.only(
                              left: 5.0, right: 15.0, top: 0, bottom: 0),
                          child: IconButton(
                            onPressed: () {
                              setState(() {
                                refusePlayer(
                                    snapshot.data![index], widget.isObserver);
                              });
                            },
                            icon: Icon(Icons.clear_outlined),
                            style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.grey.shade200,
                                foregroundColor: Colors.black,
                                shape: CircleBorder()),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        });
  }
}
