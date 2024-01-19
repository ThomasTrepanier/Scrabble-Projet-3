import 'package:flutter/material.dart';
import 'package:mobile/constants/layout.constants.dart';

class GameInfo extends StatelessWidget {
  final dynamic value;
  final String name;
  final IconData icon;

  GameInfo({
    required this.value,
    required this.name,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(SPACE_2),
        child: Row(children: [
          Icon(
            icon,
            size: 42,
          ),
          Expanded(
              child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              value is String ? Text(
                value,
                style: TextStyle(
                    fontSize: 32, fontWeight: FontWeight.w600, height: 1),
              ) : value,
              Opacity(
                opacity: 0.54,
                child: Text(
                  name,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              )
            ],
          ))
        ]),
      ),
    );
  }
}
