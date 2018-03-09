# Apache OpenWhisk runtimes for nodejs
[![Build Status](https://travis-ci.org/apache/incubator-openwhisk-runtime-nodejs.svg?branch=master)](https://travis-ci.org/apache/incubator-openwhisk-runtime-nodejs)


### Give it a try today
To use as a docker action for Node.js 6
```
wsk action update myAction myAction.js --docker openwhisk/nodejs6action
```
To use as a docker action for Node.js 8
```
wsk action update myAction myAction.js --docker openwhisk/action-nodejs-v8
```
This works on any deployment of Apache OpenWhisk

### To use on deployment that contains the rutime as a kind
To use as a kind action using Node.js 6
```
wsk action update myAction myAction.js --kind nodejs:6
```
To use as a kind action using Node.js 8
```
wsk action update myAction myAction.js --kind nodejs:8
```

### Local development
For Node.js 6
```
./gradlew core:nodejs6Action:buildDockerImage
```
This will produce the image `whisk/nodejs6action`

For Node.js 8
```
./gradlew core:nodejs8Action:buildDockerImage
```
This will produce the image `whisk/action-nodejs-v8`

### Pushing your own image

You will need to configure registry information (at least username and password) in `./docker-local.gradle`.  Refer to `./docker-local.gradle.sample` for examples.

Build and Push image for Node.js 6
```
./gradlew core:nodejs6Action:pushDockerImage -PdockerImagePrefix=$user_prefix
```

Build and Push image for Node.js 8
```
./gradlew core:nodejs8Action:pushDockerImage -PdockerImagePrefix=$user_prefix
```
Then create the action using your image from dockerhub
```
wsk action update myAction myAction.js --docker $user_prefix/nodejs6action
```
The `$user_prefix` is usually your dockerhub user id.  (Officially, Docker
registry specs call it the 'library' of your image.)

Deploy OpenWhisk using ansible environment that contains the kind `nodejs:6`
and `nodejs:8`.
Assuming you have OpenWhisk already deployed locally and `OPENWHISK_HOME`
pointing to root directory of OpenWhisk core repository.

Set `ROOTDIR` to the root directory of this repository.

Redeploy OpenWhisk
```
cd $OPENWHISK_HOME/ansible
ANSIBLE_CMD="ansible-playbook -i ${ROOTDIR}/ansible/environments/local"
$ANSIBLE_CMD setup.yml
$ANSIBLE_CMD couchdb.yml
$ANSIBLE_CMD initdb.yml
$ANSIBLE_CMD wipe.yml
$ANSIBLE_CMD openwhisk.yml
```

Or you can use `wskdev` and create a soft link to the target ansible environment, for example:
```
ln -s ${ROOTDIR}/ansible/environments/local ${OPENWHISK_HOME}/ansible/environments/local-nodejs
wskdev fresh -t local-nodejs
```

### Multi-architecture image builds

Docker supports multi-architecture manifests -- essentially "images" that pick
the appropriate download binaries depending on the architecture of the target
docker container.  Building multi-architecture OpenWhisk images supports
execution of OpenWhisk technology on multiple target platforms.

The `./docker-local.gradle` file is where the target architectures are defined.
Each architecture is linked to a docker instance where the image build can take
place.  That instance can be local or remote (non-TLS or TLS).  TLS-secured
instances should be secured as documented
[by Docker](https://docs.docker.com/engine/security/https/).

You'll also need to define registry information in `./docker-local.gradle`.
The build process creates individual single-architecture images, tags them as
`latest-${arch}`, pushes them to the registry, then creates and pushes the
multi-architecture manifest with a tag of simply `latest`.

To make the magic happen:
```
./gradlew core:nodejs8Action:putMultidocker -PdockerImagePrefix=$user_prefix
```

(The `user_prefix` will default to `whisk` if it isn't set to something).

# License
[Apache 2.0](LICENSE.txt)
