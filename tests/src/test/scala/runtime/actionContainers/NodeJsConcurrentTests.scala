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

package runtime.actionContainers

import actionContainers.ActionContainer
import spray.json.JsObject
import spray.json.JsString

abstract class NodeJsConcurrentTests extends NodeJsActionContainerTests {

  override def withNodeJsContainer(code: ActionContainer => Unit) =
    withActionContainer(Map("__OW_ALLOW_CONCURRENT" -> "true"))(code)

  if (!isTypeScript) {
    it should "allow running activations concurrently" in {

      val requestCount = actorSystem.settings.config.getInt("akka.http.host-connection-pool.max-connections")
      require(requestCount > 100, "test requires that max-connections be set > 100")
      println(s"running $requestCount requests")

      val (out, err) = withNodeJsContainer { c =>
        //this action will create a log entry, and only complete once all activations have arrived and emitted logg
        //this forces all of the in-action logs to appear in a single portion of the stdout, and all of the sentinels to appear following that

        val code =
          s"""
           |
           | global.count = 0;
           | let requestCount = $requestCount;
           | let interval = 1000;
           | function main(args) {
           |     global.count++;
           |     console.log("interleave me");
           |     return new Promise(function(resolve, reject) {
           |         setTimeout(function() {
           |             checkRequests(args, resolve, reject);
           |         }, interval);
           |    });
           | }
           | function checkRequests(args, resolve, reject, elapsed) {
           |     let elapsedTime = elapsed||0;
           |     if (global.count == requestCount) {
           |         resolve({ args: args});
           |     } else {
           |         if (elapsedTime > 30000) {
           |             reject("did not receive "+requestCount+" activations within 30s");
           |         } else {
           |             setTimeout(function() {
           |                 checkRequests(args, resolve, reject, elapsedTime+interval);
           |             }, interval);
           |         }
           |     }
           | }
        """.stripMargin

        c.init(initPayload(code))._1 should be(200)

        val payloads = (1 to requestCount).map({ i =>
          JsObject(s"arg$i" -> JsString(s"value$i"))
        })

        val responses = c.runMultiple(payloads.map {
          runPayload(_)
        })
        payloads.foreach { a =>
          responses should contain(200, Some(JsObject("args" -> a)))
        }
      }

      checkStreams(out, err, {
        case (o, e) =>
          o.replaceAll("\n", "") shouldBe "interleave me" * requestCount
          e shouldBe empty
      }, requestCount)

      withClue("expected grouping of stdout sentinels") {
        out should include((ActionContainer.sentinel + "\n") * requestCount)
      }
    }
  }
}
