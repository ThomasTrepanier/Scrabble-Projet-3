import 'dart:developer';
import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';

class AppTableRow<T> {
  T data;
  int index;

  AppTableRow({required this.data, required this.index});
}

class AppTableColumn<T> {
  final String title;
  final Widget Function(BuildContext context, AppTableRow<T> row) builder;

  AppTableColumn({required this.title, required this.builder});
}

class AppTable<T> extends StatefulWidget {
  final List<T> data;
  final List<AppTableColumn> columns;

  AppTable({required this.data, required this.columns});

  @override
  State<StatefulWidget> createState() => AppTableState();
}

class AppTableState<T> extends State<AppTable<T>> {
  int _pageSize = 5;
  int _pageNumber = 0;
  bool _hasPrev = false;
  bool _hasNext = false;

  @override
  Widget build(BuildContext context) {
    setState(() {
      _hasPrev = _getHasPrev();
      _hasNext = _getHasNext();
    });

    return Column(
      children: [
        Table(
          children: [
            TableRow(
                decoration: BoxDecoration(
                    border: Border(bottom: BorderSide(color: Colors.black26))),
                children: widget.columns
                    .map((col) => _getColumnTitle(col.title))
                    .toList()),
            ...widget.data
                .asMap()
                .entries
                .toList()
                .getRange(
                    _pageSize * _pageNumber,
                    min(_pageSize * _pageNumber + _pageSize,
                        widget.data.length))
                .toList()
                .map<TableRow>((entry) => TableRow(
                    decoration: BoxDecoration(
                        border:
                            Border(bottom: BorderSide(color: Colors.black12))),
                    children: widget.columns
                        .map((col) => _cell(col.builder(
                            context,
                            AppTableRow<T>(
                                data: entry.value, index: entry.key))))
                        .toList())),
          ],
        ),
        SizedBox(
          height: SPACE_2,
          width: 1,
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: SPACE_2,
              children: [
                Text(
                    "page ${_pageNumber + 1} de ${_getTotalPages()} (total : ${widget.data.length} items)"),
                AppButton(
                  onPressed: _hasPrev ? _previous : null,
                  icon: Icons.arrow_back,
                  theme: AppButtonTheme.secondary,
                  type: AppButtonType.ghost,
                ),
                AppButton(
                  onPressed: _hasNext ? _next : null,
                  icon: Icons.arrow_forward,
                  theme: AppButtonTheme.secondary,
                  type: AppButtonType.ghost,
                ),
              ],
            )
          ],
        )
      ],
    );
  }

  Widget _cell(Widget child) {
    return TableCell(
        verticalAlignment: TableCellVerticalAlignment.middle,
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_1),
          child: child,
        ));
  }

  Widget _getColumnTitle(String title) {
    return _cell(Text(
      title,
      style:
          TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.w500),
    ));
  }

  int _getTotalPages() {
    return (widget.data.length / _pageSize).ceil();
  }

  bool _getHasPrev() {
    return _pageNumber > 0;
  }

  bool _getHasNext() {
    return widget.data.length / _pageSize > _pageNumber + 1;
  }

  void _previous() {
    setState(() {
      _pageNumber--;
      _hasPrev = _getHasPrev();
      _hasNext = _getHasNext();
    });
  }

  void _next() {
    setState(() {
      _pageNumber++;
      _hasPrev = _getHasPrev();
      _hasNext = _getHasNext();
    });
  }
}
