import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile/components/app_button.dart';
import 'package:rxdart/rxdart.dart';
import 'package:uploadcare_client/uploadcare_client.dart';

import '../components/alert-dialog.dart';
import '../constants/upload.constants.dart';

class UploadService {
  UploadService._privateConstructor();
  static final UploadService _instance = UploadService._privateConstructor();
  final client = UploadcareClient(
    options: ClientOptions(
      authorizationScheme: AuthSchemeRegular(
        apiVersion: UPLOAD_VERSION,
        publicKey: UPLOAD_PUBLIC_KEY,
        privateKey: UPLOAD_PRIVATE_KEY,
      ),
    ),
  );
  factory UploadService() {
    return _instance;
  }
  final ImagePicker picker = ImagePicker();

  Future<String?> getImage(ImageSource media) async {
    var img = await picker.pickImage(source: media);
    if (img == null) return Future.value('');
    return await client.upload.base(UCFile(File(img.path)));
  }

  String? formatAvatarLink(String? id) {
    if (id == null || id.isEmpty) return null;
    return 'https://ucarecdn.com/$id/';
  }

  void myAlert(BuildContext context, BehaviorSubject<String?> image) {
    triggerDialogBox(
        'Veuillez choisir un média',
        [
          AppButton(
              text: 'Photos',
              theme: AppButtonTheme.primary,
              icon: Icons.image,
              width: 200,
              onPressed: () async {
                Navigator.pop(context);
                image
                    .add(formatAvatarLink(await getImage(ImageSource.gallery)));
              }),
          AppButton(
              text: 'Camera',
              theme: AppButtonTheme.primary,
              icon: Icons.camera,
              width: 200,
              onPressed: () async {
                Navigator.pop(context);
                image.add(formatAvatarLink(await getImage(ImageSource.camera)));
              }),
          AppButton(
              text: 'Annuler',
              theme: AppButtonTheme.secondary,
              width: 200,
              onPressed: () {
                Navigator.pop(context);
              }),
        ],
        [],
        dismissOnBackgroundTouch: true);
  }
}
