import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class Pulse extends StatefulWidget {
  final double scale;
  final Widget child;
  final bool active;
  final Duration duration;

  Pulse(
      {this.scale = 1.05,
      this.active = true,
      this.duration = const Duration(seconds: 1),
      required this.child});

  @override
  PulseState createState() => PulseState();
}

class PulseState extends State<Pulse> with SingleTickerProviderStateMixin {
  late final AnimationController _animationController;

  @override
  void initState() {
    _animationController = AnimationController(
      vsync: this,
      lowerBound: 1 / widget.scale,
      upperBound: widget.scale,
      duration: widget.duration,
    );
    _animationController.repeat(reverse: true);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return widget.active
        ? ScaleTransition(
            scale: _animationController,
            child: widget.child,
          )
        : widget.child;
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}
