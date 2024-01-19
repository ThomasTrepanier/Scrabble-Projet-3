import 'dart:convert';
import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/classes/analysis/analysis-request.dart';
import 'package:mobile/classes/analysis/analysis.dart';

import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/client.dart';

class AnalysisController {
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();

  InterceptedHttp get http => httpClient.http;

  final String endpoint = ANALYSIS_ENDPOINT;

  AnalysisController._privateConstructor();

  Future<AnalysisCompleted> requestAnalysis(
      int idAnalysis, AnalysisRequestInfoType requestType) async {
    return http
        .get(Uri.parse("$endpoint/$idAnalysis"),
            params: requestTypeParams(requestType))
        .then((Response value) =>
            AnalysisCompleted.fromJson(jsonDecode(value.body)));
  }

  static final AnalysisController _instance =
      AnalysisController._privateConstructor();

  factory AnalysisController() {
    return _instance;
  }
}
