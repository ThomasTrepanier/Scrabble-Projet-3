import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/timer.dart';
import 'package:mobile/constants/create-game.constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';

class TimerSelector extends StatefulWidget {
  TimerSelector({super.key, this.duration = const Duration(seconds: 60)});

  Duration duration;

  @override
  State<TimerSelector> createState() => _TimerSelectorState();
}

class _TimerSelectorState extends State<TimerSelector> {
  ThemeColorService _themeColorService = getIt.get<ThemeColorService>();

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 8.0),
          child: Text(
            'Choisissez votre temps par tour',
            style: theme.textTheme.labelLarge
                ?.copyWith(color: Colors.grey.shade700),
          ),
        ),
        Container(
          decoration: BoxDecoration(
              borderRadius: BorderRadius.all(Radius.circular(8.0)),
              border: Border.all(color: theme.colorScheme.tertiary),
              color: theme.colorScheme.background),
          padding: EdgeInsets.zero,
          margin: EdgeInsets.zero,
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _durationModifierButton(Icons.remove, _decrementTimer),
                Expanded(
                  child: Center(
                      child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 32, vertical: 16),
                    child: Row(
                      children: [
                        Icon(Icons.hourglass_bottom_rounded, size: 36),
                        SizedBox(
                          width: SPACE_1,
                        ),
                        TimerWidget(
                          duration: widget.duration,
                          style: theme.textTheme.headlineSmall,
                          stopped: true,
                        ),
                      ],
                    ),
                  )),
                ),
                _durationModifierButton(Icons.add, _incrementTimer),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _durationModifierButton(IconData icon, Function onPress) {
    return Expanded(
      child: Container(
        decoration: BoxDecoration(
            color: _themeColorService.menuSecondaryButton,
            borderRadius: BorderRadius.only(
                topRight: Radius.circular(8), bottomRight: Radius.circular(8))),
        child: AppButton(
          onPressed: () {
            setState(() {
              onPress();
            });
          },
          theme: AppButtonTheme.secondary,
          type: AppButtonType.ghost,
          icon: icon,
          size: AppButtonSize.extraLarge,
          iconOnly: true,
        ),
      ),
    );
  }

  void _incrementTimer() {
    widget.duration = Duration(
        seconds: min<int>(widget.duration.inSeconds + INCREMENT_TIME.inSeconds,
            MAX_TIME.inSeconds));
  }

  void _decrementTimer() {
    widget.duration = Duration(
        seconds: max<int>(widget.duration.inSeconds - INCREMENT_TIME.inSeconds,
            MIN_TIME.inSeconds));
  }
}
