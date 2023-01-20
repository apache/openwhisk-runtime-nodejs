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

# Apache OpenWhisk runtimes for Node.js

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)
[![Build Status](https://travis-ci.com/apache/openwhisk-runtime-nodejs.svg?branch=master)](https://travis-ci.com/github/apache/openwhisk-runtime-nodejs)

This repository contains sources files needed to build the Node.js runtimes for Apache OpenWhisk. The build system will produce a series of docker images for each runtime version. These images are used in the platform to execute Node.js actions.

The following Node.js runtime versions (with kind & image labels) are generated by the build system:

- Node.js 14.19 (`nodejs:14` & `openwhisk/action-nodejs-v14`)
- Node.js 16 (`nodejs:16` & `openwhisk/action-nodejs-v16`)
- Node.js 18 (`nodejs:18` & `openwhisk/action-nodejs-v18`)

This README documents the build, customisation and testing of these runtime images.

**Do you want to learn more about using Node.js actions to build serverless applications?** Please see the main project documentation [here](https://github.com/apache/openwhisk/blob/master/docs/actions-nodejs.md) for that information.

## Usage

If the deployment of Apache OpenWhisk includes these images in the runtime manifest, use the `--kind` parameter to select the Node.js runtime version.

### Node.js v14

```
wsk action update myAction myAction.js --kind nodejs:14
```

### Node.js v16

```
wsk action update myAction myAction.js --kind nodejs:16
```

## Images

All the runtime images are published by the project to Docker Hub @ [https://hub.docker.com/u/openwhisk](https://hub.docker.com/u/openwhisk)

- [https://hub.docker.com/r/openwhisk/action-nodejs-v14](https://hub.docker.com/r/openwhisk/action-nodejs-v14)
- [https://hub.docker.com/r/openwhisk/action-nodejs-v16](https://hub.docker.com/r/openwhisk/action-nodejs-v16)
- [https://hub.docker.com/r/openwhisk/action-nodejs-v18](https://hub.docker.com/r/openwhisk/action-nodejs-v18)

These images can be used to execute Node.js actions on any deployment of Apache OpenWhisk, even those without those images defined the in runtime manifest, using the `--docker` action parameter.

```
wsk action update myAction myAction.js --docker openwhisk/action-nodejs-v16
```

If you build a custom version of the images, pushing those an external Docker Hub repository will allow you to use those on the Apache OpenWhisk deployment.

### Runtimes Manifest

Available runtimes in Apache OpenWhisk are defined using the runtimes manifest in this file: [runtimes.json](https://github.com/apache/openwhisk/blob/master/ansible/files/runtimes.json#L16-L72)

Modify the manifest and re-deploy the platform to pick up local images changes.

## Development

Dockerfiles for runtime images are defined in the `core` directory. Each runtime version folder has a custom `Dockerfile` and `package.json`. If you need to add extra dependencies to a runtime version - modify these files.

The `core/nodejsActionBase` folder contains the Node.js app server used to implement the [action interface](https://github.com/apache/openwhisk/blob/master/docs/actions-new.md#action-interface), used by the platform to inject action code into the runtime and fire invocation requests. This common code is used in all runtime versions.

### Build

- Run the `distDocker` command to generate local Docker images for the different runtime versions.

```
./gradlew core:nodejs14Action:distDocker
./gradlew core:nodejs16Action:distDocker
./gradlew core:nodejs18Action:distDocker
```

This will return the following runtime images with the following names: `action-nodejs-v14`, `action-nodejs-v16`, and `action-nodejs-v18`.

### Testing

- Install project dependencies from the top-level Apache OpenWhisk [project](https://github.com/apache/openwhisk), which ensures correct versions of dependent libraries are available in the Maven cache.

```
./gradlew install
```

*This command **MUST BE** run from the directory containing the main Apache OpenWhisk [repository](https://github.com/apache/openwhisk), not this repository's directory.*

- Build the local Docker images for the runtime versions (see the instructions above).
- Build the custom Docker images used in local testing.

```
./gradlew tests:dat:docker:nodejs14docker:distDocker
./gradlew tests:dat:docker:nodejs16docker:distDocker
./gradlew tests:dat:docker:nodejs18docker:distDocker
```

- Run the project tests.

```
./gradlew :tests:test
```
