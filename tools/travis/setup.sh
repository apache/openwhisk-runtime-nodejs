#!/bin/bash
set -e

# Build script for Travis-CI.

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
ROOTDIR="$SCRIPTDIR/../.."
HOMEDIR="$SCRIPTDIR/../../../"

# OpenWhisk stuff
cd $HOMEDIR
git clone --depth=1 https://github.com/apache/incubator-openwhisk.git openwhisk
cd openwhisk
./tools/travis/setup.sh

