// ignore_for_file: prefer_const_constructors

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/components/chatbox-wrapper.dart';
import 'package:mobile/services/chat.service.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/channel.dart';
import '../constants/chat-management.constants.dart';
import '../locator.dart';
import '../view-methods/chat-management-methods.dart';

class ChatManagement extends StatefulWidget {
  const ChatManagement({super.key});

  @override
  State<ChatManagement> createState() => _ChatManagementState();
}

class _ChatManagementState extends State<ChatManagement> {
  final ChatService _chatService = getIt.get<ChatService>();

  final channelCreationNameController = TextEditingController();
  final channelSearchController = TextEditingController();

  Stream<List<Channel>> _myChannels = Stream.empty();
  BehaviorSubject<String?> _currentSearchQuery$ = BehaviorSubject.seeded(null);
  Stream<String?> _currentSearchQuery = Stream.empty();

  StreamSubscription? openChannelSubscription;

  @override
  void initState() {
    super.initState();

    _myChannels = _chatService.myChannels;

    openChannelSubscription = _chatService.openedChannelId.listen((int? id) {
      if (id != null) {
        _chatService.scaffoldKey.currentState!.openEndDrawer();
        _chatService.readChannelMessages(id);
      } else {
        _chatService.scaffoldKey.currentState?.closeEndDrawer();
      }
    });

    _currentSearchQuery = _currentSearchQuery$
        .distinct()
        .debounceTime(Duration(milliseconds: 300));
  }

  //hack allows for drawer open after closing but it duplicates drawer
  @override
  void setState(fn) {
    if (mounted) {
      super.setState(fn);
    }
  }

  @override
  void dispose() {
    super.dispose();
    _chatService.closeChannel();
    openChannelSubscription?.cancel();
  }

  StreamBuilder joinableChannelsWidget() {
    return StreamBuilder(
      stream: CombineLatestStream<dynamic, dynamic>(
          [_chatService.joinableChannels, _currentSearchQuery],
          (values) => values),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return SizedBox.shrink();

        List<Channel> joinableChannels = snapshot.data![0];
        String? searchQuery = snapshot.data![1];

        List<Channel> filteredChannels = searchQuery == null
            ? joinableChannels
            : joinableChannels
                .where((Channel c) => c.name.contains(searchQuery))
                .toList();

        return ListView.builder(
            scrollDirection: Axis.vertical,
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            itemCount: filteredChannels.length,
            itemBuilder: (_, int index) {
              Channel joinableChannel = filteredChannels[index];

              return Padding(
                padding: const EdgeInsets.all(8.0),
                child: Container(
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.all(Radius.circular(4.0))),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        setName(joinableChannel),
                        IconButton(
                          onPressed: () {
                            setState(() {
                              _chatService
                                  .joinChannel(joinableChannel.idChannel);
                            });
                          },
                          icon: Icon(Icons.add),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            });
      },
    );
  }

  StreamBuilder myChannelsWidget() {
    return StreamBuilder(
      stream: _myChannels,
      builder: (context, snapshot) {
        if (!snapshot.hasData) return SizedBox.shrink();

        List<Channel> myChannels = snapshot.data!;

        return ListView.builder(
            scrollDirection: Axis.vertical,
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            itemCount: myChannels.length,
            itemBuilder: (_, int index) {
              Channel currentChannel = myChannels[index];
              return Padding(
                padding: const EdgeInsets.only(left: 8, right: 8, bottom: 8),
                child: Container(
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.all(Radius.circular(4.0))),
                  child: InkWell(
                    onTap: () {
                      _chatService.openChannel(currentChannel);
                    },
                    child: Padding(
                      padding: const EdgeInsets.only(
                          left: 8, right: 8, top: 4, bottom: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          setName(currentChannel),
                          IconButton(
                            onPressed: currentChannel.canQuit
                                ? () {
                                    _chatService
                                        .quitChannel(currentChannel.idChannel);
                                  }
                                : null,
                            icon: Icon(Icons.output_rounded),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _chatService.scaffoldKey,
      endDrawerEnableOpenDragGesture: false,
      endDrawer: Drawer(child: ChatboxWrapper()),
      body: ListView(
        shrinkWrap: true,
        padding: EdgeInsets.zero,
        children: [
          setDrawerTitle(),
          Padding(
            padding: EdgeInsets.only(left: 10.0, right: 10.0),
            child: TextField(
              onSubmitted: (field) {
                _handleCreateChannel(channelCreationNameController.text);
              },
              controller: channelCreationNameController,
              decoration: InputDecoration(
                hintText: CREATE_CHANNEL,
                border: setCreateChannelBorder(),
                suffixIcon: IconButton(
                    onPressed: () {
                      _handleCreateChannel(channelCreationNameController.text);
                    },
                    icon: Icon(Icons.add)),
              ),
            ),
          ),
          ListTile(
            title: const Text(MY_CHANNELS),
          ),
          myChannelsWidget(),
          setDivider(),
          ListTile(
            leading: Icon(Icons.search),
            title: TextField(
              controller: channelSearchController,
              decoration: InputDecoration(
                  hintText: ALL_CHANNELS, border: InputBorder.none),
              onChanged: _handleSearchQueryChanged,
            ),
            trailing: IconButton(
              icon: Icon(Icons.clear),
              onPressed: () {
                channelSearchController.clear();
                _handleSearchQueryChanged(channelSearchController.text);
              },
            ),
          ),
          joinableChannelsWidget(),
        ],
      ),
    );
  }

  void _handleSearchQueryChanged(String value) {
    _currentSearchQuery$.add(value.isNotEmpty ? value : null);
  }

  void _handleCreateChannel(String channelName) {
    _chatService.createChannel(channelName);
    channelCreationNameController.clear();
  }
}
