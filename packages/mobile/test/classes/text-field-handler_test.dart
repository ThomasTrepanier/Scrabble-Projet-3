import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/classes/text-field-handler.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

import 'text-field-handler_test.mocks.dart';

void emptyFunction() {}

@GenerateMocks([FocusNode, TextEditingController])
void main() {
  group('TextFieldHandler', () {
    late TextFieldHandler textFieldHandler;
    late MockFocusNode mockFocusNode;
    late MockTextEditingController mockTextEditingController;
    setUp(() {
      textFieldHandler = TextFieldHandler();
      mockFocusNode = MockFocusNode();
      mockTextEditingController = MockTextEditingController();
      textFieldHandler.focusNode = mockFocusNode;
      textFieldHandler.controller = mockTextEditingController;
    });

    tearDown(() {
      textFieldHandler.dispose();
    });
    test('values should be correctly setup', () {
      expect(textFieldHandler.errorMessage, "");
      expect(textFieldHandler.focusNode, isNotNull);
      expect(textFieldHandler.controller, isNotNull);
    });

    test('dispose should call dispose on node and controller', () {
      when(mockTextEditingController.dispose()).thenAnswer((_) => emptyFunction());
      when(mockFocusNode.dispose()).thenAnswer((_) => emptyFunction());

      textFieldHandler.dispose();
      verify(mockTextEditingController.dispose()).called(1);
      verify(mockFocusNode.dispose()).called(1);
    });

    test('isValid should return false', () {
      when(mockTextEditingController.text).thenAnswer((_) => "true");
      textFieldHandler.errorMessage = "aaa";
      expect(textFieldHandler.isValid(), false);
    });

    test('isValid should return true', () {
      when(mockTextEditingController.text).thenAnswer((_) => "true");
      textFieldHandler.errorMessage = "";
      expect(textFieldHandler.isValid(), true);
    });

    test('addListener should call focusNode.addListener', () {
      textFieldHandler.addListener(() {
        emptyFunction();
      });
      mockFocusNode.requestFocus();
      verify(mockFocusNode.addListener(any)).called(1);
    });
  });
}
