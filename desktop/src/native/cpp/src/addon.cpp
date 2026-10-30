#include <napi.h>
#include "screen_capture.hpp"
#include "input_simulator.hpp"

namespace devforge {

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("captureScreen", Napi::Function::New(env, ScreenCapture::Capture));
  exports.Set("inputClick", Napi::Function::New(env, InputSimulator::Click));
  exports.Set("inputType", Napi::Function::New(env, InputSimulator::Type));
  exports.Set("inputKey", Napi::Function::New(env, InputSimulator::Key));
  exports.Set("inputDrag", Napi::Function::New(env, InputSimulator::Drag));
  return exports;
}

NODE_API_MODULE(devforge_native_cpp, Init)

}