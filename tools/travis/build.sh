#!/bin/bash
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

set -ex

# Build script for Travis-CI.

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
ROOTDIR="$SCRIPTDIR/../.."
WHISKDIR="$ROOTDIR/../openwhisk"

export OPENWHISK_HOME=$WHISKDIR

IMAGE_PREFIX="testing"

<<<<<<< 9879cd0ecc4bf1110cc0c1fee710d4430e6c7304
=======
# Build runtime
cd $ROOTDIR
TERM=dumb ./gradlew \
:core:nodejs6Action:distDocker \
:core:nodejs8Action:distDocker \
-PdockerImagePrefix=${IMAGE_PREFIX}


>>>>>>> Re-integrate testing into build.
# Build OpenWhisk
cd $WHISKDIR

#pull down images
docker pull openwhisk/controller
docker tag openwhisk/controller ${IMAGE_PREFIX}/controller
docker pull openwhisk/invoker
docker tag openwhisk/invoker ${IMAGE_PREFIX}/invoker
docker pull openwhisk/nodejs6action
docker tag openwhisk/nodejs6action ${IMAGE_PREFIX}/nodejs6action

<<<<<<< b59997f36229ec066662d53fdadea295ea3049ff
TERM=dumb ./gradlew \
:common:scala:install \
:core:controller:install \
:core:invoker:install \
:tests:install
=======
#Build CLI
TERM=dumb ./gradlew \
:tools:cli:distDocker \
-PdockerImagePrefix=${IMAGE_PREFIX}
>>>>>>> Cleaning up from diffs for PR

# Build runtime
cd $ROOTDIR
TERM=dumb ./gradlew \
:core:nodejs6Action:distDocker \
:core:nodejs8Action:distDocker \
-PdockerImagePrefix=${IMAGE_PREFIX}
