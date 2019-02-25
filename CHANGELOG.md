# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.1] - 2019-02-25

### Fixed

- Previous release did not actually contain changes. 😣

## [0.3.0] - 2019-02-25

### Added

- Added support for `title` attribute.

### Changed

- The name of the library for the UMD build is now `newswireFrames` instead of `frames`. This change was necessary to prevent a clash with the native [`Window.frames`](https://developer.mozilla.org/en-US/docs/Web/API/Window/frames).

## [0.2.0] - 2019-02-12

### Changed

- We no longer use [spread in object literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#Spread_in_object_literals), which was adding an [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) call in the compiled library. This breaks `@newswire/frames` in IE 11. We've moved to a tiny built-in extend implementation that restores IE 11 support.

## [0.1.0] - 2018-12-30

### Added

- Initial release!
