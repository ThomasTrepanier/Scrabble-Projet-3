enum AnalysisRequestInfoType {
  idGame,
  idAnalysis;
}

Map<String, dynamic> requestTypeParams(AnalysisRequestInfoType requestInfoType) {
  return {
    'requestType': requestInfoType.name,
  };
}
