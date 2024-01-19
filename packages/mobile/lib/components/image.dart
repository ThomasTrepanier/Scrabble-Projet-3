import 'package:flutter/material.dart' as c;
import 'package:flutter/widgets.dart';

class AppImage extends c.StatelessWidget {
  final String src;
  final double? height;
  final double? width;

  /// A builder function responsible for creating the widget that represents
  /// this image.
  ///
  /// If this is null, this widget will display an image that is painted as
  /// soon as the first image frame is available (and will appear to "pop" in
  /// if it becomes available asynchronously). Callers might use this builder to
  /// add effects to the image (such as fading the image in when it becomes
  /// available) or to display a placeholder widget while the image is loading.
  ///
  /// To have finer-grained control over the way that an image's loading
  /// progress is communicated to the user, see [loadingBuilder].
  ///
  /// ## Chaining with [loadingBuilder]
  ///
  /// If a [loadingBuilder] has _also_ been specified for an image, the two
  /// builders will be chained together: the _result_ of this builder will
  /// be passed as the `child` argument to the [loadingBuilder]. For example,
  /// consider the following builders used in conjunction:
  ///
  /// {@template flutter.widgets.Image.frameBuilder.chainedBuildersExample}
  /// ```dart
  /// Image(
  ///   image: _image,
  ///   frameBuilder: (BuildContext context, Widget child, int? frame, bool? wasSynchronouslyLoaded) {
  ///     return Padding(
  ///       padding: const EdgeInsets.all(8.0),
  ///       child: child,
  ///     );
  ///   },
  ///   loadingBuilder: (BuildContext context, Widget child, ImageChunkEvent? loadingProgress) {
  ///     return Center(child: child);
  ///   },
  /// )
  /// ```
  ///
  /// In this example, the widget hierarchy will contain the following:
  ///
  /// ```dart
  /// Center(
  ///   child: Padding(
  ///     padding: const EdgeInsets.all(8.0),
  ///     child: image,
  ///   ),
  /// ),
  /// ```
  /// {@endtemplate}
  ///
  /// {@tool dartpad}
  /// The following sample demonstrates how to use this builder to implement an
  /// image that fades in once it's been loaded.
  ///
  /// This sample contains a limited subset of the functionality that the
  /// [FadeInImage] widget provides out of the box.
  ///
  /// ** See code in examples/api/lib/widgets/image/image.frame_builder.0.dart **
  /// {@end-tool}
  final Widget Function(BuildContext, Widget, int?, bool)? frameBuilder;

  AppImage({
    required this.src,
    this.height,
    this.width,
    this.frameBuilder,
  }) : assert(height != null || width != null,
            'Image requires at least one of "height" and "width".');

  @override
  c.Widget build(c.BuildContext context) {
    return c.Image.network(
      _getSrc(),
      height: (height),
      width: (width),
      frameBuilder: frameBuilder,
    );
  }

  NetworkImage get provider {
    return NetworkImage(_getSrc());
  }

  String _getSrc() {
    var w = width == null ? '' : (width! * 1.5).round();
    var h = height == null ? '' : (height! * 1.5).round();

    return src.startsWith('https://ucarecdn.com/') &&
            (height != null || width != null)
        ? '$src-/resize/${w}x$h/-/progressive/yes/-/format/auto/'
        : src;
  }
}
