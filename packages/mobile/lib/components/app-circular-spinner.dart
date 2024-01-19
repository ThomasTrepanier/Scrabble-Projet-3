// ignore_for_file: constant_identifier_names

import 'package:flutter/material.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'dart:math';

const double SPINNER_OPENING_PERCENT = 0.8;
const double SPINNER_ROTATION = -145.0;

enum AppCircularSpinnerSize {
  small,
  medium,
  large;

  double get strokeWidth {
    switch (this) {
      case AppCircularSpinnerSize.small:
        return 6.0;
      case AppCircularSpinnerSize.medium:
        return 8.0;
      case AppCircularSpinnerSize.large:
        return 12.0;
    }
  }

  double get size {
    switch (this) {
      case AppCircularSpinnerSize.small:
        return 32.0;
      case AppCircularSpinnerSize.medium:
        return 64.0;
      case AppCircularSpinnerSize.large:
        return 128.0;
    }
  }
}

class AppCircularSpinner extends StatelessWidget {
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();
  final bool isLoading;
  final Color color;

  final double? value;
  final double? maximumValue;

  final AppCircularSpinnerSize size;
  final double? strokeWidth;

  AppCircularSpinner(
      {required this.isLoading,
      required this.color,
      this.value,
      this.maximumValue,
      this.size = AppCircularSpinnerSize.medium,
      this.strokeWidth})
      : assert(value != null ? maximumValue != null : maximumValue == null,
            'You have to define both the value and the maximum value'),
        assert(
            value != null && maximumValue != null
                ? value <= maximumValue
                : true,
            'The spinner value cannot be greater than its max value'),
        assert((value != null || maximumValue != null) ? !isLoading : true,
            'A loading spinner cannot have a set value'),
        assert((value != null || maximumValue != null) ? true : isLoading,
            'A stopped spinner has to have a value and a maximum value');

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return isLoading ? _loadingSpinner() : _stoppedSpinner(theme);
  }

  Widget _loadingSpinner() {
    return SizedBox(
      width: size.size,
      height: size.size,
      child: CircularProgressIndicator(
          strokeWidth: _getStrokeWidth(), color: color),
    );
  }

  Widget _stoppedSpinner(ThemeData theme) {
    return Transform.rotate(
        angle: _computeRotation(),
        child: Stack(children: [
          _valueSpinner(SPINNER_OPENING_PERCENT, theme.colorScheme.tertiary),
          _valueSpinner(_computeValue(), color),
        ]));
  }

  Widget _valueSpinner(double value, Color color) {
    return SizedBox(
      width: size.size,
      height: size.size,
      child: CircularProgressIndicator(
        strokeWidth: _getStrokeWidth(),
        value: value,
        color: color,
      ),
    );
  }

  double _computeValue() {
    if (maximumValue == 0) return 0;
    return (value! / maximumValue!) * SPINNER_OPENING_PERCENT;
  }

  double _computeRotation() {
    return pi * SPINNER_ROTATION / 180.0;
  }

  double _getStrokeWidth() {
    return strokeWidth ?? size.strokeWidth;
  }
}
