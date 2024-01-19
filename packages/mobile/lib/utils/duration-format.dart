String formatTime(int seconds) {
  return Duration(seconds: seconds--).toString().substring(2, 7);
}
