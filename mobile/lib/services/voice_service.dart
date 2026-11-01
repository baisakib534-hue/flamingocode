import 'package:speech_to_text/speech_to_text.dart';
import 'package:speech_to_text/speech_recognition_result.dart';

class VoiceService {
  final SpeechToText _speech = SpeechToText();
  bool _isInitialized = false;
  bool _isListening = false;
  String _currentLocale = 'en-US';

  // Callbacks
  Function(String)? onInterimResult;
  Function(String)? onFinalResult;
  Function(bool)? onListeningChanged;
  Function(String)? onError;

  Future<bool> init() async {
    if (_isInitialized) return true;
    
    _isInitialized = await _speech.initialize(
      onError: (error) {
        onError?.call(error.errorMsg);
      },
      onStatus: (status) {
        if (status == 'done' || status == 'notListening') {
          _isListening = false;
          onListeningChanged?.call(false);
        }
      },
    );
    
    return _isInitialized;
  }

  Future<void> startListening({String? locale}) async {
    if (_isListening) return;
    
    _currentLocale = locale ?? _currentLocale;
    
    // Check if locale is available
    final locales = await _speech.locales();
    final localeSupported = locales.any((l) => l.localeId == _currentLocale);
    
    if (!localeSupported) {
      // Fallback to default
      _currentLocale = 'en-US';
    }
    
    _isListening = await _speech.listen(
      localeId: _currentLocale,
      onResult: _onSpeechResult,
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 3),
      partialResults: true,
      cancelOnError: true,
      listenMode: ListenMode.confirmation,
    );
    
    onListeningChanged?.call(_isListening);
  }

  void _onSpeechResult(SpeechRecognitionResult result) {
    if (result.finalResult) {
      onFinalResult?.call(result.recognizedWords);
    } else {
      onInterimResult?.call(result.recognizedWords);
    }
  }

  Future<void> stopListening() async {
    if (!_isListening) return;
    await _speech.stop();
    _isListening = false;
    onListeningChanged?.call(false);
  }

  Future<void> cancelListening() async {
    if (!_isListening) return;
    await _speech.cancel();
    _isListening = false;
    onListeningChanged?.call(false);
  }

  bool get isListening => _isListening;
  String get currentLocale => _currentLocale;
  
  Future<List<LocaleName>> getAvailableLocales() async {
    return _speech.locales();
  }

  void setLocale(String locale) {
    _currentLocale = locale;
  }

  // Toggle between Bangla and English
  void toggleLanguage() {
    _currentLocale = _currentLocale == 'en-US' ? 'bn-BD' : 'en-US';
  }
}