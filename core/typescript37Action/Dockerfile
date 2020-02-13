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
#RUN env CGO_ENABLED=0 go get github.com/apache/openwhisk-runtime-go/main \
#    && mv /go/bin/main /bin/proxy
RUN git clone --branch ack-and-versioning \
   https://github.com/nimbella-corp/openwhisk-runtime-go /src ;\
   cd /src ; env GO111MODULE=on CGO_ENABLED=0 go build main/proxy.go && \
   mv proxy /bin/proxy
FROM node:12.1.0-stretch
ENV TYPESCRIPT_VERSION=3.7.4
COPY --from=builder /bin/proxy /bin/proxy
RUN apt-get update && apt-get install -y \
    imagemagick \
    graphicsmagick \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/* &&\
    mkdir -p /app/action
RUN cd /app ;\
  npm install -g yarn ;\
  npm install -g typescript@${TYPESCRIPT_VERSION} ;\
  echo '{"private":true}' >package.json ;\
  npm install --save --no-package-lock --production \
  axios@0.19.0 \
  async@2.6.1 \
  aws-sdk@2.401.0 \
  bluebird@3.5.3 \
  body-parser@1.18.3 \
  btoa@1.2.1 \
  gm@1.23.1 \
  @google-cloud/datastore@4.4.1 \
  @google-cloud/storage@4.0.1 \
  nano@8.0.0 \
  redis@2.8.0 \
  tmp@0.0.31 \
  twilio@3.28.0 \
  uuid@3.0.0 \
  openwhisk@3.18.0 \
  && npm cache clean --force
WORKDIR /app

EXPOSE 8080

ARG __LAMBDA_COMPAT
ENV __LAMBDA_COMPAT=$__LAMBDA_COMPAT

COPY bin/compile /bin/compile
COPY lib/launcher.ts /lib/launcher.ts
ENV OW_COMPILER=/bin/compile
ENV OW_LOG_INIT_ERROR=1
ENV OW_WAIT_FOR_ACK=1
ENV OW_EXECUTION_ENV=openwhisk/typescript3.7
ENTRYPOINT ["/bin/proxy"]
