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

SCRIPTDIR=$(cd "$(dirname "$0")" && pwd)
ROOTDIR=$(cd "$SCRIPTDIR/../.." && pwd)
WHISKDIR=$(cd "$ROOTDIR/../openwhisk" && pwd)
UTILDIR=$(cd "$ROOTDIR/../incubator-openwhisk-utilities" && pwd)

IMAGE_PREFIX="testing"

# run scancode using the ASF Release configuration
echo "---------------------------------------------------------------------------------------"
echo " Checking for well-formed code "
echo "---------------------------------------------------------------------------------------"
cd "$UTILDIR"
scancode/scanCode.py --config scancode/ASF-Release-v2.cfg "$ROOTDIR"

# Build OpenWhisk
echo "---------------------------------------------------------------------------------------"
echo " Building common test components "
echo "---------------------------------------------------------------------------------------"
cd "$WHISKDIR"

./gradlew --console=plain \
  :common:scala:install \
  :core:controller:install \
  :core:invoker:install \
  :tests:install

# Determine which NodeJS(s) are to be built in this run
# shellcheck disable=SC2016
case "$NODEJS_VERSION" in
  6) builds=( :core:nodejs6Action:dockerBuildImage );;
  8) builds=( :core:nodejs8Action:dockerBuildImage );;
  *) echo 'Must set a value $NODEJS_VERSION'; exit 256;;
esac

# Build runtime
echo "---------------------------------------------------------------------------------------"
echo " Building " "${builds[@]}"
echo "---------------------------------------------------------------------------------------"

cd "$ROOTDIR"
export docker_local_json='{"local":null}'
./gradlew --console=plain "${builds[@]}" -PdockerImagePrefix=${IMAGE_PREFIX}

echo "---------------------------------------------------------------------------------------"

