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

FROM golang:1.12 as builder
RUN env CGO_ENABLED=0 go get github.com/apache/openwhisk-runtime-go/main \
    && mv /go/bin/main /bin/proxy

FROM node:12.1.0-stretch
COPY --from=builder /bin/proxy /bin/proxy

ENV TYPESCRIPT_VERSION=3.7.4
ENV OW_COMPILER=/bin/compile
ENV OW_LOG_INIT_ERROR=1
ENV OW_WAIT_FOR_ACK=1
ENV OW_EXECUTION_ENV=openwhisk/typescript3.7

# Initial update and some basics.
#
RUN apt-get update && apt-get install -y \
    imagemagick \
    graphicsmagick \
    unzip \
    && rm -rf /var/lib/apt/lists/* &&\
    mkdir -p /app/action

# Add sources and copy the package.json to root container,
# so npm packages from user functions take precendence.
#
WORKDIR /app
COPY bin/compile /bin/compile
COPY lib/launcher.ts /lib/launcher.ts
COPY package.json /

# Customize runtime with additional packages.
#
RUN cd / && npm install -g \
  yarn \
  typescript@${TYPESCRIPT_VERSION} \
  && npm install --no-package-lock --production @types/node@13.13.5 \
  && npm install --no-package-lock --production \
  && npm cache clean --force

EXPOSE 8080

ENTRYPOINT ["/bin/proxy"]
