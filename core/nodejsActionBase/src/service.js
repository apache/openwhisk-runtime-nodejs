/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var NodeActionRunner = require('../runner');

function NodeActionService(config) {

    var Status = {
        ready: 'ready',
        starting: 'starting',
        running: 'running',
        stopped: 'stopped'
    };

    // TODO: save the entire configuration for use by any of the route handlers
    var status = Status.ready;
    var ignoreRunStatus = config.allowConcurrent === undefined ? false : config.allowConcurrent.toLowerCase() === "true";
    var server = undefined;
    var userCodeRunner = undefined;

    function setStatus(newStatus) {
        if (status !== Status.stopped) {
            status = newStatus;
        }
    }

    /**
     * An ad-hoc format for the endpoints returning a Promise representing,
     * eventually, an HTTP response.
     *
     * The promised values (whether successful or not) have the form:
     * { code: int, response: object }
     *
     */
    function responseMessage (code, response) {
        return { code: code, response: response };
    }

    function errorMessage (code, errorMsg) {
        return responseMessage(code, { error: errorMsg });
    }

    /**
     * Starts the server.
     *
     * @param app express app
     */
    this.start = function start(app) {
        server = app.listen(config.port, function() {
            var host = server.address().address;
            var port = server.address().port;
        });

        // This is required as http server will auto disconnect in 2 minutes, this to not auto disconnect at all
        server.timeout = 0;
    };

    /** Returns a promise of a response to the /init invocation.
     *
     *  req.body = { main: String, code: String, binary: Boolean }
     */
    this.initCode = function initCode(req) {

        if (status === Status.ready && userCodeRunner === undefined) {

            setStatus(Status.starting);

            var body = req.body || {};
            var message = body.value || {};

            if (message.main && message.code && typeof message.main === 'string' && typeof message.code === 'string') {
                return doInit(message).then(function (result) {
                    setStatus(Status.ready);
                    return responseMessage(200, { OK: true });
                }).catch(function (error) {
                    setStatus(Status.stopped);
                    var errStr = "Initialization has failed due to: " + error.stack ? String(error.stack) : error;
                    return Promise.reject(errorMessage(502, errStr));
                });
            } else {
                setStatus(Status.ready);
                var msg = "Missing main/no code to execute.";
                return Promise.reject(errorMessage(403, msg));
            }
        } else if (userCodeRunner !== undefined) {
            var msg = "Cannot initialize the action more than once.";
            console.error("Internal system error:", msg);
            return Promise.reject(errorMessage(403, msg));
        } else {
            var msg = "System not ready, status is " + status + ".";
            console.error("Internal system error:", msg);
            return Promise.reject(errorMessage(403, msg));
        }
    };

    /**
     * Returns a promise of a response to the /exec invocation.
     * Note that the promise is failed if and only if there was an unhandled error
     * (the user code threw an exception, or our proxy had an internal error).
     * Actions returning { error: ... } are modeled as a Promise successful resolution.
     *
     * req.body = { value: Object, meta { activationId : int } }
     */
    this.runCode = function runCode(req) {
        if (status === Status.ready) {
            if (!ignoreRunStatus) {
                setStatus(Status.running);
            }

            return doRun(req).then(function (result) {
                if (!ignoreRunStatus) {
                    setStatus(Status.ready);
                }
                if (typeof result !== "object") {
                    return errorMessage(502, "The action did not return a dictionary.");
                } else {
                    return responseMessage(200, result);
                }
            }).catch(function (error) {
                var msg = "An error has occurred: " + error;
                setStatus(Status.stopped);
                return Promise.reject(errorMessage(502, msg));
            });
        } else {
            var msg = "System not ready, status is " + status + ".";
            console.error("Internal system error:", msg);
            return Promise.reject(errorMessage(403, msg));
        }
    };

    function doInit(message) {
        userCodeRunner = new NodeActionRunner();

        return userCodeRunner.init(message).then(function (result) {
            // 'true' has no particular meaning here. The fact that the promise
            // is resolved successfully in itself carries the intended message
            // that initialization succeeded.
            return true;
        }).catch(function (error) {
            // emit error to activation log then flush the logs as this
            // is the end of the activation
            console.error('Error during initialization:', error);
            writeMarkers();
            return Promise.reject(error);
        });
    }

    function doRun(req) {
        var msg = req && req.body || {};
        // Move per-activation keys to process env. vars with __OW_ (reserved) prefix)
        Object.keys(msg).forEach(
            function (k) {
                if(typeof msg[k] === 'string' && k !== 'value'){
                    var envVariable = '__OW_' + k.toUpperCase();
                    process.env[envVariable] = msg[k];
                }
            }
        );

        return userCodeRunner.run(msg.value).then(function(result) {
            if (typeof result !== "object") {
                console.error('Result must be of type object but has type "' + typeof result + '":', result);
            }
            writeMarkers();
            return result;
        }).catch(function (error) {
            console.error(error);
            writeMarkers();
            return Promise.reject(error);
        });
    }

    function writeMarkers() {
        console.log('XXX_THE_END_OF_A_WHISK_ACTIVATION_XXX');
        console.error('XXX_THE_END_OF_A_WHISK_ACTIVATION_XXX');
    }
}

NodeActionService.getService = function(config) {
    return new NodeActionService(config);
};

module.exports = NodeActionService;
