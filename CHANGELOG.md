# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [unreleased]

### [v.1.8.0] - 2025-05-27

### Added

- isTokenExpired util in order to check tokens expiration

### Changed

- default values for withTokensExpirationAccess hoc.

### [v.1.7.0] - 2025-05-14

### Changed

- withTokenExpirationAccess in order to work with a config time to consider as near expiration

### [v.1.6.0] - 2025-04-03

### Added

- withTokenExpirationAccess to logout user if token is expired.

### [v.1.5.0] - 2025-02-13

### Changed

- Error handler in getAccessToken and getUserInfo

### [v.1.4.2] - 2025-02-07

### Changed

- Error message when having expired tokens

### [v.1.4.1] - 2024-06-10

### Fixed

- Fixed an error when converting null type to object

### [v.1.4.0] - 2023-12-26

### Added

- Added getAccessToken function in order to return the accessToken string updated.

### [v1.3.1] - 2023-11-27

### Fixed

- Fixed the userTokens, at getUserInfo, are now obtained from getAuthData. This is to ensure that the data is always up to date.

### [v1.3.0] - 2023-11-03

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
