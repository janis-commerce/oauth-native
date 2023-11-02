# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [unreleased]

### Added

- Added getUserInfo function in order to return current logged user data

### [v1.2.2] - 2023-09-14

### Fixed

- Fixed the error message at handleAuthorize

## [v1.2.1] - 2023-03-16

### Fixed

- Fixed error in decode function

## [v1.2.0]

### changed

- changed react and react-native version for dev dependencies and peer dependencies

## [v1.1.0]

### changed

- default value for oauth dta is now empty object

## [v1.0.1]

### changed

- main package file

### removed

- build-status workflow
- react-native-builder-bob

## [v1.0.0]

### Added

- initial react native code
- react-native-builder-bob installation and config
- eslint prettier
- jest plugins and configuration files
- husky and lint-staged
- Async storage and react-native-app-auth as peer dependencies
- functions and components tests
- context file
- main AuthProvider component
- useOauthData custom hook to get userData and handlers
