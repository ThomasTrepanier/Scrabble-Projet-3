import 'package:flutter/material.dart';
import 'package:mobile/classes/achievements.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/components/user-profile/user-profile-achievements.dart';
import 'package:mobile/components/user-profile/user-profile-game-history.dart';
import 'package:mobile/components/user-profile/user-profile-info.dart';
import 'package:mobile/components/user-profile/user-profile-server-actions.dart';
import 'package:mobile/components/user-profile/user-profile-statistics.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/puzzle-constants.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/game-history.dart';
import '../classes/user.dart';
import '../constants/user-constants.dart';
import '../locator.dart';
import '../services/user.service.dart';

class ProfilePage extends StatefulWidget {
  ProfilePage({super.key, required this.userSearchResult});

  final PublicUser userSearchResult;

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final UserService _userService = getIt.get<UserService>();
  bool isLocalUser = false;
  String title = '';

  Stream<PublicUser?> userToShow = Stream.empty();

  BehaviorSubject<UserStatistics> statistics$ =
      BehaviorSubject.seeded(DEFAULT_USER_STATISTICS);
  BehaviorSubject<List<GameHistory>> gameHistory$ = BehaviorSubject.seeded([]);
  BehaviorSubject<List<UserAchievement>> achievements$ =
      BehaviorSubject.seeded([]);

  @override
  void initState() {
    super.initState();

    userToShow = _userService.user.switchMap((PublicUser? user) {
      if (user?.username == widget.userSearchResult.username) {
        title = 'Mon profil';
        isLocalUser = true;
        _userService
            .getUserStatistics()
            .then((event) => statistics$.add(event));
        _userService.getGameHistory().then((event) => gameHistory$.add(event));
        _userService
            .getAchievements()
            .then((event) => achievements$.add(event));
        return Stream.value(user);
      } else {
        title = 'Profil de ${widget.userSearchResult.username}';
        _userService
            .getProfileByUsername(widget.userSearchResult.username)
            .then((value) {
          statistics$.add(value.statistics);
          gameHistory$.add(value.gameHistory);
          achievements$.add(value.achievements);
        });
        return Stream.value(widget.userSearchResult);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<dynamic>(
        stream: _userProfilePageStream(),
        builder: (context, snapshot) {
          PublicUser user = snapshot.hasData ? snapshot.data![0] : UNKNOWN_USER;
          UserStatistics statistics =
              snapshot.hasData ? snapshot.data[1] : DEFAULT_USER_STATISTICS;
          List<GameHistory> gameHistories =
              snapshot.hasData ? snapshot.data[2] : [];
          List<UserAchievement> achievements =
              snapshot.hasData ? snapshot.data[3] : [];

          return MyScaffold(
            title: title,
            isLocalProfile: isLocalUser,
            hasBackButton: true,
            body: Container(
              color: Colors.grey.shade100,
              child: SingleChildScrollView(
                  child: Container(
                padding: EdgeInsets.all(SPACE_3),
                child: Column(children: [
                  UserProfileInfo(user: user, isLocalUser: isLocalUser),
                  UserProfileStatistics(statistics: statistics),
                  UserProfileAchievements(achievements: achievements),
                  UserProfileGameHistory(
                      gameHistories: gameHistories, isLocalUser: isLocalUser),
                  isLocalUser ? UserProfileServerActions() : Container(),
                ]),
              )),
            ),
          );
        });
  }

  Stream<dynamic> _userProfilePageStream() {
    return CombineLatestStream<dynamic, dynamic>([
      userToShow,
      statistics$.stream,
      gameHistory$.stream,
      achievements$.stream
    ], (values) => values);
  }
}
