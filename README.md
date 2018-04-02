<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more contributor
# license agreements.  See the NOTICE file distributed with this work for additional
# information regarding copyright ownership.  The ASF licenses this file to you
# under the Apache License, Version 2.0 (the # "License"); you may not use this
# file except in compliance with the License.  You may obtain a copy of the License
# at:
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
# CONDITIONS OF ANY KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations under the License.
#
-->

# Apache OpenWhisk runtimes for nodejs

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)
[![Build Status](https://travis-ci.org/apache/incubator-openwhisk-runtime-nodejs.svg?branch=master)](https://travis-ci.org/apache/incubator-openwhisk-runtime-nodejs)

## Give it a try today

To use as a docker action for Node.js 6

```
wsk action update myAction myAction.js --docker openwhisk/nodejs6action
```

To use as a docker action for Node.js 8

```
wsk action update myAction myAction.js --docker openwhisk/action-nodejs-v8
```

This works on any deployment of Apache OpenWhisk

## To use on deployment that contains the rutime as a kind

To use as a kind action using Node.js 6

```
wsk action update myAction myAction.js --kind nodejs:6
```

To use as a kind action using Node.js 8

```
wsk action update myAction myAction.js --kind nodejs:8
```

## Building and hacking

This runtime has been converted to a multi-architecture build.  For details on
building it, see
[here](https://github.com/apache/incubator-openwhisk-runtime-nodejs/blob/master/docs/runtimes-building.md)

