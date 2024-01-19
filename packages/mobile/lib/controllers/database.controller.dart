import 'package:http_interceptor/http/intercepted_http.dart';

import '../environments/environment.dart';
import '../locator.dart';
import '../services/client.dart';

class DatabaseController {
  DatabaseController._privateConstructor();
  static final DatabaseController _instance =
      DatabaseController._privateConstructor();
  final String endpoint = "${Environment().config.apiUrl}/database";
  factory DatabaseController() {
    return _instance;
  }

  final httpClient = getIt.get<PersonnalHttpClient>();
  InterceptedHttp get http => httpClient.http;

  Future<void> ping() async {
    await http.get(Uri.parse("$endpoint/database/is-connected"));
  }
}
