#!/bin/bash
set -ex

# Build script for Travis-CI.

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
ROOTDIR="$SCRIPTDIR/../.."
WHISKDIR="$ROOTDIR/../openwhisk"

export OPENWHISK_HOME=$WHISKDIR

cd ${ROOTDIR}
TERM=dumb ./gradlew :tests:checkScalafmtAll
TERM=dumb ./gradlew :tests:test --tests *NodeJs*Tests



