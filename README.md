# Apache OpenWhisk runtimes for nodejs
[![Build Status](https://travis-ci.org/apache/incubator-openwhisk-runtime-nodejs.svg?branch=master)](https://travis-ci.org/apache/incubator-openwhisk-runtime-nodejs)


### Give it a try today
To use as a docker action
```
wsk action update myAction myAction.js --docker openwhisk/nodejs6action:1.0.0
```
This works on any deployment of Apache OpenWhisk

### To use on deployment that contains the rutime as a kind
To use as a kind action
```
wsk action update myAction myAction.js --kind nodejs:6
```

### Local development
```
./gradlew core:swiftAction:distDocker
```
This will produce the image `whisk/nodejs6action`

Build and Push image
```
docker login
./gradlew core:nodejs6Action:distDocker -PdockerImagePrefix=$prefix-user -PdockerRegistry=docker.io 
```

Deploy OpenWhisk using ansible environment that contains the kind `nodejs:6`
Assuming you have OpenWhisk already deploy localy and `OPENWHISK_HOME` pointing to root directory of OpenWhisk core repository.

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

To use as docker action push to your own dockerhub account
```
docker tag whisk/nodejs6action $user_prefix/nodejs6action
docker push $user_prefix/nodejs6action
```
Then create the action using your image from dockerhub
```
wsk action update myAction myAction.js --docker $user_prefix/nodejs6action
```
The `$user_prefix` is usually your dockerhub user id.



# License
[Apache 2.0](LICENSE.txt)


