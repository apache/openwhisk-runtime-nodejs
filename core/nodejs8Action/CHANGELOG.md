<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
-->

# NodeJS 8 OpenWhisk Runtime Container

## Next release
Changes:
  - Update OpenWhisk npm package

Node.js version = [8.17.0](https://nodejs.org/en/blog/release/v8.17.0/)
OpenWhisk version = [OpenWhisk v3.21.2](https://www.npmjs.com/package/openwhisk)

## Apache 1.15
Changes:
  - Update Node.js
  - Update OpenWhisk npm package
  - Support for __OW_ACTION_VERSION (openwhisk/4761)

Node.js version = [8.17.0](https://nodejs.org/en/blog/release/v8.17.0/)
OpenWhisk version = [OpenWhisk v3.21.1](https://www.npmjs.com/package/openwhisk)

## Apache 1.13
Changes:
- Update Node.js
- Update OpenWhisk npm package

- [OpenWhisk v3.18.0](https://www.npmjs.com/package/openwhisk) - JavaScript client library for the OpenWhisk platform. Provides a wrapper around the OpenWhisk APIs.

Node.js version = [8.16.1](https://nodejs.org/en/blog/release/v8.16.1/)

## 1.9.0 (Apache 1.12)
Change: Update OpenWhisk npm package from `3.16.0` to `3.17.0`

- [OpenWhisk v3.17.0](https://www.npmjs.com/package/openwhisk) - JavaScript client library for the OpenWhisk platform. Provides a wrapper around the OpenWhisk APIs.

## 1.8.3
Change: Update Node.js

Node.js version = [8.11.4](https://nodejs.org/en/blog/release/v8.11.4/)

## 1.8.2
Change: Update runtime to allow more environment variables

- Update run handler to accept more environment variables [#78](https://github.com/apache/openwhisk-runtime-nodejs/pull/78)

## 1.8.1
Change: Update runtime to put runtime npm modules at root level, user npm modules at container invocation level

- Don't override runtime npm packages when user provides their own [#73](https://github.com/apache/openwhisk-runtime-nodejs/pull/73/files)

## 1.8.0
Change: Update runtime to work in concurrent mode

- Update runtime to work in concurrent mode [#41](https://github.com/apache/openwhisk-runtime-nodejs/pull/41/files)

## 1.7.0
Change: Update OpenWhisk npm package from `3.15.0` to `3.16.0`

- [OpenWhisk v3.16.0](https://www.npmjs.com/package/openwhisk) - JavaScript client library for the OpenWhisk platform. Provides a wrapper around the OpenWhisk APIs.

## 1.6.3
Changes:
  - Disallow re-initialization.
  - Fix bug where some log messages appear after the log maker.

## 1.6.2
Change: Update Node.js

Node.js version = 8.11.3

## 1.6.1
Change: Update Node.js

Node.js version = 8.11.2

## 1.6.0
Change: Update OpenWhisk npm package from `3.14.0` to `3.15.0`

- [OpenWhisk v3.15.0](https://www.npmjs.com/package/openwhisk) - JavaScript client library for the OpenWhisk platform. Provides a wrapper around the OpenWhisk APIs.

## 1.5.1
Change: Update Node.js

Node.js version = 8.11.1

## 1.5.0
Change: Update Node.js

Node.js version = 8.11.0

## 1.4.0
Change: Update nodejs and OpenWhisk npm package

Node version = 8.10.0

- [OpenWhisk v3.14.0](https://www.npmjs.com/package/openwhisk) - JavaScript client library for the OpenWhisk platform. Provides a wrapper around the OpenWhisk APIs.

## 1.3.0
Change: Update npm OpenWhisk package

- [OpenWhisk v3.13.1](https://www.npmjs.com/package/openwhisk) - JavaScript client library for the OpenWhisk platform. Provides a wrapper around the OpenWhisk APIs.

## 1.2.0
Change: Update npm OpenWhisk package

- [OpenWhisk v3.12.0](https://www.npmjs.com/package/openwhisk) - JavaScript client library for the OpenWhisk platform. Provides a wrapper around the OpenWhisk APIs.

## 1.1.0
Change: Update nodejs and OpenWhisk npm package

Node version = 8.9.3

- [OpenWhisk v3.11.0](https://www.npmjs.com/package/openwhisk) - JavaScript client library for the OpenWhisk platform. Provides a wrapper around the OpenWhisk APIs.

## 1.0.0
Change: Initial release

Node version = 8.9.1

- [OpenWhisk v3.10.0](https://www.npmjs.com/package/openwhisk) - JavaScript client library for the OpenWhisk platform. Provides a wrapper around the OpenWhisk APIs.
