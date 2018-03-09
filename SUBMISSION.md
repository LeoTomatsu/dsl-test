# leo-dsl-test

### Author
Leo Tomatsu
leotomatsu@gmail.com

### General notes

Code validated against the tests included in this repository.

The code deals with:
+ The execution of rules of the DSL
+ Handle failure cases gracefully to console.error
+ Produce an optimized execution plan
+ Correctly resolve identifiers through scopes

Outcomes
+ 2 passed tests
+ Average run time 0.16ms

### Test cases
Install the project dependencies
```
npm install
```

Lint the code and run the tests on the commandline
```
npm test \\ Errors handling in console.log
```

To run the tests in the browser
```
npm run test-web
open localhost:8080/test.bundle
```

### Overview
Utilized function dslRuleHandler to determine, execute, and error handle each dsl rule recursively. Created functions that handle each dsl rule to organize code and throw errors.

### Functions
```
dslRuleHandler(node, parentNode, bindings):
```
+ determine shape using switch statements and execute rule
+ return node's dsl rule
+ error handle
+ contains all dsl rule functions

```
literalRuleHandler(n):
```
+ execute and return literal rule
+ check if node.value is type number
+ return error if type is not number

```
identifierRuleHandler(n, b):
```
+ execute and return identifier rule

```
assignmentRuleHandler(n, pN, b):
```
+ execute and return assignment rule
+ return only if it occurs as a direct child of block, otherwise throw error
+ assign value with dsl rule

```
functionRuleHandler(n, b):
```
+ execute and return function rule
+ make call to executeCalleeAndArgs to have callee and args variables
+ check if operation is type function, otherwise throw error
+ check if operation is valid, otherwise throw error
+ return outcome of operation if everything is valid

```
executeCalleeAndArgs(N, B):
```
+ execute and return callee and args
+ helper function for functionalRuleHandler
+ determine callee
+ assign dsl rule to args

```
blockRuleHandler(pN, pB):
```
+ execute and return block rule
+ create child bindings
+ assign child binding with child dsl rule
+ return the last line of the result block

```
arrayRuleHandler(pN, b):
```
+ execute and return array rule
+ assign dsl rule to return array
+ if valid, push value into return array

```
run():
```
+ execute and return interestIds given the passed ast
