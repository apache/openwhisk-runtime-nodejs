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
 * Object which encapsulates a first-class function, the user code for an action.
 *
 * This file (runner.js) must currently live in root directory for nodeJsAction.
 */
const fs = require('fs');
const path = require('path');

/** Initializes the handler for the user function. */
function initializeActionHandler(message) {
    if (message.binary) {
        // The code is a base64-encoded zip file.
        return unzipInTmpDir(message.code)
            .then(moduleDir => {
                let parts = splitMainHandler(message.main);
                if (parts === undefined) {
                    // message.main is guaranteed to not be empty but be defensive anyway
                    return Promise.reject('Name of main function is not valid.');
                }

                // If there is only one property in the "main" handler, it is the function name
                // and the module name is specified either from package.json or assumed to be index.js.
                let [index, main] = parts;

                // Set the executable directory to the project dir.
                process.chdir(moduleDir);

                if (index === undefined && !fs.existsSync('package.json') && !fs.existsSync('index.js')) {
                    return Promise.reject('Zipped actions must contain either package.json or index.js at the root.');
                }

                //  The module to require.
                let whatToRequire = index !== undefined ? path.join(moduleDir, index) : moduleDir;
                let handler = eval('require("' + whatToRequire + '").' + main);
                return assertMainIsFunction(handler, message.main);
            })
            .catch(error => Promise.reject(error));
    } else try {
        let handler = eval(
          `(function(){
               ${message.code}
               try {
                 return ${message.main}
               } catch (e) {
                 if (e.name === 'ReferenceError') {
                    return module.exports.${message.main} || exports.${message.main}
                 } else throw e
               }
           })()`);
        return assertMainIsFunction(handler, message.main);
    } catch (e) {
        return Promise.reject(e);
    }
}

class NodeActionRunner {

    constructor(handler) {
        this.userScriptMain = handler;
    }

    run(args) {
        return new Promise((resolve, reject) => {
            try {
                var result = this.userScriptMain(args);
            } catch (e) {
                reject(e);
            }

            this.finalizeResult(result, resolve);
        });
    };

    finalizeResult(result, resolve) {
        // Non-promises/undefined instantly resolve.
        Promise.resolve(result).then(resolvedResult => {
            // This happens, e.g. if you just have "return;"
            if (typeof resolvedResult === "undefined") {
                resolvedResult = {};
            }
            resolve(resolvedResult);
        }).catch(error => {
            // A rejected Promise from the user code maps into a
            // successful promise wrapping a whisk-encoded error.

            // Special case if the user just called "reject()".
            if (!error) {
                resolve({error: {}});
            } else {
                const serializeError = require('serialize-error');
                resolve({error: serializeError(error)});
            }
        });
    }
}

/**
 * Copies the base64 encoded zip file contents to a temporary location,
 * decompresses it and returns the name of that directory.
 *
 * Note that this makes heavy use of shell commands because the environment is expected
 * to provide the required executables.
 */
function unzipInTmpDir(zipFileContents) {
    const mkTempCmd = "mktemp -d XXXXXXXX";
    return exec(mkTempCmd).then(tmpDir => {
        return new Promise((resolve, reject) => {
            const zipFile = path.join(tmpDir, "action.zip");
            fs.writeFile(zipFile, zipFileContents, "base64", err => {
                if (!err) resolve(zipFile);
                else reject("There was an error reading the action archive.");
            });
        });
    }).then(zipFile => {
        return exec(mkTempCmd).then(tmpDir => {
            return exec("unzip -qq " + zipFile + " -d " + tmpDir)
                .then(res => path.resolve(tmpDir))
                .catch(error => Promise.reject("There was an error uncompressing the action archive."));
        });
    });
}

/** Helper function to run shell commands. */
function exec(cmd) {
    const child_process = require('child_process');

    return new Promise((resolve, reject) => {
        child_process.exec(cmd, (error, stdout, stderr) => {
            if (!error) {
                resolve(stdout.trim());
            } else {
                reject(stderr.trim());
            }
        });
    });
}

/**
 * Splits handler into module name and path to main.
 * If the string contains no '.', return [ undefined, the string ].
 * If the string contains one or more '.', return [ string up to first period, rest of the string after ].
 */
function splitMainHandler(handler) {
    let matches = handler.match(/^([^.]+)$|^([^.]+)\.(.+)$/);
    if (matches && matches.length == 4) {
        let index = matches[2];
        let main = matches[3] || matches[1];
        return [index, main]
    } else return undefined
}

function assertMainIsFunction(handler, name) {
    if (typeof handler === 'function') {
        return Promise.resolve(handler);
    } else {
        return Promise.reject("Action entrypoint '" + name + "' is not a function.");
    }
}

module.exports = {
    NodeActionRunner,
    initializeActionHandler
};
