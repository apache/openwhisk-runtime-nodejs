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

abstract class NodeJsNonConcurrentTests extends NodeJsActionContainerTests {

  override def withNodeJsContainer(code: ActionContainer => Unit) =
    withActionContainer()(code)

  it should "NOT allow running activations concurrently (without proper env setup)" in {
    if (!isTypeScript) {
      val (out, err) = withNodeJsContainer { c =>
        //this action will create a log entry, and only complete after 1s, to guarantee previous is still running
        val code = """
                   | function main(args) {
                   |     console.log("no concurrency");
                   |     return new Promise(function(resolve, reject) {
                   |         setTimeout(function() {
                   |             resolve({ args: args});
                   |         }, 1000);
                   |     });
                   | }
                 """.stripMargin

        c.init(initPayload(code))._1 should be(200)
        val requestCount = 2

        val payloads = (1 to requestCount).map({ i =>
          JsObject(s"arg$i" -> JsString(s"value$i"))
        })

        //run payloads concurrently
        val responses = c.runMultiple(payloads.map {
          runPayload(_)
        })

        //one will fail, one will succeed - currently there is no way to guarantee which one succeeds, since both arrive "at the same time"
        responses.count {
          case (200, Some(JsObject(a))) if a.get("args").isDefined => true
          case _                                                   => false
        } shouldBe 1

        responses.count {
          case (403, Some(JsObject(e)))
              if e.getOrElse("error", JsString("")) == JsString("System not ready, status is running.") =>
            true
          case _ => false
        } shouldBe 1

      }

      checkStreams(out, err, {
        case (o, e) =>
          o.replaceAll("\n", "") shouldBe "no concurrency"
          e shouldBe "Internal system error: System not ready, status is running."
      }, 1)
    }
  }

}
