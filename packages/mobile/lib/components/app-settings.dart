import 'package:flutter/material.dart';
import 'package:mobile/classes/sound.dart';
import 'package:mobile/components/alert-dialog.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/sound-service.dart';
import 'package:mobile/services/theme-color-service.dart';

void openAppSettings() {
  triggerDialogBox('Préférences de l\'application', [
    AppSettings()
  ], [
    DialogBoxButtonParameters(
        content: 'Confirmer', theme: AppButtonTheme.primary, closesDialog: true)
  ]);
}

class AppSettings extends StatefulWidget {
  AppSettings({super.key});

  @override
  State<AppSettings> createState() => AppSettingsState();
}

class AppSettingsState extends State<AppSettings> {
  final SoundService _soundService = getIt.get<SoundService>();
  late bool isMusicEnabled;
  late double musicVolume;
  late bool isSoundEnabled;
  late double soundVolume;

  AppSettingsState() {
    isMusicEnabled = _soundService.getIsMusicEnabled();
    musicVolume = _soundService.getMusicVolume();
    isSoundEnabled = _soundService.getIsSoundEnabled();
    soundVolume = _soundService.getSoundVolume();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
        child: Container(
      width: 450,
      child: StreamBuilder(
          stream: getIt.get<ThemeColorService>().themeDetails.stream,
          builder: (context, snapshot) {
            ThemeColor themeColor = snapshot.data?.color ?? ThemeColor.green;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Couleur',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
                ),
                SizedBox.fromSize(
                  size: Size.square(SPACE_1),
                ),
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: SPACE_2,
                  runSpacing: SPACE_2,
                  children: [
                    ColorOption(
                      themeColor: themeColor,
                      optionColor: ThemeColor.green,
                    ),
                    ColorOption(
                      themeColor: themeColor,
                      optionColor: ThemeColor.blue,
                    ),
                    ColorOption(
                      themeColor: themeColor,
                      optionColor: ThemeColor.purple,
                    ),
                    ColorOption(
                      themeColor: themeColor,
                      optionColor: ThemeColor.pink,
                    ),
                    ColorOption(
                      themeColor: themeColor,
                      optionColor: ThemeColor.red,
                    ),
                    ColorOption(
                      themeColor: themeColor,
                      optionColor: ThemeColor.black,
                    ),
                  ],
                ),
                SizedBox.fromSize(
                  size: Size.square(SPACE_3),
                ),
                Text(
                  'Son et musique',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Checkbox(
                            value: isMusicEnabled,
                            onChanged: (enabled) =>
                                setIsMusicEnabled(enabled ?? true)),
                        InkWell(
                          child: Text(
                            "Musique",
                            style: TextStyle(fontWeight: FontWeight.w600),
                          ),
                          onTap: () => setIsMusicEnabled(!isMusicEnabled),
                        ),
                      ],
                    ),
                    Slider(
                        value: musicVolume,
                        onChanged: (volume) {
                          setState(() {
                            musicVolume = volume;
                          });
                          _soundService.setMusicVolume(volume);
                        })
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Checkbox(
                            value: isSoundEnabled,
                            onChanged: (enabled) =>
                                setIsSoundEnabled(enabled ?? true)),
                        InkWell(
                          child: Text(
                            "Son",
                            style: TextStyle(fontWeight: FontWeight.w600),
                          ),
                          onTap: () => setIsSoundEnabled(!isSoundEnabled),
                        ),
                      ],
                    ),
                    Slider(
                        value: soundVolume,
                        onChanged: (volume) {
                          setState(() {
                            soundVolume = volume;
                          });
                          _soundService.setSoundVolume(volume);
                        })
                  ],
                ),
              ],
            );
          }),
    ));
  }

  setIsMusicEnabled(bool enabled) {
    setState(() {
      isMusicEnabled = enabled;
    });
    _soundService.setIsMusicEnabled(enabled);
  }

  setIsSoundEnabled(bool enabled) {
    setState(() {
      isSoundEnabled = enabled;
    });
    _soundService.setIsSoundEnabled(enabled);
  }
}

class ColorOption extends StatelessWidget {
  final SoundService _soundService = getIt.get<SoundService>();

  ColorOption({
    super.key,
    required this.themeColor,
    required this.optionColor,
  });

  final ThemeColor themeColor;
  final ThemeColor optionColor;

  @override
  Widget build(BuildContext context) {
    return Transform.scale(
      scale: themeColor == optionColor ? 1.1 : 1,
      child: Container(
          decoration: BoxDecoration(
            border: Border.all(
                color: themeColor == optionColor
                    ? themeColor.colorValue
                    : Colors.transparent,
                width: 2),
            borderRadius: BorderRadius.all(Radius.circular(100)),
          ),
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(
                  color: themeColor == optionColor
                      ? Colors.white
                      : Colors.transparent,
                  width: 2),
              borderRadius: BorderRadius.all(Radius.circular(100)),
            ),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: () {
                _soundService.playSound(Sound.click);
                getIt
                    .get<ThemeColorService>()
                    .themeDetails
                    .add(setTheme(optionColor));
              },
              splashColor: Colors.transparent,
              child: Opacity(
                opacity: themeColor == optionColor ? 1 : 0.8,
                child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                        shape: BoxShape.circle, color: optionColor.colorValue)),
              ),
            ),
          )),
    );
  }
}
