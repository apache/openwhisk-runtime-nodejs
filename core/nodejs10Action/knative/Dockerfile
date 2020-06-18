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

FROM node:10.20.1-stretch
RUN apt-get update && apt-get install -y \
    imagemagick \
    graphicsmagick \
    unzip \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /nodejsAction
# COPY source code "*.js" from nodejsActionBase to current working dir
RUN mkdir /src /platform
COPY ./core/nodejsActionBase/*.js ./
COPY ./core/nodejsActionBase/src/*.js ./src/
COPY ./core/nodejsActionBase/platform/*.js ./platform/
COPY . .
# COPY the package.json to root container, so we can install npm packages a level up from user's packages,
# so user's packages take precedence
COPY ./core/nodejsActionBase/package.json /
RUN cd / && npm install --no-package-lock \
    && npm cache clean --force
EXPOSE 8080
# The flag --experimental-worker enables worker threads, see https://nodejs.org/docs/latest-v10.x/api/worker_threads.html
CMD node --experimental-worker --expose-gc app.js
