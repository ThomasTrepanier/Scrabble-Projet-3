import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';

class AppRouteObserver extends RouteObserver<PageRoute<dynamic>> {
  Subject<PageRoute<dynamic>> _currentRoute$ =
      PublishSubject<PageRoute<dynamic>>();

  Stream<PageRoute<dynamic>> get currentRoute$ => _currentRoute$.stream;

  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);

    if (route is PageRoute) {
      _currentRoute$.add(route);
    }
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);

    if (newRoute is PageRoute) {
      _currentRoute$.add(newRoute);
    }
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);

    if (previousRoute is PageRoute && route is PageRoute) {
      _currentRoute$.add(previousRoute);
    }
  }
}
