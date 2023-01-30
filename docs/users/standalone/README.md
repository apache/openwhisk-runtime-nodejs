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
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)

This README walks you through how to build, customise and test Apache OpenWhisk Node.js runtime images.
## Pre-requisites
- [Gradle](https://gradle.org/)
- [Docker](https://www.docker.com/)
- [curl](https://curl.se/)
## Building the Runtime Container
Choose a NodeJS version. All build files reside inside `core/nodejsActionBase`. If you take a look into `core/nodejsActionBase/Dockerfile` you’ll see a line that looks like:
```
FROM node:lts-stretch
```
This will use the latest NodeJS version. But we want to be more specific. Now if you look into each of the Dockerfile within `core/nodejs14Action`, `core/nodejs16Action`, `core/nodejs18Action`, you’ll notice different NodeJS versions. Let’s go ahead with the 18 version. We are going to use this version throughout the README, for the others, you merely have to modify the version number.

Gradle will a create `build` folder that will contain all the necessary files to build our NodeJS container. Next, it will copy the NodeJS application (server used to implement the [action interface](https://github.com/apache/openwhisk/blob/master/docs/actions-new.md#action-interface)) as well as the target Dockerfile with the NodeJS version 18.

What Gradle does is equivalent to running these commands
```
mkdir build
cp -r core/nodejsActionBase/* build
cp core/nodejs18Action/Dockerfile build
```

Now, run the `distDocker` command to generate a local Docker image for the chosen runtime version. (Make sure docker daemon is running)

```
./gradlew core:nodejs18Action:distDocker
```

This will return the following runtime image with the name `action-nodejs-v18`. Since a docker image is created, you can check the `IMAGE ID` for `nodejs-action-v18`
```
docker images
```
## Running the Container
For the testing purpose, we are going to start the container locally that has Node.js app server inside. The Apache OpenWhisk platform uses this server to inject action code into the runtime and fire invocation requests. In order to access this service within the container from the outside, as we are about to do using `curl`, port mapping needs to be done next. As a result, we can now access the web service inside docker by first reaching an IP port on `localhost`, which subsequently forwards the request to the docker container's designated port.
In our example, the `Action` container exposes `port 8080` (see the Dockerfile for the associated Docker image), thus we publish the container's `port 8080` to the `localhost` (here, `port 3008` on `localhost` is chosen arbitrarily, as long as the port is not already used for something else):
```
docker run --publish 3008:8080 --name=bloom_whisker -i -t action-nodejs-v18:latest
```
A simpler way is to map `port 80 ` on `localhost ` to the container's `port 8080`. The port number assigned to the HTTP protocol is `80`. Since we will be sending actions against the runtime using HTTP, using this number will allow us to omit the port in the request later. Oftentimes, `port 80 ` could already be occupied by another process. Without loss of generality, the following examples will use the arbitrarily chosen `port 3008`.

Lists all running containers
```
docker ps
```
or
```
docker ps -a
```
You should see a container named `bloom_whisker` being run.

## Create your function
A container can only hold one function. This first example prepared a `js-init.json` file which contains the function.
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
The json file contains a simple JavaScript (the target runtime language) function, which is the actual payload.

## Initialze the Runtime
Before issuing the action against the runtime, we first initialize the function with by invoking the ```/init``` endpoint.
```
curl -H "Content-Type:application/json" -X POST --data '@/$FILEPATH/js-init.json' http://localhost:3008/init
```
the expected response being
```
{"ok":true}
```

As mentioned above, if `port 80` on `localhost` was used, the command could simply be
```
curl -H "Content-Type:application/json" -X POST --data '@/$FILEPATH/js-init.json' http://localhost/init
```

## Run the function

Invoke the function using the ```/run``` endpoint.

```
curl -H ""Content-Type:application/json" -X POST --data '@/$FILEPATH/js-init.json' http://localhost:3008/run
```

The JavaScript function in this example is one without arguments (nullary function). Using the same json file as during initialization won't be a problem. Ideally, we should have provided another file `js-params.json` with the arguments to trigger the function.
```json
{
   "value": {}
}
```
In this case the command to trigger the function should be
```
curl -H ""Content-Type:application/json" -X POST --data '/$FILEPATH/js-params.json' http://localhost:3008/run
```

The expected response should be
```
{"payload":"Hello World!"}
```
Also the running container will print the following message in the terminal
```
XXX_THE_END_OF_A_WHISK_ACTIVATION_XXX
```

## Functions with arguments
If your container still running from the previous example you must stop it before proceeding. Because each NodeJS runtime can only hold one function which cannot be overridden.

Create a file called `js-init-params.json` that contains the function to be initialized
```json
{
   "value": {
      "name": "js-helloworld-with-params",
      "main" : "main",
      "binary" : false,
      "code" : "function main(params) { return {payload: 'Hello ' + params.name + ' from ' + params.place + '!!!'} }"
   }
}
```

Also, create a file called `js-run-params.json` which contains the parameters for triggering the function.
```json
{
   "value": {
      "name": "Visitor",
      "place": "Earth"
   }
}
```
These files shall be sent via the `init` API and via the `run` API respectively.

To initialize the function, please make sure your NodeJS runtime container is running.
First, issue a `POST` request against the `init` API using curl:
```
curl -H "Content-Type:application/json" -X POST --data '@/$FILEPATH/js-init-params.json' http://localhost:3008/init
```

Next, trigger the function by issuing this request against the `run` API using curl:
```
curl -H ""Content-Type:application/json" -X POST --data '/$FILEPATH/js-run-params.json' http://localhost:3008/run
```

You should expect the following client response:
```
{"payload": "Hello Visitor from Earth!!!"}
```

And this response from the container:
```
XXX_THE_END_OF_A_WHISK_ACTIVATION_XXX
```

## Thanks for following along!
