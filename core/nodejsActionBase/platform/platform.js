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

/**
 * Runtime platform factory
 *
 * This module is a NodeJS compatible version of a factory that will
 * produce an implementation module provides OpenWhisk Language
 * Runtime functionality and is able to register endpoints/handlers
 * allowing to host OpenWhisk Actions and process OpenWhisk Activations.
 */


// Export supported platform impls.
const PLATFORM_OPENWHISK = 'openwhisk';
const PLATFORM_KNATIVE =  'knative';

const SUPPORTED_PLATFORMS = [
    PLATFORM_OPENWHISK,
    PLATFORM_KNATIVE
];

module.exports = class PlatformFactory {

    /**
     * Object constructor
     * @param app NodeJS express application instance
     * @param cfg Runtime configuration
     * @@param svc Runtime services (default handlers)
     */
    constructor (app, cfg, svc) {
        this._app = app;
        this._service = svc;
        this._config = cfg;
    }

    /**
     * @returns {string[]} List of supported platforms by their string ID
     */
    static get SUPPORTED_PLATFORMS() {
        return SUPPORTED_PLATFORMS;
    }

    static get PLATFORM_OPENWHISK() {
        return PLATFORM_OPENWHISK;
    }

    static get PLATFORM_KNATIVE() {
        return PLATFORM_KNATIVE;
    }

    get app(){
        return this._app;
    }

    get service(){
        return this._service;
    }

    get config(){
        return this._config;
    }

    /**
     * validate if a platform ID is a known, supported value
     * @param id Platform Id
     */
    static isSupportedPlatform(id) {
        if (SUPPORTED_PLATFORMS.indexOf(id) > -1) {
            return true;
        }
        return false;
    }

    /**
     * Instantiate a platform implementation
     * @param id Platform ID
     * @returns {PlatformImpl} Platform instance (interface), as best can be done with NodeJS
     */
    createPlatformImpl(id) {
        // Load the appropriate implementation module and return reference to it
        switch (id.toLowerCase()) {
            case PLATFORM_KNATIVE:
                const knPlatformImpl = require('./knative.js');
                this._platformImpl = new knPlatformImpl(this);
                break;
            case PLATFORM_OPENWHISK:
                const owPlatformImpl = require('./openwhisk.js');
                this._platformImpl = new owPlatformImpl(this);
                break;
            default:
                console.error("Platform ID is not a known value (" + id + ").");
        }
        return this._platformImpl;
    }

    /**
     * Wraps an endpoint written to return a Promise into an express endpoint,
     * producing the appropriate HTTP response and closing it for all controllable
     * failure modes.
     *
     * The expected signature for the promise value (both completed and failed)
     * is { code: int, response: object }.
     *
     * @param ep a request=>promise function
     * @returns an express endpoint handler
     */
    wrapEndpoint(ep) {
        return function (req, res) {
            try {
                ep(req).then(function (result) {
                    res.status(result.code).json(result.response);
                }).catch(function (error) {
                    if (typeof error.code === "number" && typeof error.response !== "undefined") {
                        res.status(error.code).json(error.response);
                    } else {
                        console.error("[wrapEndpoint]", "invalid errored promise", JSON.stringify(error));
                        res.status(500).json({ error: "Internal error." });
                    }
                });
            } catch (e) {
                // This should not happen, as the contract for the endpoints is to
                // never (externally) throw, and wrap failures in the promise instead,
                // but, as they say, better safe than sorry.
                console.error("[wrapEndpoint]", "exception caught", e.message);
                res.status(500).json({ error: "Internal error (exception)." });
            }
        }
    }
};
