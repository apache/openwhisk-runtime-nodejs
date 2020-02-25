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

import actionContainers.ActionContainer.withContainer
import actionContainers.{ActionContainer, BasicActionRunnerTests}
import common.WskActorSystem
import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner

@RunWith(classOf[JUnitRunner])
class Typescript37BasicTests extends BasicActionRunnerTests with WskActorSystem {

  val image = "action-typescript-v3.7"

  override def withActionContainer(env: Map[String, String] = Map.empty)(code: ActionContainer => Unit) = {
    withContainer(image, env)(code)
  }

  def withActionLoopContainer(code: ActionContainer => Unit) =
    withContainer(image)(code)

  behavior of image

  override val testNoSourceOrExec = TestConfig("")

  override val testNotReturningJson =
    TestConfig("""
                 |export function main(args) {
                 |    return "not a json object"
                 |}
               """.stripMargin)

  override val testEcho = TestConfig("""|export function main(args) {
       |   console.log("hello stdout")
       |   console.error("hello stderr")
       |   return args
       |}
    """.stripMargin)

  override val testUnicode = TestConfig("""|export function main(args) {
       |  let delimiter = args['delimiter']
       |  let msg = delimiter+" ☃ "+delimiter
       |  console.log(msg)
       |  return { "winter": msg }
       |}
    """.stripMargin)

  override val testEnv = TestConfig("""|export function main(args) {
       |  let env = process.env
       |  return {
       |    "api_host":      env["__OW_API_HOST"],
       |    "api_key":       env["__OW_API_KEY"],
       |    "namespace":     env["__OW_NAMESPACE"],
       |    "activation_id": env["__OW_ACTIVATION_ID"],
       |    "action_name":   env["__OW_ACTION_NAME"],
       |    "deadline":      env["__OW_DEADLINE"],
       |    "action_version": env["__OW_ACTION_VERSION"]
       |  }
       |}
    """.stripMargin)

  override val testInitCannotBeCalledMoreThanOnce = TestConfig(s"""|export function main(args) {
        |  return args
        |}
    """.stripMargin)

  override val testEntryPointOtherThanMain = TestConfig(
    s"""|export function niam(args) {
        |   return args
        |}
    """.stripMargin,
    main = "niam")

  override val testLargeInput = TestConfig(s"""|export function main(args) {
        |  return args
        |}
    """.stripMargin)
}
