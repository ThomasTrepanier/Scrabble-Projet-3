import 'package:flutter/material.dart';
import 'package:mobile/classes/sound.dart';
import 'package:rxdart/rxdart.dart';

import '../locator.dart';
import '../services/sound-service.dart';

abstract class AppToggleOption<V extends Enum> {
  V getEnum();
  String getEnumName();
}

class AppToggleButton<T extends AppToggleOption, V extends Enum>
    extends StatefulWidget {
  AppToggleButton(
      {required V defaultValue,
      required Map<V, T> optionsToValue,
      required Widget Function(T value) toggleOptionWidget,
      Axis orientation = Axis.horizontal})
      : _defaultValue = defaultValue,
        _optionsToValue = optionsToValue,
        _toggleOptionWidget = toggleOptionWidget,
        _orientation = orientation {
    _selected$ = BehaviorSubject.seeded(_optionsToValue[_defaultValue]!);
  }

  final Axis _orientation;
  final V _defaultValue;
  final Map<V, T> _optionsToValue;
  final Widget Function(T value) _toggleOptionWidget;

  late final BehaviorSubject<T> _selected$;

  Stream<T> get selectedStream => _selected$.stream;

  T? get selectedValue => _selected$.valueOrNull;

  List<V> get _toggleOptions => _optionsToValue.keys.toList();

  List<T> get _toggleValues => _optionsToValue.values.toList();

  @override
  State<AppToggleButton> createState() => _AppToggleButtonState<T, V>();
}

class _AppToggleButtonState<T extends AppToggleOption, V extends Enum>
    extends State<AppToggleButton<T, V>> {
  late Stream<List<bool>> _selectedOption;

  final SoundService _soundService = getIt.get<SoundService>();

  @override
  void initState() {
    super.initState();

    _selectedOption =
        widget.selectedStream.switchMap<List<bool>>((T currentSelection) {
      return Stream.value(widget._toggleOptions
          .map<bool>(
              (V option) => option.name == currentSelection.getEnumName())
          .toList());
    });
  }

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return StreamBuilder<List<bool>>(
        stream: _selectedOption,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return SizedBox.shrink();

          return ToggleButtons(
              direction: widget._orientation,
              isSelected: snapshot.data!,
              onPressed: (int index) {
                _soundService.playSound(Sound.click);
                widget._selected$.add(widget._toggleValues[index]);
              },
              color: Colors.black,
              selectedColor: Colors.white,
              fillColor: theme.primaryColor,
              children: widget._toggleValues
                  .map((T value) => widget._toggleOptionWidget(value))
                  .toList());
        });
  }
}
