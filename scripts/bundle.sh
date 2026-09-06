#!/usr/bin/env bash
# Run the locked bundle with this project's local gems and compatible toolchain.
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

export BUNDLE_PATH="${BUNDLE_PATH:-vendor/bundle}"
ruby_command=(ruby)

if [[ "$(uname -s)" == "Darwin" ]]; then
  sdk_path="$(xcrun --show-sdk-path)"
  # Some Command Line Tools installations omit this directory from clang++'s search path.
  if [[ -d "$sdk_path/usr/include/c++/v1" ]]; then
    export CPLUS_INCLUDE_PATH="$sdk_path/usr/include/c++/v1${CPLUS_INCLUDE_PATH:+:$CPLUS_INCLUDE_PATH}"
  fi

  # On this Mac, system Ruby is universal but the existing Homebrew OpenSSL is Intel.
  # Keep Ruby, native gems, and OpenSSL on the same architecture without changing macOS Ruby.
  openssl_path="/usr/local/opt/openssl@3"
  if [[ "$(command -v ruby)" == "/usr/bin/ruby" && -f "$openssl_path/lib/libssl.dylib" ]] &&
      file "$openssl_path/lib/libssl.dylib" | grep -q 'x86_64'; then
    ruby_command=(/usr/bin/arch -x86_64 /usr/bin/ruby)
    export ARCHFLAGS="-arch x86_64"
    export BUNDLE_BUILD__EVENTMACHINE="${BUNDLE_BUILD__EVENTMACHINE:---with-ssl-dir=$openssl_path}"
  fi
fi

# Template text and styles contain Unicode even when the shell's locale is unset.
exec "${ruby_command[@]}" -E UTF-8 -S bundle "$@"
