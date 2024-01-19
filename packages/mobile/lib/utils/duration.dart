String seconds(Duration d) {
  return d.toString().split('.').first.split(':').last;
}

String minutes(Duration d) {
  List<String> l = d.toString().split('.').first.split(':');
  return l[l.length - 2];
}