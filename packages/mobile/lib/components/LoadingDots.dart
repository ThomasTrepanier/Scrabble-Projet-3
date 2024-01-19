import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:rxdart/rxdart.dart';

const DEFAULT_DELAY = Duration(seconds: 1);

class LoadingDots extends StatefulWidget {
  LoadingDots(
      {required this.style, this.delay = DEFAULT_DELAY, this.isPlaying = true});

  final Duration delay;
  final TextStyle style;
  final bool isPlaying;

  @override
  State<LoadingDots> createState() => _LoadingDotsState();
}

class _LoadingDotsState extends State<LoadingDots> {
  LoadingDotsText _dots = LoadingDotsText();
  late Timer _animationTimer;

  @override
  void initState() {
    super.initState();
    _dots = LoadingDotsText();

    _animationTimer = Timer.periodic(widget.delay, (_) => _dots.advance());
  }

  @override
  void dispose() {
    super.dispose();
    _animationTimer.cancel();
  }

  @override
  Widget build(BuildContext context) {
    return widget.isPlaying
        ? StreamBuilder<String>(
            stream: _dots.state,
            builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
              return snapshot.hasData
                  ? Text(snapshot.data!, style: widget.style)
                  : Text(
                      '',
                      style: widget.style,
                    );
            })
        : Text('');
  }
}

class LoadingDotsText {
  final List<String> _states = ['.', '..', '...'];
  BehaviorSubject<int> _currentIndex$;

  LoadingDotsText() : _currentIndex$ = BehaviorSubject.seeded(0);

  Stream<String> get state =>
      _currentIndex$.map((int currentIndex) => _states[currentIndex]);

  void advance() {
    _currentIndex$.add((_currentIndex$.value + 1) % _states.length);
  }
}
