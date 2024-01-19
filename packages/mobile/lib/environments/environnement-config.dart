import 'package:flutter_dotenv/flutter_dotenv.dart';

abstract class BaseConfig {
  String get apiUrl;

  String get webSocketUrl;

  bool get useHttps;

  bool get trackEvents;

  bool get reportErrors;
}

class DevConfig implements BaseConfig {
  String get ipAdressEmulator => '10.0.2.2';
  String get ipAddressChrome => 'localhost';

  String get apiUrl => 'http://'
      '$ipAdressEmulator:${dotenv.env['SERVER_PORT']}/api';

  String get webSocketUrl =>
      'http://$ipAdressEmulator:${dotenv.env['SERVER_PORT']}';

  bool get reportErrors => false;

  bool get trackEvents => false;

  bool get useHttps => false;
}

class ProdConfig implements BaseConfig {
  String get apiUrl => 'http://api.scrabble.cfstcyr.com/api';

  String get webSocketUrl => 'http://api.scrabble.cfstcyr.com';

  bool get reportErrors => true;

  bool get trackEvents => true;

  bool get useHttps => true;
}
