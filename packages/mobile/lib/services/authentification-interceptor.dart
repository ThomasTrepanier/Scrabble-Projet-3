import 'package:http_interceptor/http_interceptor.dart';
import 'package:mobile/services/storage.handler.dart';

import '../locator.dart';

class AuthentificationInterceptor implements InterceptorContract {
  StorageHandlerService storageHandlerService =
      getIt.get<StorageHandlerService>();
  String? token;

  @override
  Future<RequestData> interceptRequest({required RequestData data}) async {
    try {
      token = await storageHandlerService.getToken() ?? '';
      data.headers["authorization"] = "Bearer $token";
      data.headers["Content-Type"] = "application/json";
    } catch (e) {
      print(e);
    }
    return data;
  }

  @override
  Future<ResponseData> interceptResponse({required ResponseData data}) async =>
      data;
}
