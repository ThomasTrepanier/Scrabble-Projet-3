import 'package:flutter/material.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/avatars-constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:rxdart/rxdart.dart';

import '../services/upload.service.dart';

class AvatarField extends StatelessWidget {
  final Color themeColor =
      getIt.get<ThemeColorService>().themeDetails.value.color.colorValue;
  final BehaviorSubject<String?> avatar;
  final BehaviorSubject<String?> avatarError;
  UploadService _uploadService = getIt.get<UploadService>();

  AvatarField({required this.avatar, required this.avatarError});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<String?>(
        stream: avatar.stream,
        builder: (context, snapshot) {
          return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            snapshot.hasData && snapshot.data != null
                ? Avatar(size: 110, radius: 20, avatar: snapshot.data)
                : Container(),
            SizedBox(width: 5),
            Expanded(
              child: Column(
                children: [
                  Wrap(spacing: SPACE_1, runSpacing: SPACE_1, children: [
                    SizedBox(
                      width: 48,
                      height: 48,
                      child: CircleAvatar(
                        radius: 20,
                        backgroundColor: themeColor,
                        child: InkWell(
                          onTap: () {
                            _uploadService.myAlert(context, avatar);
                            avatar.add(null);
                          },
                          child: Icon(
                            Icons.upload_file_rounded,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    ...AVATARS
                        .map((avatarUrl) => Transform.scale(
                              scale: snapshot.data == avatarUrl ? 1.1 : 1,
                              child: Container(
                                decoration: BoxDecoration(
                                  border: Border.all(
                                      color: snapshot.data == avatarUrl
                                          ? themeColor
                                          : Colors.transparent,
                                      width: 2),
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(28)),
                                ),
                                clipBehavior: Clip.antiAlias,
                                child: InkWell(
                                  onTap: () {
                                    avatar.add(avatarUrl);
                                  },
                                  splashColor: Colors.transparent,
                                  child: Opacity(
                                    opacity:
                                        snapshot.data == avatarUrl ? 1 : 0.8,
                                    child: Avatar(
                                        avatar: avatarUrl,
                                        radius: 20,
                                        size: 48),
                                  ),
                                ),
                              ),
                            ))
                        .toList()
                  ]),
                  StreamBuilder<String?>(
                    stream: avatarError.stream,
                    builder: (context, snapshot) {
                      return snapshot.data != null
                          ? Container(
                              padding: EdgeInsets.only(top: SPACE_1),
                              child: Text(
                                snapshot.data!,
                                style: TextStyle(color: Colors.red),
                              ),
                            )
                          : Container();
                    },
                  )
                ],
              ),
            ),
          ]);
        });
  }
}
