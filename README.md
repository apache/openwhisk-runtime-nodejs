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

# Apache OpenWhisk runtimes for Node.js

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)
[![Build Status](https://travis-ci.org/apache/incubator-openwhisk-runtime-nodejs.svg?branch=master)](https://travis-ci.org/apache/incubator-openwhisk-runtime-nodejs)


The basics of creating OpenWhisk action is explained in core OpenWhisk repo under [OpenWhisk Actions](https://github.com/apache/incubator-openwhisk/blob/master/docs/actions.md#the-basics). The following sections walks you through creating and invoking a simple JavaScript action such as `hello world`. Then add parameters to an action and invoke that action with parameters, followed by setting default parameters and invoking action. Finally, demonstrate how to bundle multiple JavaScript files and third party modules.

### Create OpenWhisk Actions using JavaScript

1. Create a JavaScript file named  `hello.js` with the following content:

```javascript
function main() {
    return { msg: 'Hello world' };
}
```

2. Create an action using `hello.js` with `wsk` CLI:

```bash
$ wsk action create hello hello.js
ok: created action hello
```

3. Invoke the `hello` action as a blocking activation:

```bash
$ wsk action invoke hello --blocking
{
  "result": {
      "payload": "Hello world"
    },
    "status": "success",
    "success": true
}
```

### Node.js Runtime Enviornment

JavaScript actions can be executed in Node.js version 6 or Node.js version 8. Currently actions are executed by default in a Node.js version 6 environment.

The `wsk` CLI automatically infers the type of the action by using the source file extension.
For `.js` source files, the action runs by using a **Node.js** runtime. You may specify
the Node.js runtime to use by explicitly specifying the parameter `--kind nodejs:6` or `--kind nodejs:8`.

### Actions with Parameters

Parameters can be passed to the action when it is invoked.

1. Create `hello.js` file with the following content:

```javascript
function main(params) {
    var name = params.name || 'stranger';
    var place = params.place || 'somewhere';
    return {payload:  'Hello, ' + name + ' from ' + place};
}
```

The input parameters are passed as a JSON object parameter to the main function. 

2. Update the action:

```bash
$ wsk action update hello hello.js
```

3. Parameters can be provided explicitly on the command-line by using `--param` flag:

```bash
$ wsk action invoke --result hello --param name Dorothy --param place Kansas
```

This produces the result:

```bash
{
    "payload": "Hello, Dorothy from Kansas"
}
```

[Working with Parameters](https://github.com/apache/incubator-openwhisk/blob/master/docs/parameters.md#working-with-parameters) in core OpenWhisk demonstrates few more ways to specify parameters for an action during it's invocation.

### Hello as a OpenWhisk Docker Action

To create `hello` as a docker action for Node.js 6

```
wsk action update hello hello.js --docker openwhisk/nodejs6action
```

To create `hello` as a docker action for Node.js 8

```
wsk action update hello hello.js --docker openwhisk/action-nodejs-v8
```

This works on any deployment of Apache OpenWhisk.

### Beyond Hello - JavaScript Promise for an External API

This example shows how to call an external API like a Yahoo Weather service to get the current weather conditions at a specific location.

1. Create `weather.js` with the following content:

```javascript
function main(params) {
    var location = params.location || 'Vermont';
    var url = 'https://query.yahooapis.com/v1/public/yql?q=select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + location + '")&format=json';
    var request = require("request");

    return new Promise(function (resolve, reject) {
        request.get(url, function (error, response, body) {
            console.log("we are inside the request");
            if (error) {
                console.log(error);
                reject(error);
            } else {
                if (response.statusCode == 200) {
                    var condition = JSON.parse(body).query.results.channel.item.condition;
                    var conditionText = condition.text;
                    var conditionTemp = condition.temp;
                    var output = 'It is ' + conditionTemp + ' degrees in ' + location + ' and ' + conditionText + '!';
                    resolve({msg: output});
                } else {
                    reject({
                        statusCode: response.statusCode,
                        response: body
                    });
                }
            }
        });
    });
}
```

Note that the action in this example uses the JavaScript request library to make an HTTP request to the Yahoo Weather API, and extracts fields from the JSON result. See the [Node.js version 6 Envionment](#nodejs-version-6-enviornment) for the Node.js packages available in the runtime environment.

This example also shows the need for asynchronous actions. The action returns a Promise to indicate that the result of this action is not available yet when the function returns. Instead, the result is available in the request callback after the HTTP call completes, and is passed as an argument to the resolve() function.

A call to `reject()` can be used to reject the Promise and signal that the activation has completed abnormally.

2. Create an action from the `weather.js` file:

```bash
wsk action create weather weather.js
```

3. Use the following command to run the action, and observe the output:

```bash
wsk action invoke --result weather --param location "Brooklyn, NY"
```

Using the `--result` flag means that the value returned from the action is shown as output on the command-line:

```bash
{
    "msg": "It is 28 degrees in Brooklyn, NY and Cloudy!"
}
```

### Beyond Hello - JavaScript Promise for Queuing Asynchronous Actions

You can add `then` together to transform values or run additional asynchronous actions one after another.

The following example demonstrates multiple concpts:

* Usage of `wsk.actions.invoke` to invoke any OpenWhisk action which returns `Promise`.
* Adding `then` to replace `Hello` with `Goodbye` in the greeting message returned from action invoked inside of the `Promise`.

1. Create `goodbye.js` with the following content:

```javascript
var openwhisk = require('openwhisk');

function main(params) {
    var wsk = openwhisk({ignore_certs: params.ignore_certs || false});
    var wsk = openwhisk();
    return wsk.actions.invoke({
        actionName: '/whisk.system/samples/greeting',
        params: {
            name: params.name,
            place: params.place
        },
        blocking: true
    }).then(activation => {
        console.log('activation:', activation);
        var payload = activation.response.result.payload.toString();
        var output = payload.replace("Hello", "Goodbye");
        return { msg: output };
    });
}
```

2. Create an action from the `goodbye.js` file:

```bash
wsk action create goodbye goodbye.js
```

3. Use the following command to run the action, and observe the output:

```bash
wsk action invoke --result goodbye --param name "Amy" --param location "Paris"
```
Returns:

```bash
{
    "msg": "Goodbye, Amy from Paris!"
}
```

### Node.js version 6 Enviornment

The Node.js [6.14.4](https://github.com/apache/incubator-openwhisk-runtime-nodejs/blob/master/core/nodejs6Action/Dockerfile#L21) environment will be used for an action if the `--kind` flag is explicitly specified with a value of `nodejs:6` when creating/updating the action.

The following packages are available to be used in the Node.js 6.14.4 environment:

| Package Name | Package Description |
| ------------ | ------------------- |
| [apn v2.1.2](https://www.npmjs.com/package/apn) | A Node.js module for interfacing with the Apple Push Notification service.
| [async v2.1.4](https://www.npmjs.com/package/async) | Provides functions for working with asynchronous functions.
| [btoa v1.1.2](https://www.npmjs.com/package/btoa) | A port of the browser's btoa function.
| [cheerio v0.22.0](https://www.npmjs.com/package/cheerio) | Fast, flexible & lean implementation of core jQuery designed specifically for the server.
| [cloudant v1.6.2](https://www.npmjs.com/package/cloudant) | This is the official Cloudant library for Node.js.
| [commander v2.9.0](https://www.npmjs.com/package/commander) | The complete solution for Node.js command-line interfaces.
| [consul v0.27.0](https://www.npmjs.com/package/consul) | A client for Consul, involving service discovery and configuration.
| [cookie-parser v1.4.3](https://www.npmjs.com/package/cookie-parser) | Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
| [cradle v0.7.1](https://www.npmjs.com/package/cradle) | A high-level, caching, CouchDB client for Node.js.
| [errorhandler v1.5.0](https://www.npmjs.com/package/errorhandler) | Development-only error handler middleware.
| [glob v7.1.1](https://www.npmjs.com/package/glob) | Match files by using patterns that the shell uses, like stars and stuff.
| [gm v1.23.0](https://www.npmjs.com/package/gm) | GraphicsMagick and ImageMagick for Node.
| [lodash v4.17.2](https://www.npmjs.com/package/lodash) | The Lodash library exported as Node.js modules.
| [log4js v0.6.38](https://www.npmjs.com/package/log4js) | A conversion of the log4js framework designed to work with Node.
| [iconv-lite v0.4.15](https://www.npmjs.com/package/iconv-lite) | Pure JS character encoding conversion
| [marked v0.3.6](https://www.npmjs.com/package/marked) | A full-featured markdown parser and compiler, which is written in JavaScript. Built for speed.
| [merge v1.2.0](https://www.npmjs.com/package/merge) | Merge multiple objects into one, optionally creating a new cloned object.
| [moment v2.17.0](https://www.npmjs.com/package/moment) | A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.
| [mongodb v2.2.11](https://www.npmjs.com/package/mongodb) | The official MongoDB driver for Node.js.
| [mustache v2.3.0](https://www.npmjs.com/package/mustache) | Mustache.js is an implementation of the mustache template system in JavaScript.
| [nano v6.2.0](https://www.npmjs.com/package/nano) | Minimalistic couchdb driver for Node.js.
| [node-uuid v1.4.7](https://www.npmjs.com/package/node-uuid) | Deprecated UUID packaged.
| [nodemailer v2.6.4](https://www.npmjs.com/package/nodemailer) | Send e-mails from Node.js – easy as cake!
| [oauth2-server v2.4.1](https://www.npmjs.com/package/oauth2-server) | Complete, compliant, and well tested module for implementing an OAuth2 Server/Provider with express in Node.js.
| [openwhisk v3.17.0](https://www.npmjs.com/package/openwhisk) | JavaScript client library for the OpenWhisk platform. Provides a wrapper around the OpenWhisk APIs.
| [pkgcloud v1.4.0](https://www.npmjs.com/package/pkgcloud) | pkgcloud is a standard library for Node.js that abstracts away differences among multiple cloud providers.
| [process v0.11.9](https://www.npmjs.com/package/process) | Require('process'); just like any other module.
| [pug v2.0.0-beta6](https://www.npmjs.com/package/pug) | Implements the Pug templating language.
| [redis v2.6.3](https://www.npmjs.com/package/redis) | This is a complete and feature-rich Redis client for Node.js.
| [request v2.79.0](https://www.npmjs.com/package/request) | Request is the simplest way possible to make HTTP calls.
| [request-promise v4.1.1](https://www.npmjs.com/package/request-promise) | The simplified HTTP request client 'request' with Promise support. Powered by Bluebird.
| [rimraf v2.5.4](https://www.npmjs.com/package/rimraf) | The UNIX command rm -rf for node.
| [semver v5.3.0](https://www.npmjs.com/package/semver) | Supports semantic versioning.
| [sendgrid v4.7.1](https://www.npmjs.com/package/sendgrid) | Provides email support via the SendGrid API.
| [serve-favicon v2.3.2](https://www.npmjs.com/package/serve-favicon) | Node.js middleware for serving a favicon.
| [socket.io v1.6.0](https://www.npmjs.com/package/socket.io) | Socket.IO enables real-time bidirectional event-based communication.
| [socket.io-client v1.6.0](https://www.npmjs.com/package/socket.io-client) | Client-side support for Socket.IO.
| [superagent v3.0.0](https://www.npmjs.com/package/superagent) | SuperAgent is a small progressive client-side HTTP request library, and Node.js module with the same API, sporting many high-level HTTP client features.
| [swagger-tools v0.10.1](https://www.npmjs.com/package/swagger-tools) | Tools that are related to working with Swagger, a way to document APIs.
| [tmp v0.0.31](https://www.npmjs.com/package/tmp) | A simple temporary file and directory creator for node.js.
| [twilio v2.11.1](https://www.npmjs.com/package/twilio) | A wrapper for the Twilio API, related to voice, video, and messaging.
| [underscore v1.8.3](https://www.npmjs.com/package/underscore) | Underscore.js is a utility-belt library for JavaScript that supports the usual functional suspects (each, map, reduce, filter...) without extending any core JavaScript objects.
| [uuid v3.0.0](https://www.npmjs.com/package/uuid) | Simple, fast generation of RFC4122 UUIDS.
| [validator v6.1.0](https://www.npmjs.com/package/validator) | A library of string validators and sanitizers.
| [watson-developer-cloud v2.29.0](https://www.npmjs.com/package/watson-developer-cloud) | Node.js client library to use the Watson Developer Cloud services, a collection of APIs that use cognitive computing to solve complex problems.
| [when v3.7.7](https://www.npmjs.com/package/when) | When.js is a rock solid, battle-tested Promises/A+ and when() implementation, including a complete ES6 Promise shim.
| [winston v2.3.0](https://www.npmjs.com/package/winston) | A multi-transport async logging library for node.js. "CHILL WINSTON! ... I put it in the logs."
| [ws v1.1.1](https://www.npmjs.com/package/ws) | ws is a simple to use, blazing fast, and thoroughly tested WebSocket client and server implementation.
| [xml2js v0.4.17](https://www.npmjs.com/package/xml2js) | Simple XML to JavaScript object converter. It supports bi-directional conversion.
| [xmlhttprequest v1.8.0](https://www.npmjs.com/package/xmlhttprequest) | node-XMLHttpRequest is a wrapper for the built-in http client to emulate the browser XMLHttpRequest object.
| [yauzl v2.7.0](https://www.npmjs.com/package/yauzl) | Yet another unzip library for node. For zipping.



### Node.js version 8 Enviornment

The Node.js version [8.11.3](https://github.com/apache/incubator-openwhisk-runtime-nodejs/blob/master/core/nodejs8Action/Dockerfile#L18) environment is used if the `--kind` flag is explicitly specified with a value of `nodejs:8` when creating or updating an action.

The following packages are pre-installed in the Node.js version 8.11.3 environment:

| Package Name | Package Description |
| ------------ | ------------------- |
| [body-parser v1.18.2](https://www.npmjs.com/package/body-parser) | Node.js body parsing middleware.
| [btoa v1.1.2](https://www.npmjs.com/package/btoa) | A port of the browser's btoa function.
| [express v4.16.2](https://www.npmjs.com/package/express) | Fast, unopinionated, minimalist web framework for node.
| [log4js v0.6.38](https://www.npmjs.com/package/log4js) | A conversion of the log4js framework designed to work with Node.
| [openwhisk v3.17.0](https://www.npmjs.com/package/openwhisk) | JavaScript client library for the OpenWhisk platform. Provides a wrapper around the OpenWhisk APIs.
| [request v2.79.0](https://www.npmjs.com/package/request) | Request is the simplest way possible to make HTTP calls.

### Local Development

#### Build Node.js 6 Docker Image:

```
git clone https://github.com/apache/incubator-openwhisk-runtime-nodejs.git
cd incubator-openwhisk-runtime-nodejs
./gradlew core:nodejs6Action:distDocker
```

This will produce the image `whisk/nodejs6action`

#### Build Node.js 8 Docker Image:

```
git clone https://github.com/apache/incubator-openwhisk-runtime-nodejs.git
cd incubator-openwhisk-runtime-nodejs
./gradlew core:nodejs8Action:distDocker
```

This will produce the image `whisk/action-nodejs-v8`

#### Build and Push Docker Image for Node.js 6:

> Note: The `$USER_PREFIX` is generally your Docker Hub user id.

```
docker login
./gradlew core:nodejs6Action:distDocker -PdockerImagePrefix=$USER_PREFIX -PdockerRegistry=docker.io
```

#### Build and Push Docker Image for Node.js 8:

> Note: The `$USER_PREFIX` is generally your Docker Hub user id.

```
docker login
./gradlew core:nodejs8Action:distDocker -PdockerImagePrefix=$USER_PREFIX -PdockerRegistry=docker.io
```

#### Create Action using Your Custom Built Image:

> Note: The `$USER_PREFIX` is generally your Docker Hub user id.

```
wsk action update hello hello.js --docker $USER_PREFIX/nodejs6action
```

Or

```
wsk action update hello hello.js --docker $USER_PREFIX/nodejs8action
```

### 


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
