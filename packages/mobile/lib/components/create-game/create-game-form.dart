// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:mobile/classes/game-visibility.dart';
import 'package:mobile/classes/text-field-handler.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/classes/virtual-player-level.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/create-game/virtual-player-level-widget.dart';
import 'package:mobile/components/create-game/visibility-widget.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/game-creation-service.dart';
import 'package:mobile/services/user.service.dart';
import 'package:mobile/utils/duration-format.dart';
import 'package:mobile/view-methods/create-lobby-methods.dart';
import 'package:rxdart/rxdart.dart';

import '../../classes/group.dart';
import '../../constants/create-account-constants.dart';
import '../../constants/create-game.constants.dart';
import '../app-toggle-button.dart';
import 'game-visibility-toggle.dart';
import 'virtual-player-toggle.dart';

class CreateGameForm extends StatefulWidget {
  @override
  CreateGameFormState createState() => CreateGameFormState();
}

@visibleForTesting
class CreateGameFormState extends State<CreateGameForm> {
  GameCreationService gameCreationService = getIt.get<GameCreationService>();
  UserService userService = getIt.get<UserService>();

  BehaviorSubject<Duration> _timePerTurn =
      BehaviorSubject<Duration>.seeded(Duration(minutes: 1));

  late PublicUser _user;
  late AppToggleButton<VirtualPlayerToggle, VirtualPlayerLevel>
      difficultyLevelSelector;
  late AppToggleButton<GameVisibilityToggle, GameVisibility> visibilitySelector;

  final BehaviorSubject<TextFieldHandler> _passwordHandler =
      BehaviorSubject<TextFieldHandler>.seeded(TextFieldHandler());
  final BehaviorSubject<bool> _pressed = BehaviorSubject<bool>.seeded(false);
  @override
  void initState() {
    super.initState();
    _user = userService.getUser();
    difficultyLevelSelector =
        AppToggleButton<VirtualPlayerToggle, VirtualPlayerLevel>(
            defaultValue: VirtualPlayerLevel.beginner,
            optionsToValue: DIFFICULTY_LEVELS,
            toggleOptionWidget: generateDifficultyLevelWidget);
    visibilitySelector = AppToggleButton<GameVisibilityToggle, GameVisibility>(
        defaultValue: GameVisibility.public,
        optionsToValue: VISIBILITY_LEVELS,
        toggleOptionWidget: generateVisibilityWidget);
    _pressed.add(false);
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: SPACE_3),
        child: Column(
          children: [
            Container(
              width: 600,
              constraints: BoxConstraints(minHeight: 400),
              child: Card(
                child: Padding(
                  padding: EdgeInsets.all(SPACE_3),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Wrap(
                        runSpacing: SPACE_2,
                        children: [
                          Text(VP_LEVEL_FIELD_TITLE_FR,
                              style: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.w600)),
                          Center(child: difficultyLevelSelector),
                          SizedBox(width: 600, height: 10),
                          Text(VISIBILITY_FIELD_TITLE_FR,
                              style: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.w600)),
                          Center(child: visibilitySelector),
                          StreamBuilder(
                              stream: CombineLatestStream.list<dynamic>([
                                visibilitySelector.selectedStream,
                                _passwordHandler.stream
                              ]),
                              builder: (context, snapshot) {
                                if (snapshot.data == null) return Container();
                                String? visibility =
                                    snapshot.data![0].nameEnum.visibilityName;
                                TextFieldHandler passwordHandler =
                                    snapshot.data![1];

                                return Padding(
                                  padding: const EdgeInsets.only(top: SPACE_1),
                                  child: Visibility(
                                    visible: visibility ==
                                        GameVisibility.protected.visibilityName,
                                    child: TextField(
                                      controller: passwordHandler.controller,
                                      focusNode: passwordHandler.focusNode,
                                      keyboardType:
                                          TextInputType.visiblePassword,
                                      autocorrect: false,
                                      enableSuggestions: false,
                                      onChanged: (_) =>
                                          _passwordHandler.add(passwordHandler),
                                      decoration: InputDecoration(
                                        border: OutlineInputBorder(),
                                        labelText: PASSWORD_LABEL_FR,
                                        errorText:
                                            passwordHandler.errorMessage.isEmpty
                                                ? null
                                                : passwordHandler.errorMessage,
                                      ),
                                    ),
                                  ),
                                );
                              }),
                          SizedBox(width: 600, height: 10),
                          Text(ROUND_TIME_FIELD_TITLE_FR,
                              style: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.w600)),
                          StreamBuilder<Duration>(
                              stream: _timePerTurn.stream,
                              builder: (context, snapshot) {
                                Duration time =
                                    snapshot.data ?? _timePerTurn.value;
                                return Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      width: 300,
                                      padding: EdgeInsets.symmetric(
                                          horizontal: 16, vertical: 13),
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(3),
                                        border: Border.all(color: Colors.grey),
                                      ),
                                      child: Text(formatTime(time.inSeconds)),
                                    ),
                                    SizedBox(width: 10),
                                    Expanded(
                                      child: AppButton(
                                        icon: Icons.remove,
                                        size: AppButtonSize.large,
                                        onPressed: time > MIN_TIME
                                            ? () => _timePerTurn
                                                .add(time -= INCREMENT_TIME)
                                            : null,
                                      ),
                                    ),
                                    SizedBox(width: 10),
                                    Expanded(
                                      child: AppButton(
                                        icon: Icons.add,
                                        size: AppButtonSize.large,
                                        onPressed: time < MAX_TIME
                                            ? () => _timePerTurn
                                                .add(time += INCREMENT_TIME)
                                            : null,
                                      ),
                                    ),
                                  ],
                                );
                              }),
                        ],
                      ),
                      SizedBox(width: 600, height: 30),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          AppButton(
                              size: AppButtonSize.large,
                              onPressed: () {
                                Navigator.popUntil(
                                    context,
                                    (route) =>
                                        route.settings.name == HOME_ROUTE ||
                                        route.settings.name == BASE_ROUTE);
                              },
                              theme: AppButtonTheme.secondary,
                              text: CANCEL_CREATION_LABEL_FR),
                          StreamBuilder(
                              stream: isFormValid(),
                              builder: (context, snapshot) {
                                return AppButton(
                                    size: AppButtonSize.large,
                                    onPressed:
                                        snapshot.hasData && snapshot.data!
                                            ? () async {
                                                _pressed.add(true);
                                                await createGame().whenComplete(
                                                    () => _pressed.add(false));
                                              }
                                            : null,
                                    text: CREATE_GAME_LABEL_FR);
                              })
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> createGame() async {
    List<PublicUser> _users = [_user];
    String visibilityName =
        visibilitySelector.selectedValue?.nameEnum.visibilityName ??
            GameVisibility.public.visibilityName;
    Group groupData = Group(
      users: _users,
      maxRoundTime: _timePerTurn.value.inSeconds,
      virtualPlayerLevel: VirtualPlayerLevel.fromString(
          difficultyLevelSelector.selectedValue?.nameEnum.levelName ??
              VirtualPlayerLevel.beginner.levelName),
      gameVisibility: GameVisibility.fromString(visibilityName),
      password: visibilityName == GameVisibility.protected.visibilityName
          ? _passwordHandler.value.controller.text
          : '',
    );
    GroupCreationResponse res =
        await gameCreationService.handleCreateGame(groupData);
    if (context.mounted) {
      res.isCreated
          ? {
              userService.isObserver = false,
              reInitialize(),
              Navigator.pushNamed(context, CREATE_LOBBY_ROUTE,
                  arguments: res.group)
            }
          : {};
    }
  }

  Stream<bool> isFormValid() {
    return CombineLatestStream<dynamic, bool>([
      visibilitySelector.selectedStream,
      _passwordHandler.stream,
      _pressed.stream
    ], (values) {
      String? visibility = values[0].nameEnum.visibilityName;
      TextFieldHandler passwordHandler = values[1];
      bool hasBeenPressed = values[2];

      if (visibility == GameVisibility.protected.visibilityName) {
        return passwordHandler.controller.text.isNotEmpty;
      }
      return !hasBeenPressed;
    });
  }
}
