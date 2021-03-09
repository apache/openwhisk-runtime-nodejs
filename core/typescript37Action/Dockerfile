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

# build go proxy from source
FROM golang:1.15 AS builder_source
ARG GO_PROXY_GITHUB_USER=apache
ARG GO_PROXY_GITHUB_BRANCH=master
RUN git clone --branch ${GO_PROXY_GITHUB_BRANCH} \
   https://github.com/${GO_PROXY_GITHUB_USER}/openwhisk-runtime-go /src ;\
   cd /src ; env GO111MODULE=on CGO_ENABLED=0 go build main/proxy.go && \
   mv proxy /bin/proxy

# or build it from a release
FROM golang:1.15 AS builder_release
ARG GO_PROXY_RELEASE_VERSION=1.15@1.17.0
RUN curl -sL \
  https://github.com/apache/openwhisk-runtime-go/archive/{$GO_PROXY_RELEASE_VERSION}.tar.gz\
  | tar xzf -\
  && cd openwhisk-runtime-go-*/main\
  && GO111MODULE=on go build -o /bin/proxy

FROM node:12.1.0-stretch

# select the builder to use
ARG GO_PROXY_BUILD_FROM=release

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

WORKDIR /proxy
COPY --from=builder_source /bin/proxy /bin/proxy_source
COPY --from=builder_release /bin/proxy /bin/proxy_release
RUN mv /bin/proxy_${GO_PROXY_BUILD_FROM} /bin/proxy

# Add sources and copy the package.json to root container,
# so npm packages from user functions take precedence.
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
