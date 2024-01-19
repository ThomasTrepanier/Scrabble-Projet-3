import 'package:flutter/material.dart';
import 'package:mobile/services/group-join.service.dart';

import '../../classes/group.dart';
import '../../constants/locale/group-selection-constants.dart';
import '../../locator.dart';
import '../../services/user.service.dart';
import '../../view-methods/group.methods.dart';
import 'individual-group.dart';

class GroupSelection extends StatelessWidget {
  GroupSelection({
    super.key,
  });

  final GroupJoinService groupJoinService = getIt.get<GroupJoinService>();
  Future<bool> joinGroup(
      String groupId, String password, bool isObserver) async {
    getIt<UserService>().isObserver = isObserver;
    return await groupJoinService.handleJoinGroup(
        groupId, password, isObserver);
  }

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    return Container(
      margin: EdgeInsets.fromLTRB(128, 64, 128, 64),
      decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: theme.colorScheme.onBackground, width: 2),
          borderRadius: BorderRadius.all(Radius.circular(20))),
      child: handleLobbyListChange(context, joinGroup),
    );
  }
}

StreamBuilder<List<Group>> handleLobbyListChange(
    BuildContext context, Function joinGroupFunction) {
  var theme = Theme.of(context);
  return StreamBuilder<List<Group>>(
    stream: groupStream,
    builder: (BuildContext context, AsyncSnapshot<List<Group>> snapshot) {
      if (!snapshot.hasData) {
        return CircularProgressIndicator();
      }
      if (snapshot.hasError) {
        return SizedBox.shrink();
      }

      List<Group> groups = snapshot.data != null && snapshot.data!.isNotEmpty
          ? snapshot.data!
          : List<Group>.empty();

      return groups.isEmpty
          ? Center(
              child:
                  Text(NO_GAME_AVAILABLE, style: theme.textTheme.displaySmall),
            )
          : Padding(
              padding: const EdgeInsets.fromLTRB(16, 32, 16, 32),
              child: Center(
                  child: Scrollbar(
                radius: Radius.circular(4),
                thickness: 8,
                child: Padding(
                  padding: const EdgeInsets.only(right: 16),
                  child: ListView.builder(
                    itemCount: groups.length,
                    itemBuilder: (buildContext, i) => IndividualGroup(
                        theme: theme,
                        group: groups[i],
                        joinGroupFunction: joinGroupFunction),
                  ),
                ),
              )));
    },
  );
}
