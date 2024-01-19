class ResponseResult {
  bool isSuccess;

  ResponseResult({required this.isSuccess});

  factory ResponseResult.success() => ResponseResult(isSuccess: true);

  factory ResponseResult.error() => ResponseResult(isSuccess: false);
}
