import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/classes/group.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/view-methods/create-lobby-methods.dart';
import 'package:mobile/view-methods/group.methods.dart';

import '../constants/socket-events/group-events.dart';
import '../locator.dart';
import '../services/client.dart';
import '../services/socket.service.dart';

class GroupJoinController {
  final String endpoint = GAME_ENDPOINT;

  String? joinedGroupId;

  SocketService socketService = getIt.get<SocketService>();
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();

  InterceptedHttp get http => httpClient.http;

  GroupJoinController._privateConstructor() {
    _configureSocket();
  }

  static final GroupJoinController _instance =
      GroupJoinController._privateConstructor();

  factory GroupJoinController() {
    return _instance;
  }

  Future<void> handleGetGroups() async {
    await http.get(Uri.parse(endpoint));
  }

  Future<Response> handleJoinGroup(
      String groupId, String password, bool isObserver) async {
    joinedGroupId = groupId;
    JoinRequest joinRequestData =
        JoinRequest(password: password, isObserver: isObserver);
    return http.post(Uri.parse("$endpoint/$groupId/players/join"),
        body: jsonEncode(joinRequestData));
  }

  Future<Response> handleGroupUpdatesRequest(String groupId, bool isObserver) {
    return http.patch(Uri.parse("$endpoint/$groupId"),
        body: jsonEncode({"isObserver": isObserver}));
  }

  Future<Response> handleCancelJoinRequest(groupId) async {
    return handleLeaveGroup(groupId);
  }

  Future<Response> handleLeaveGroup(String groupId) async {
    Future<Response> response =
        http.delete(Uri.parse("$endpoint/$groupId/players/leave"));
    return response;
  }

  void handleCurrentGroupUpdate(Group group) {
    currentGroupUpdate$.add(group);
    playerList$.add(group.users);
  }

  void _configureSocket() {
    socketService.on(GROUP_UPDATE, (groups) {
      handleGroupsUpdate(groups);
    });
    socketService.on(ACCEPTED_IN_GROUP, (group) {
      handleCurrentGroupUpdate(Group.fromJson(group));
    });
    socketService.on(REJECTED_FROM_GROUP, (host) {
      rejectedJoinRequest$.add(PublicUser.fromJson(host));
    });
    socketService.on(CANCELED_GROUP, (host) {
      canceledGroup$.add(PublicUser.fromJson(host));
    });
    socketService.on(USER_LEFT_GROUP, (group) {
      handleCurrentGroupUpdate(Group.fromJson(group));
    });
  }
}
