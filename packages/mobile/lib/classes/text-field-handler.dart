import 'package:flutter/material.dart';

class TextFieldHandler {
  String errorMessage = "";
  late FocusNode focusNode;
  late TextEditingController controller;

  TextFieldHandler() {
    focusNode = FocusNode();
    controller = TextEditingController();
  }

  void dispose() {
    controller.dispose();
    focusNode.dispose();
  }

  void addListener(Function function) {
    focusNode.addListener(() {
      if (focusNode.hasFocus) {
        errorMessage = "";
      } else {
        function();
      }
    });
  }

  bool isValid() {
    return controller.text.isNotEmpty && errorMessage.isEmpty;
  }
}
