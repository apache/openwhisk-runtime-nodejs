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

# OpenWhisk NodeJS Runtimes for Knative

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)

This document explains how to Build and Serve Knative compatible OpenWhisk applications on Kubernetes.

## Pre-requisites

The general pre-requisites are as follows:
- [x] Kubernetes v1.13.0
- [x] kubectl
- [x] Knative v0.3.0

Specifically, for development and testing on Mac OS, the following components and versions were used:

- [x] [Docker Desktop for Mac Docker Community Edition 2.0.1.0 2019-01-11](https://docs.docker.com/docker-for-mac/edge-release-notes/) which includes:
    - Docker 18.09.1
    - Kubernetes 1.13.0
- [x] [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) (```brew install kubernetes-cli```)
- [x] [Knative 0.3.0](https://github.com/knative/serving/releases/tag/v0.3.0) (which will install and configure istio-1.0.1 compatible resources)

### Docker Desktop Minimum Configuration

Under the Docker Desktop menu select "**Preferences**"->"**Advanced**" and set these values to at least these minimums:
- [x] **CPUs: 4**
- [x] **Memory: 8.0 GiB**
- [x] **Swap: 1.0 GiB**

Under the Docker Desktop **Kubernetes** tab, please assure that Kubernetes is **enabled** and running.

### Verify Kubernetes Installation

Use the following command to verify the Kubernetes **Server Version** indicates version 1.13:

```bash
$ kubectl version

Client Version: version.Info{Major:"1", Minor:"13", GitVersion:"v1.13.2", GitCommit:"cff46ab41ff0bb44d8584413b598ad8360ec1def", GitTreeState:"clean", BuildDate:"2019-01-13T23:15:13Z", GoVersion:"go1.11.4", Compiler:"gc", Platform:"darwin/amd64"}
Server Version: version.Info{Major:"1", Minor:"13", GitVersion:"v1.13.0", GitCommit:"ddf47ac13c1a9483ea035a79cd7c10005ff21a6d", GitTreeState:"clean", BuildDate:"2018-12-03T20:56:12Z", GoVersion:"go1.11.2", Compiler:"gc", Platform:"linux/amd64"}
```

The ```Server Version``` is the version for the Kubernetes service; the ```Client Version``` is for the Kubernetes CLI (i.e., ```kubectl```).

#### Verify you have a Kubernetes v1.13.0 node ready
```
$ kubectl get nodes

NAME             STATUS    ROLES     AGE       VERSION
docker-desktop   Ready     master    4d22h     v1.13.0
```

#### Verify all Kubernetes pods are running

```
$ kubectl get pods --namespace kube-system
```
<details>
    <summary>Sample output</summary>

```
NAME                                     READY     STATUS    RESTARTS   AGE
coredns-86c58d9df4-ms8qs                 1/1       Running   0          4d22h
coredns-86c58d9df4-x29vt                 1/1       Running   0          4d22h
etcd-docker-desktop                      1/1       Running   1          4d22h
kube-apiserver-docker-desktop            1/1       Running   1          4d22h
kube-controller-manager-docker-desktop   1/1       Running   3          4d22h
kube-proxy-mltsm                         1/1       Running   0          4d22h
kube-scheduler-docker-desktop            1/1       Running   3          4d22h
```
</details>

## Knative Install on a Kubernetes Cluster

The following instructions were used to install Knative: [Knative Install on a Kubernetes Cluster](https://github.com/knative/docs/blob/master/install/Knative-with-any-k8s.md)

These instructions take you through the installation of
- [x] [Istio v1.0.1](https://github.com/istio/istio/releases) using resources specifically configured for use with Knative Serving
- [x] [Knative v0.3.0](https://github.com/knative/serving/releases/tag/v0.3.0)

## Verify Knative installation

#### Verify Istio pods are running

```bash
$ kubectl get pods --namespace istio-system
```
<details>
    <summary>Sample output</summary>

```
NAME                                       READY     STATUS      RESTARTS   AGE
cluster-local-gateway-547467ccf6-p8n72     1/1       Running     1          4d21h
istio-citadel-7d64db8bcf-m7gsj             1/1       Running     0          4d21h
istio-cleanup-secrets-8lzj4                0/1       Completed   0          4d21h
istio-egressgateway-6ddf4c8bd6-2dxhc       1/1       Running     1          4d21h
istio-galley-7dd996474-pdd6h               1/1       Running     1          4d21h
istio-ingressgateway-84b89d647f-cxrwx      1/1       Running     1          4d21h
istio-pilot-86bb4fcbbd-5ns5q               2/2       Running     0          4d21h
istio-pilot-86bb4fcbbd-vd2xr               2/2       Running     0          4d21h
istio-pilot-86bb4fcbbd-zstrw               2/2       Running     0          4d21h
istio-policy-5c4d9ff96b-559db              2/2       Running     1          4d21h
istio-sidecar-injector-6977b5cf5b-94hj5    1/1       Running     0          4d21h
istio-statsd-prom-bridge-b44b96d7b-kzkzc   1/1       Running     0          4d21h
istio-telemetry-7676df547f-jp952           2/2       Running     1          4d21h
knative-ingressgateway-75644679c7-c2kxj    1/1       Running     1          4d21h
```
</details>

#### Verify your default namespace uses Istio for all services

Check the `default` namespace has the label **istio-injection** and it is set to **enabled**:

```bash
$ kubectl get namespace default -o yaml
```

Example output:
```
apiVersion: v1
kind: Namespace
metadata:
  creationTimestamp: 2019-01-29T19:30:44Z
  labels:
    istio-injection: enabled
  name: default
  resourceVersion: "3928"
  selfLink: /api/v1/namespaces/default
  uid: 5ecb1bb0-23fc-11e9-bed6-025000000001
spec:
  finalizers:
  - kubernetes
status:
  phase: Active
```


**Note**: If you do not see the **istio-injection** label, verify you issued the 'kubectl' command to set this label to the default namespace. See [Troubleshooting](#troubleshooting) section for more information.

# Building and Serving OpenWhisk Runtime Build Templates

All OpenWhisk Runtime Build Templates require a valid Kubernetes **Service Account** with access to a Kubernetes **Secret** that contains base64 encoded versions of your Docker Hub username and password.  This credential will be used as part of the Knative Build process to "push" your Knative application image containing your OpenWhisk Action to Docker Hub.

## Clone this repository

```bash
$ git clone https://github.com/apache/incubator-openwhisk-runtime-nodejs.git
```

## Register Secrets for Docker Hub

Use the following commands to generate base64 encoded values of your Docker Hub **username** and **password** required to register a new secret in Kubernetes.

```
$ export DOCKERHUB_USERNAME_PLAIN_TEXT=<your docker hub username>
$ export DOCKERHUB_PASSWORD_PLAIN_TEXT=<your docker hub password>

$ export DOCKERHUB_USERNAME_BASE64_ENCODED=`echo -n "${DOCKERHUB_USERNAME_PLAIN_TEXT}" | base64 -b 0`
# make sure that DOCKERHUB_USERNAME_BASE64_ENCODEDE is set to something similar to abcqWeRTy2gZApB==

$ export DOCKERHUB_PASSWORD_BASE64_ENCODED=`echo -n "${DOCKERHUB_PASSWORD_PLAIN_TEXT}" | base64 -b 0`
# make sure that DOCKERHUB_PASSWORD_BASE64_ENCODED is set to something similar to t80szzToPshrpDr3sdMn==
```

On your local system, copy the file [docker-secret.yaml.tmpl](../../core/nodejsActionBase/docker-secret.yaml.tmpl) to `docker-secrets.yaml` and replace the **username** and **password** values with the base64 encoded versions of your Docker Hub username and password using following `sed` command:

```
sed -e 's/${DOCKERHUB_USERNAME_BASE64_ENCODED}/'"$DOCKERHUB_USERNAME_BASE64_ENCODED"'/' -e 's/${DOCKERHUB_PASSWORD_BASE64_ENCODED}/'"$DOCKERHUB_PASSWORD_BASE64_ENCODED"'/' core/nodejsActionBase/docker-secret.yaml.tmpl > docker-secret.yaml
```

Apply the Secret resource manifest for Docker Hub:

```bash
$ kubectl apply -f docker-secret.yaml
secret/dockerhub-user-pass created
```

Verify Secret exists:

```bash
$ kubectl get secret
NAME                    TYPE                                  DATA      AGE
dockerhub-user-pass     kubernetes.io/basic-auth              2         21s
```

## Create Service Account for our Knative Builds

Knative requires a valid ServiceAccount resource that will be used when building and serving OpenWhisk Serverless Actions using the OpenWhisk runtimes.  For convenience, all Knative builds for all runtimes are configured to use the same ServiceAccount as defined in [service-account.yaml](../../core/nodejsActionBase/service-account.yaml).

```bash
$ kubectl apply -f service-account.yaml
serviceaccount/openwhisk-runtime-builder created
```

Verify the Service account has 2 secrets (i.e., username and password):

```
$ kubectl get serviceaccount/openwhisk-runtime-builder
NAME                        SECRETS   AGE
openwhisk-runtime-builder   2         3m46s
```

## Install the BuildTemplate for the NodeJS runtime

```
$ kubectl apply --filename buildtemplate.yaml
buildtemplate.build.knative.dev/openwhisk-nodejs-runtime created
```

#### Verify BuildTemplate

```
$ kubectl get buildtemplate
NAME                       AGE
openwhisk-nodejs-runtime   2h
```

or to see the full resource:
```
$ kubectl get buildtemplate -o yaml
```

<details>
    <summary>Sample output</summary>

```
apiVersion: v1
items:
- apiVersion: build.knative.dev/v1alpha1
  kind: BuildTemplate
  metadata:
    annotations:
      kubectl.kubernetes.io/last-applied-configuration {}
    creationTimestamp: "2019-02-07T16:10:46Z"
    generation: 1
    name: openwhisk-nodejs-runtime
    namespace: default
    resourceVersion: "278166"
    selfLink: /apis/build.knative.dev/v1alpha1/namespaces/default/buildtemplates/openwhisk-nodejs-runtime
    uid: ed5bb6e0-2af2-11e9-a25d-025000000001
  spec:
    generation: 1
    parameters:
    - description: name of the image to be tagged and pushed
      name: TARGET_IMAGE_NAME
    - default: latest
      description: tag the image before pushing
      name: TARGET_IMAGE_TAG
    - description: name of the dockerfile
      name: DOCKERFILE
    - default: "false"
      description: flag to indicate debug mode should be on/off
      name: OW_DEBUG
    - description: name of the action
      name: OW_ACTION_NAME
    - description: JavaScript source code to be evaluated
      name: OW_ACTION_CODE
    - default: main
      description: name of the function in the "__OW_ACTION_CODE" to call as the action
        handler
      name: OW_ACTION_MAIN
    - default: "false"
      description: flag to indicate zip function, for zip actions, "__OW_ACTION_CODE"
        must be base64 encoded string
      name: OW_ACTION_BINARY
    steps:
    - args:
      - -c
      - |
        cat <<EOF >> ${DOCKERFILE}
          ENV __OW_DEBUG "${OW_DEBUG}"
          ENV __OW_ACTION_NAME "${OW_ACTION_NAME}"
          ENV __OW_ACTION_CODE "${OW_ACTION_CODE}"
          ENV __OW_ACTION_MAIN "${OW_ACTION_MAIN}"
          ENV __OW_ACTION_BINARY "${OW_ACTION_BINARY}"
        EOF
      command:
      - /busybox/sh
      image: gcr.io/kaniko-project/executor:debug
      name: add-ow-env-to-dockerfile
    - args:
      - --destination=${TARGET_IMAGE_NAME}:${TARGET_IMAGE_TAG}
      - --dockerfile=${DOCKERFILE}
      image: gcr.io/kaniko-project/executor:latest
      name: build-openwhisk-nodejs-runtime
kind: List
metadata:
  resourceVersion: ""
  selfLink: ""
```
</details>

## Building a Knative service using the NodeJS BuildTemplate

We will use the simple "helloworld" test case to demonstrate how to use Knative to Build your function into container image and then deploy it as a Service.

The testcase resides within this repo. at:
- [tests/src/test/knative/helloworld/](../../tests/src/test/knative/helloworld/)
- [tests/src/test/knative/helloworldwithparams/](../../tests/src/test/knative/helloworldwithparams/)
- [tests/src/test/knative/webactionhelloworld/](../../tests/src/test/knative/webactionhelloworld/)
- [tests/src/test/knative/webactionraw/](../../tests/src/test/knative/webactionraw/)

For a complete listing of testcases, please view the [README](../../tests/src/test/knative/README.md) in the tests subdirectory.

### Build HelloWorld

#### Configure build.yaml

You will need to configure the build template to point to the Docker Hub repo. you wish the image to be "pushed" to once built.

To do this,
- Copy [build.yaml.tmpl](../../tests/src/test/knative/helloworld/build.yaml.tmpl) to `build.yaml`.
- Replace ```${DOCKER_USERNAME}``` with your own Docker username in `build.yaml`.

If you wish to run repeated tests you MAY set an environment variable and use ```sed``` to replace the ```${DOCKER_USERNAME}``` within any of the test's Kubernetes Build YAML files as follows:

```
export DOCKER_USERNAME="myusername"
sed 's/${DOCKER_USERNAME}/'"$DOCKER_USERNAME"'/' build.yaml.tmpl > build.yaml
```

<details>
    <summary>build.yaml.tmpl contents</summary>
```
apiVersion: build.knative.dev/v1alpha1
kind: Build
metadata:
  name: nodejs-10-helloworld
spec:
  serviceAccountName: openwhisk-runtime-builder
  source:
    git:
      url: "https://github.com/apache/incubator-openwhisk-runtime-nodejs.git"
      revision: "master"
  template:
    name: openwhisk-nodejs-runtime
    arguments:
      - name: TARGET_IMAGE_NAME
        value: "docker.io/${DOCKER_USERNAME}/nodejs-10-helloworld"
      - name: DOCKERFILE
        value: "./knative-build/runtimes/javascript/Dockerfile"
      - name: OW_DEBUG
        value: "true"
      - name: OW_ACTION_NAME
        value: "nodejs-helloworld"
      - name: OW_ACTION_CODE
        value: "function main() {return {payload: 'Hello World!'};}"
```
</details>

### Deploy the runtime

```bash
kubectl apply -f build.yaml
```

This creates a pod with a NodeJS runtime and all the action metadata (action code, main function name, etc) integrated into the container image. If for any reason there is a failure creating the pod, we can troubleshoot the deployment with:

#### `kubectl get pods`

```
kubectl get pods <build-pod-name> -o yaml
```

Which lists the containers and their status under `initContainerStatuses`:

- build-step-credential-initializer
- build-step-git-source-0
- build-step-add-ow-env-to-dockerfile
- build-step-build-openwhisk-nodejs-runtime

#### `kubectl logs`

Now, the logs of each of these build steps (containers) can be retrieved using:

```
kubectl logs <build-pod-name> -c <container-name>
```

For example:

```
kubectl logs nodejs-10-helloworld-pod-71d4d2 -c build-step-build-openwhisk-nodejs-runtime
INFO[0007] Downloading base image node:10.15.0-stretch
error building image: getting stage builder for stage 0: Get https://index.docker.io/v2/: net/http: TLS handshake timeout
```

#### `kubectl exec`

And, we can get to a shell in any of these containers with:

```
kubectl exec <build-pod-name> -- env
```


### Run HelloWorld

#### Configure service.yaml

Now that you have built the OpenWhisk NodeJS runtime image with the `helloworld` function "baked" into it, you can can deploy the image as a Knative Service.

You will need to configure the Service template to point to the Docker Hub repo. where your Knative OpenWhisk runtime (with the Hello World function) will be "pulled" from.

To do this,
- Copy [service.yaml.tmpl](../../tests/src/test/knative/helloworld/service.yaml.tmpl) to `service.yaml`.
- Replace ```${DOCKER_USERNAME}``` with your own Docker username in `service.yaml`.

As described for 'build.yaml.tmpl', you MAY set an environment variable and use ```sed``` to replace the ```${DOCKER_USERNAME}``` within any of the test's Kubernetes Build YAML files as follows:

```
export DOCKER_USERNAME="myusername"
sed 's/${DOCKER_USERNAME}/'"$DOCKER_USERNAME"'/' service.yaml.tmpl > service.yaml
```

<details>
    <summary>service.yaml.tmpl contents</summary>

```
apiVersion: serving.knative.dev/v1alpha1
kind: Service
metadata:
  name: nodejs-helloworld
  namespace: default
spec:
  runLatest:
    configuration:
      revisionTemplate:
        spec:
          container:
            image: docker.io/${DOCKER_USERNAME}/nodejs-10-helloworld
```
</details>

### Deploy the runtime

```bash
kubectl apply -f service.yaml
```

### Initialize and Run Hello World

```bash
curl -H "Host: nodejs-helloworld.default.example.com" -X POST http://${IP_ADDRESS}
```

### See Hello World Live in Action

![Screen Recording of Hello World](../media/demo-nodejs-helloworld.gif)

## Troubleshooting

### Knative and Istio Install

#### PROBLEM: Kubernetes default namespace does not have "istio-injection: enabled" key-value

If the `default` namespace does not have this value under the `metadata` section, you may have forgotten to issue the following command as part of the Knative setup:

```bash
$ kubectl label namespace default istio-injection=enabled
namespace "default" labeled
```

#### PROBLEM: Kubernetes and Istio resources do not all say "created" on "apply"

1. Verify that you have configured Docker Desktop to have the required CPU and Memory values recommended above.
2. Verify that all resources installed by applying either tha Knative or Istio YAML files show **"created"** during the installation.
- If any of your resources were NOT **created**, then we recommend uninstalling Knative and Istio and trying again until you get the **created** result for all resources WITHOUT trying to apply a second time. Below is an example of successful creation of Knative resources:

<p>
    <details>
    <summary>Sample output: Successful Knative resources creation</summary>

```
clusterrole "knative-build-admin" created
serviceaccount "build-controller" created
clusterrolebinding "build-controller-admin" created
customresourcedefinition "builds.build.knative.dev" created
customresourcedefinition "buildtemplates.build.knative.dev" created
customresourcedefinition "clusterbuildtemplates.build.knative.dev" created
customresourcedefinition "images.caching.internal.knative.dev" created
service "build-controller" created
service "build-webhook" created
image "creds-init" created
image "git-init" created
...
rolebinding "prometheus-system" created
rolebinding "prometheus-system" created
rolebinding "prometheus-system" created
rolebinding "prometheus-system" created
clusterrolebinding "prometheus-system" created
service "prometheus-system-np" created
statefulset "prometheus-system" created
```
</details>
</p>

#### PROBLEM: Knative build fails initializing at `Init:1/4`

Check the GitHub revision is set to right branch:

```
  source:
    git:
      url: <repo>
      revision: <branch>
```
