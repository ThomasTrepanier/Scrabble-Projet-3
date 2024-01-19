import 'package:flutter/material.dart';
import 'package:mobile/classes/text-field-handler.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/user.service.dart';
import 'package:rxdart/rxdart.dart';

import '../components/user-avatar.dart';
import '../routes/routes.dart';

class ProfileSearchPage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => ProfileEditPageState();
}

class ProfileEditPageState extends State<ProfileSearchPage> {
  UserService _userService = getIt.get<UserService>();

  bool isFirstSubmit = true;
  BehaviorSubject<String?> _currentSearchQuery$ = BehaviorSubject.seeded(null);
  Stream<String?> _currentSearchQuery = Stream.empty();

  final userSearchHandler = TextFieldHandler();

  @override
  void initState() {
    super.initState();

    _currentSearchQuery = _currentSearchQuery$
        .distinct()
        .debounceTime(Duration(milliseconds: 300));
  }

  @override
  void dispose() {
    super.dispose();
  }

  void _handleSearchQueryChanged(String value) {
    _currentSearchQuery$.add(value.isNotEmpty ? value : null);
  }

  PublicUser _castAsPublicUser(UserSearchItem user) {
    return PublicUser(username: user.username, avatar: user.avatar);
  }

  @override
  Widget build(BuildContext context) {
    return MyScaffold(
      hasBackButton: true,
      title: "Recherche d'utilisateur",
      body: SingleChildScrollView(
          child: Container(
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              width: 600,
              child: Center(
                child: Padding(
                  padding: EdgeInsets.all(SPACE_3),
                  child: Column(children: [
                    Card(
                        child: Padding(
                      padding: EdgeInsets.all(SPACE_2),
                      child: Wrap(
                        runSpacing: SPACE_4,
                        children: [
                          TextField(
                            controller: userSearchHandler.controller,
                            focusNode: userSearchHandler.focusNode,
                            onChanged: _handleSearchQueryChanged,
                            obscureText: false,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: 'Recherche...',
                              fillColor: Colors.grey.shade300,
                              errorText: userSearchHandler.errorMessage.isEmpty
                                  ? null
                                  : userSearchHandler.errorMessage,
                            ),
                          ),
                        ],
                      ),
                    )),
                    SizedBox(
                      height: 10,
                    ),
                    Card(
                        child: Padding(
                      padding: EdgeInsets.all(SPACE_2),
                      child: StreamBuilder<String?>(
                          stream: _currentSearchQuery,
                          builder: (context, query) {
                            return FutureBuilder(
                                future: _userService.searchUsers(query.data),
                                builder: (context, users) => users.data !=
                                            null &&
                                        users.data!.isNotEmpty
                                    ? ListView.builder(
                                        scrollDirection: Axis.vertical,
                                        shrinkWrap: true,
                                        physics: NeverScrollableScrollPhysics(),
                                        itemCount: users.data!.length,
                                        itemBuilder: (_, int index) {
                                          return Padding(
                                            padding: const EdgeInsets.only(
                                                left: 8, right: 8, bottom: 8),
                                            child: Container(
                                              decoration: BoxDecoration(
                                                  borderRadius:
                                                      BorderRadius.all(
                                                          Radius.circular(
                                                              4.0))),
                                              child: InkWell(
                                                onTap: () {
                                                  _userService
                                                      .getProfileByUsername(
                                                          users.data![index]
                                                              .username);
                                                  Navigator.pushNamed(
                                                      context, PROFILE_ROUTE,
                                                      arguments:
                                                          _castAsPublicUser(
                                                              users.data![
                                                                  index]));
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
                                                            MainAxisAlignment
                                                                .start,
                                                        children: [
                                                          Avatar(
                                                            avatar: users
                                                                .data![index]
                                                                .avatar,
                                                            size: 48,
                                                            radius: 20,
                                                          ),
                                                          SizedBox(width: 10),
                                                          Text(users
                                                              .data![index]
                                                              .username),
                                                        ],
                                                      ),
                                                    ),
                                                    Icon(Icons
                                                        .arrow_forward_ios_outlined)
                                                  ],
                                                ),
                                              ),
                                            ),
                                          );
                                        })
                                    : users.hasError
                                        ? handleTextResponse(
                                            "Une erreur s'est produite",
                                            Colors.red)
                                        : users.data != null &&
                                                users.data!.isEmpty &&
                                                query.data != null &&
                                                query.data!.isNotEmpty
                                            ? handleTextResponse(
                                                'aucun résultat pour "${query.data}"',
                                                Colors.grey.shade600)
                                            : handleTextResponse(
                                                'Commencez à entrer un pseudonyme',
                                                Colors.grey.shade600));
                          }),
                    ))
                  ]),
                ),
              ),
            )
          ],
        ),
      )),
    );
  }
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
