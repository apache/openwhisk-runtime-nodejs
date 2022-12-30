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

# Tests for OpenWhisk NodeJS Runtime as Standalone Container
## Building the Runtime Container
After a runtime container is built, one should be able to run it as a standalone container.
The following example shows how to generate a Docker image for the Node.js 18 runtime version and test the standalone runtime using the `curl` command. Testing other runtime versions can be done in the same manner.

- Run the `distDocker` command to generate the local Docker image for the desired runtime version.
```
./gradlew core:nodejs18Action:distDocker
```
This will return the following runtime image with the name `action-nodejs-v18`, which should be listed after using the `docker images`

## Running the Container
For the purpose of the test. We are going to start the container that has a web service running inside it built using Node/Express. In order to access this service within the container from the outside, as we are about to do using `curl`, port mapping needs to be done next. As a result, we can now access the web service inside docker by first reaching an IP port on `localhost`, which subsequently forwards the request to the docker container's designated port.
In our example, the `Action` container exposes `port 8080` (see the Dockerfile for the associated Docker image), thus we publish the container's `port 8080` to the `localhost` (here, `port 3008` on `localhost` is chosen arbitrarily, as long as the port is not already assigned for something else):
```
docker run --publish 3008:8080 -i -t action-nodejs-v18:latest
```
A simpler way is to map `port 80` on `localhost` to the container's `port 8080`. The port number assigned to the HTTP protocol is `80` Since we will be sending actions against the runtime using HTTP, using this number will allow us to omit the port in the request later. Without loss of generality, the following examples will use the arbitrarily chosen `port 3008`

## Testing
This example has prepared a `helloworld.json` file to post using `curl`.
```json
{
  "value": {
    "name" : "nodejs-helloworld",
    "main" : "main",
    "binary": false,
    "code" : "function main() {return {payload: 'Hello World!'};}"
  }
}
```
The json file contains a simple JavaScript function, which is the actual payload.

### Initialze the Runtime
Before issuing the action against the runtime, we first initialize the function with by invoking the ```/init``` endpoint.
```
curl -H "Content-Type:application/json" -X POST --data '@openwhisk-runtime-nodejs/tests/src/test/standalone/helloworld/helloworld.json' http://localhost:3008/init

{"OK":true}
```
being the expected response.

As mentioned above, if `port 80` on `localhost` was used, the command could simply be
```
curl -H "Content-Type:application/json" -X POST --data '@openwhisk-runtime-nodejs/tests/src/test/standalone/helloworld/helloworld.json' http://localhost/init
```

#### Run the function

Invoke the function using the ```/run``` endpoint.

```
curl -H ""Content-Type:application/json" -X POST --data '@openwhisk-runtime-nodejs/tests/src/test/standalone/helloworld/helloworld.json' http://localhost:3008/run
```

The JavaScript function in this example is one without arguments. Using the same json file as during initialization won't be a problem. Strictly speaking, we should have provided another json file with the arguments. In our case, it should simply be
```json
{
   "value": {}
}
```
The expected response should be
```
{"payload":"Hello World!"}
```
Also the running container will print
```
XXX_THE_END_OF_A_WHISK_ACTIVATION_XXX
```
in the terminal
