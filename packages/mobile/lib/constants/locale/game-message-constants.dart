// ignore_for_file: constant_identifier_names, non_constant_identifier_names

import 'package:mobile/classes/game/game-message.dart';
import 'package:mobile/constants/game-messages-constants.dart';

final GameMessage START_MESSAGE = GameMessage(content: 'Début de partie', senderId: SYSTEM_ID, gameId: '');
const CANNOT_PLAY_HINT = 'Impossible de jouer cet indice';
const CANNOT_PLAY_WHEN_NOT_LOCAL_TURN = "Vous ne pouvez pas jouer une action quand ce n'est pas votre tour";
const SERVER_PROCESSING_ACTION = "Veuillez patienter pendant que le serveur traite votre action";
