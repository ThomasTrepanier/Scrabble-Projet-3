import 'package:get_it/get_it.dart';
import 'package:mobile/controllers/analysis-controller.dart';
import 'package:mobile/controllers/game-creation-controller.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/controllers/group-join-controller.dart';
import 'package:mobile/controllers/notification-controller.dart';
import 'package:mobile/controllers/puzzle-controller.dart';
import 'package:mobile/controllers/tile-synchronisation-controller.dart';
import 'package:mobile/controllers/user-controller.dart';
import 'package:mobile/services/action-service.dart';
import 'package:mobile/services/analysis-service.dart';
import 'package:mobile/services/app-route-observer.dart';
import 'package:mobile/services/client.dart';
import 'package:mobile/services/end-game.service.dart';
import 'package:mobile/services/game-creation-service.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game-messages.service.dart';
import 'package:mobile/services/game-observer-service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/group-join.service.dart';
import 'package:mobile/services/initializer.service.dart';
import 'package:mobile/services/player-leave-service.dart';
import 'package:mobile/services/puzzle-service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:mobile/services/sound-service.dart';
import 'package:mobile/services/storage.handler.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/services/tile-synchronisation.service.dart';
import 'package:mobile/services/upload.service.dart';
import 'package:mobile/services/user-session.service.dart';
import 'package:mobile/services/user.service.dart';

import 'controllers/account-authentification-controller.dart';
import 'services/chat.service.dart';
import 'services/notification.service.dart';

final GetIt getIt = GetIt.instance;

class CustomLocator {
  static final CustomLocator _instance = CustomLocator._();

  factory CustomLocator() {
    return _instance;
  }

  CustomLocator._();

  void setUpLocator() {
    _registerLazySingletons();
    _registerActiveSingleton();
  }

  void _registerLazySingletons() {
    getIt.registerLazySingleton<PersonnalHttpClient>(
        () => PersonnalHttpClient());
    getIt.registerLazySingleton<StorageHandlerService>(
        () => StorageHandlerService());

    getIt.registerLazySingleton<UserService>(() => UserService());
    getIt.registerLazySingleton<UserSessionService>(() => UserSessionService());
    getIt.registerLazySingleton<UserController>(() => UserController());

    getIt.registerLazySingleton<SocketService>(() => SocketService());
    getIt.registerLazySingleton<GameEventService>(() => GameEventService());
    getIt.registerLazySingleton<RoundService>(() => RoundService());

    getIt.registerLazySingleton<ThemeColorService>(() => ThemeColorService());

    getIt.registerLazySingleton<GroupJoinService>(() => GroupJoinService());

    getIt.registerLazySingleton<GamePlayController>(() => GamePlayController());
    getIt.registerLazySingleton<TileSynchronisationController>(
        () => TileSynchronisationController());
    getIt.registerLazySingleton<TileSynchronisationService>(
        () => TileSynchronisationService());

    getIt.registerLazySingleton<ActionService>(() => ActionService());
    getIt.registerLazySingleton<PlayerLeaveService>(() => PlayerLeaveService());
    getIt.registerLazySingleton<NotificationController>(
        () => NotificationController());

    getIt.registerLazySingleton<GameCreationController>(
        () => GameCreationController());
    getIt.registerLazySingleton<PuzzleController>(() => PuzzleController());
    getIt.registerLazySingleton<AnalysisController>(() => AnalysisController());
    getIt.registerLazySingleton<AnalysisService>(() => AnalysisService());
    getIt.registerLazySingleton<UploadService>(() => UploadService());
  }

  void _registerActiveSingleton() {
    getIt.registerSingleton<AppRouteObserver>(AppRouteObserver());
    getIt.registerSingleton<SoundService>(SoundService());

    getIt.registerSingleton<NotificationService>(NotificationService());
    getIt.registerSingleton<ChatService>(ChatService());
    getIt.registerSingleton<AccountAuthenticationController>(
        AccountAuthenticationController());
    getIt.registerSingleton<InitializerService>(InitializerService());
    getIt.registerSingleton<GameCreationService>(GameCreationService());
    getIt.registerSingleton<GameObserverService>(GameObserverService());
    getIt.registerSingleton<PuzzleService>(PuzzleService());
    getIt.registerSingleton<GameService>(GameService());
    getIt.registerSingleton<EndGameService>(EndGameService());
    getIt.registerSingleton<GameMessagesService>(GameMessagesService());
    getIt.registerSingleton<GroupJoinController>(GroupJoinController());
  }
}
