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

# Apache OpenWhisk runtimes for nodejs

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)
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
./gradlew core:nodejs6Action:distDocker
```
This will produce the image `whisk/nodejs6action`

For Node.js 8
```
./gradlew core:nodejs8Action:distDocker
```
This will produce the image `whisk/action-nodejs-v8`


Build and Push image for Node.js 6
```
docker login
./gradlew core:nodejs6Action:distDocker -PdockerImagePrefix=$prefix-user -PdockerRegistry=docker.io
```

Build and Push image for Node.js 8
```
docker login
./gradlew core:nodejs8Action:distDocker -PdockerImagePrefix=$prefix-user -PdockerRegistry=docker.io
```
Then create the action using your image from dockerhub
```
wsk action update myAction myAction.js --docker $user_prefix/nodejs6action
```
The `$user_prefix` is usually your dockerhub user id.

Deploy OpenWhisk using ansible environment that contains the kind `nodejs:6` and `nodejs:8`
Assuming you have OpenWhisk already deployed locally and `OPENWHISK_HOME` pointing to root directory of OpenWhisk core repository.

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

### Testing
Install dependencies from the root directory on $OPENWHISK_HOME repository
```
./gradlew install
```

Using gradle for the ActionContainer tests you need to use a proxy if running on Mac, if Linux then don't use proxy options
You can pass the flags `-Dhttp.proxyHost=localhost -Dhttp.proxyPort=3128` directly in gradle command.
Or save in your `$HOME/.gradle/gradle.properties`
```
systemProp.http.proxyHost=localhost
systemProp.http.proxyPort=3128
```
Using gradle to run all tests
```
./gradlew :tests:test
```
Using gradle to run some tests
```
./gradlew :tests:test --tests *ActionContainerTests*
```
Using IntelliJ:
- Import project as gradle project.
- Make sure working directory is root of the project/repo
- Add the following Java VM properties in ScalaTests Run Configuration, easiest is to change the Defaults for all ScalaTests to use this VM properties
```
-Dhttp.proxyHost=localhost
-Dhttp.proxyPort=3128
```

# Disclaimer

Apache OpenWhisk Runtime Node.js is an effort undergoing incubation at The Apache Software Foundation (ASF), sponsored by the Apache Incubator. Incubation is required of all newly accepted projects until a further review indicates that the infrastructure, communications, and decision making process have stabilized in a manner consistent with other successful ASF projects. While incubation status is not necessarily a reflection of the completeness or stability of the code, it does indicate that the project has yet to be fully endorsed by the ASF.
