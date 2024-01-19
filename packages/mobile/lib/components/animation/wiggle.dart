import 'package:flutter/material.dart';

class Wiggle extends StatefulWidget {
  final double amount;
  final Duration speed;
  final bool active;
  final Widget child;

  Wiggle({
    this.amount = 1,
    this.speed = const Duration(seconds: 1),
    this.active = true,
    required this.child,
  });

  @override
  WiggleState createState() => WiggleState();
}

class WiggleState extends State<Wiggle> with SingleTickerProviderStateMixin {
  late final AnimationController _animationController;

  @override
  void initState() {
    _animationController = AnimationController(
      vsync: this,
      lowerBound: 0.5 - (widget.amount / 2),
      upperBound: 0.5 + (widget.amount / 2),
      duration: widget.speed,
    );
    _animationController.repeat(reverse: true);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return widget.active
        ? RotationTransition(
            turns: _animationController,
            child: RotatedBox(
              quarterTurns: 2,
              child: widget.child,
            ),
          )
        : widget.child;
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}
