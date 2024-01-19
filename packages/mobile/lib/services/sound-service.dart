import 'dart:async';
import 'dart:math';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:mobile/services/app-route-observer.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../classes/sound.dart';
import '../locator.dart';

const isMusicEnabledKey = "IS_MUSIC_ENABLED";
const musicVolumeKey = "MUSIC_VOLUME";
const isSoundEnabledKey = "IS_SOUND_ENABLED";
const soundVolumeKey = "SOUND_VOLUME";

class SoundService {
  static final AudioPlayer _musicPlayer = AudioPlayer();
  static final AudioPlayer _soundPlayer = AudioPlayer();
  static final SoundService _instance = SoundService._();

  final Future<SharedPreferences> _sharedPreference =
      SharedPreferences.getInstance();
  final AppRouteObserver _routeObserver = getIt.get<AppRouteObserver>();
  bool _isMusicEnabled = true;
  double _musicVolume = 1;
  bool _isSoundEnabled = true;
  double _soundVolume = 1;
  MusicType _currentMusicType = MusicType.noMusic;

  SoundService._() {
    _loadConfig();
    _soundPlayer.setReleaseMode(ReleaseMode.stop);
    _soundPlayer.audioCache
        .loadAll(Sound.values.map((sound) => sound.path).toList());
    _musicPlayer.audioCache.loadAll(backgroundMusic);
    _musicPlayer.audioCache.loadAll(lobbyMusic);
    _routeObserver.currentRoute$.listen(handleRouteChange);
    _musicPlayer.onPlayerComplete
        .listen((event) => playMusic(_currentMusicType));
  }

  factory SoundService() {
    return _instance;
  }

  Future<void> playSound(Sound sound) async {
    if (!_isSoundEnabled) return;
    await _soundPlayer.stop();
    _soundPlayer.play(
      AssetSource(sound.path),
      mode: PlayerMode.lowLatency,
      volume: _soundVolume,
    );
  }

  Future<void> stopSound() async {
    if (!_isSoundEnabled) return;
    await _soundPlayer.stop();
  }

  Future<void> playMusic(MusicType musicType) async {
    if (!_isMusicEnabled) return;

    String? path = _getMusicPathFromType(musicType);

    if (path == null) {
      _musicPlayer.stop();
    } else {
      _musicPlayer.play(
        AssetSource(path),
        volume: _musicVolume,
      );
    }
  }

  Future<void> setIsMusicEnabled(bool isMusicEnabled) async {
    _isMusicEnabled = isMusicEnabled;

    if (isMusicEnabled) {
      _resumeMusic();
    } else {
      _musicPlayer.stop();
    }

    (await _sharedPreference).setBool(isMusicEnabledKey, isMusicEnabled);
  }

  bool getIsMusicEnabled() => _isMusicEnabled;

  Future<void> setMusicVolume(double volume) async {
    _musicVolume = volume;
    _musicPlayer.setVolume(volume);
    (await _sharedPreference).setDouble(musicVolumeKey, volume);
  }

  double getMusicVolume() => _musicVolume;

  Future<void> setIsSoundEnabled(bool isSoundEnabled) async {
    _isSoundEnabled = isSoundEnabled;

    if (!isSoundEnabled) _soundPlayer.stop();

    (await _sharedPreference).setBool(isSoundEnabledKey, isSoundEnabled);
  }

  bool getIsSoundEnabled() => _isSoundEnabled;

  Future<void> setSoundVolume(double volume) async {
    _soundVolume = volume;
    _soundPlayer.setVolume(volume);
    (await _sharedPreference).setDouble(soundVolumeKey, volume);
  }

  double getSoundVolume() => _soundVolume;

  void handleRouteChange(PageRoute<dynamic> route) {
    var musicType = pageLobbyMusic.contains(route.settings.name ?? '/')
        ? MusicType.lobbyMusic
        : (pagesNoMusic.contains(route.settings.name ?? '/')
            ? MusicType.noMusic
            : MusicType.backgroundMusic);

    if (musicType != _currentMusicType ||
        (musicType != MusicType.noMusic &&
            _musicPlayer.state != PlayerState.playing)) {
      _currentMusicType = musicType;
      playMusic(musicType);
    }
  }

  String? _getMusicPathFromType(MusicType musicType) {
    switch (musicType) {
      case MusicType.backgroundMusic:
        return backgroundMusic[Random().nextInt(backgroundMusic.length)];
      case MusicType.lobbyMusic:
        return lobbyMusic[Random().nextInt(lobbyMusic.length)];
      default:
        return null;
    }
  }

  Future<void> _resumeMusic() async {
    await playMusic(_currentMusicType);
  }

  Future<void> _loadConfig() async {
    _isMusicEnabled =
        (await _sharedPreference).getBool(isMusicEnabledKey) ?? true;
    _musicVolume = (await _sharedPreference).getDouble(musicVolumeKey) ?? 1.0;
    _isSoundEnabled =
        (await _sharedPreference).getBool(isSoundEnabledKey) ?? true;
    _soundVolume = (await _sharedPreference).getDouble(soundVolumeKey) ?? 1.0;
  }
}
