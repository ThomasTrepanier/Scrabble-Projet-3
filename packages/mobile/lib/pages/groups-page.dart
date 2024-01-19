import 'package:flutter/material.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/services/group-join.service.dart';

import '../components/group/group-selection.dart';
import '../constants/locale/group-selection-constants.dart';
import '../locator.dart';

class GroupPage extends StatefulWidget {
  @override
  State<GroupPage> createState() => _GroupPageState();
}

class _GroupPageState extends State<GroupPage> {
  GroupJoinService groupJoinService = getIt.get<GroupJoinService>();

  @override
  void initState() {
    groupJoinService.getGroups();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return MyScaffold(
      title: JOIN_GAME,
      hasBackButton: true,
      body: Center(child: GroupSelection()),
      backgroundColor: theme.colorScheme.background,
    );
  }
}
