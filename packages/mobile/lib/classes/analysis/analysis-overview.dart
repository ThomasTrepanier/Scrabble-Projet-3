import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/constants/analysis.dart';

class AnalysisOverview {
  int totalMistakes;
  int majorMistakeCount = 0;
  int mediumMistakeCount = 0;
  int minorMistakeCount = 0;

  AnalysisOverview(
      {this.majorMistakeCount = 0, this.mediumMistakeCount = 0, this.minorMistakeCount = 0}) : totalMistakes = 0 {
   _updateTotalMistakes();
  }


  factory AnalysisOverview.fromCriticalMoments(List<CriticalMoment> criticalMoments) {
    AnalysisOverview overview = AnalysisOverview();
    for (CriticalMoment criticalMoment in criticalMoments) {
      overview._computeMistakeFromCriticalMoment(criticalMoment);
    }

    overview._updateTotalMistakes();
    return overview;
  }

  void _computeMistakeFromCriticalMoment(CriticalMoment criticalMoment) {
    int pointDifference = criticalMoment.bestPlacement.score -
        (criticalMoment.playedPlacement != null
            ? criticalMoment.playedPlacement!.score
            : 0);

    if (pointDifference > MAJOR_MISTAKE_THRESHOLD) {
      majorMistakeCount++;
    } else if (pointDifference > MEDIUM_MISTAKE_THRESHOLD) {
      mediumMistakeCount++;
    } else {
      minorMistakeCount++;
    }
  }

  void _updateTotalMistakes() {
    totalMistakes = minorMistakeCount + mediumMistakeCount + majorMistakeCount;
  }
}
