---
title: Test Page
---

```kotlin
fun main() {
  var a = 1
  // simple name in template:
  val s1 = "a is $a" 

  a = 2
  // arbitrary expression in template:
  val s2 = "${s1.replace("is", "was")}, but now is $a"
  println(s2)
}
```