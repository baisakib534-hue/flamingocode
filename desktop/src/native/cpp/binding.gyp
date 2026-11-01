{
  "targets": [
    {
      "target_name": "devforge_native_cpp",
      "sources": [
        "src/addon.cpp",
        "src/screen_capture.cpp",
        "src/input_simulator.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "src"
      ],
      "libraries": [],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "CLANG_CXX_LIBRARY": "libc++"
      },
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": "Async"
        }
      },
      "conditions": [
        ["OS==\"win\"", {
          "libraries": [
            "user32.lib",
            "gdi32.lib",
            "dwmapi.lib"
          ],
          "defines": ["WIN32_LEAN_AND_MEAN", "NOMINMAX"]
        }],
        ["OS==\"mac\"", {
          "libraries": [
            "-framework Cocoa",
            "-framework CoreGraphics",
            "-framework ApplicationServices"
          ],
          "xcode_settings": {
            "OTHER_LDFLAGS": ["-framework Cocoa -framework CoreGraphics -framework ApplicationServices"]
          }
        }],
        ["OS==\"linux\"", {
          "libraries": [
            "X11",
            "Xtst",
            "Xfixes",
            "Xdamage",
            "Xcomposite"
          ],
          "defines": ["_GNU_SOURCE"]
        }]
      ]
    }
  ]
}