# on-load Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 4.0.2 - 2019-03-29
* Fix timing/loading collision bug - ([#40](https://github.com/shama/on-load/pull/40))

## 4.0.1 - 2018-08-10
* Allow observation before the document is ready - ([#39](https://github.com/shama/on-load/pull/39))

## 4.0.0 - 2018-08-10
* Only load/unload nodes if `document.documentElement.contains(node)` - ([#35](https://github.com/shama/on-load/pull/35))
* Switch from testron to tape-run.

## 3.4.1 - 2018-06-28
* Tweak browser export definition format

## 3.4.0 - 2018-02-18
* Observer attached further up the DOM to `document.documentElement` instead of `body`

## 3.3.4 - 2017-12-03
* Fix node export

## 3.3.3 - 2017-12-03
* Noop version to skip over unpublished 3.3.2

## 3.3.2 - 2017-12-03
* Fix export for unbundled electron imports.
* Update deps
