#!/bin/bash
set -ex

# Build script for Travis-CI.

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
ROOTDIR="$SCRIPTDIR/../.."
WHISKDIR="$ROOTDIR/../openwhisk"

export OPENWHISK_HOME=$WHISKDIR

IMAGE_PREFIX="testing"

# Deploy OpenWhisk
cd $WHISKDIR/ansible
ANSIBLE_CMD="ansible-playbook -i ${ROOTDIR}/ansible/environments/local -e docker_image_prefix=${IMAGE_PREFIX}"
$ANSIBLE_CMD setup.yml
$ANSIBLE_CMD prereq.yml
$ANSIBLE_CMD couchdb.yml
$ANSIBLE_CMD initdb.yml
$ANSIBLE_CMD wipe.yml
$ANSIBLE_CMD openwhisk.yml

docker images
docker ps

cat $WHISKDIR/whisk.properties
curl -s -k https://172.17.0.1 | jq .
curl -s -k https://172.17.0.1/api/v1 | jq .

#Deployment
WHISK_APIHOST="172.17.0.1"
WHISK_AUTH=`cat ${WHISKDIR}/ansible/files/auth.guest`
WHISK_CLI="${WHISKDIR}/bin/wsk -i"

${WHISK_CLI} property set --apihost ${WHISK_APIHOST} --auth ${WHISK_AUTH} 
${WHISK_CLI} property get


