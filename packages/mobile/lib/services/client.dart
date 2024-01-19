import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/services/authentification-interceptor.dart';

class PersonnalHttpClient {
  InterceptedHttp http;

  PersonnalHttpClient._privateConstructor()
      : http = InterceptedHttp.build(interceptors: [
          AuthentificationInterceptor(),
        ]);

  static final PersonnalHttpClient _instance =
      PersonnalHttpClient._privateConstructor();

  factory PersonnalHttpClient() {
    return _instance;
  }
}
