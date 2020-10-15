((global, factory) => {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.testFunctionPerformance = factory());
})(globalThis || global || window || self || this, function () {
  'use strict';

  const now = (typeof performance !== 'undefined' && performance.now.bind(performance)) || (() => Number(process.hrtime.bigint()) / 1000000);

  function testFunction(count, func, context, ...args) {
    let returnedValue;

    const t0 = now();

    for (let i = 0; i < count; i++) {
      returnedValue = func.call(context, ...args);
    }

    const t1 = now() - t0;

    return { time: t1, name: func.name, args, returnedValue, func };
  }

  function shuffle(array) {
    array = array.slice();
    for (let i = array.length - 1; i > 0; --i) {
      let j = Math.floor(Math.random() * (i + 1));
      [ array[i], array[j] ] = [ array[j], array[i] ];
    }
    return array;
  }

  function TestResult(executionResults) {
    this.executionResults = executionResults;
    this.result = [];

    for (const { name, times } of Object.values(executionResults)) {
      const sorted = times.slice().sort((left, right) => Number(left - right));

      this.result.push({
        name,
        median: sorted[Math.floor(sorted.length / 2)],
        average: sorted.reduce((acc, curr) => acc + Number(curr), 0) / sorted.length,
        min: sorted[0],
        max: sorted[sorted.length - 1]
      });

      this.result = this.sortByField('median');
    }
  }

  TestResult.prototype.sortByField = function sortByField(fieldName) {
    return this.result.slice().sort((left, right) => left[fieldName] - right[fieldName]);
  }

  function testFunctions(allFuncRunCount, oneFuncRunCount, funcs, context, ...args) {
    const function__name = new Map(funcs.map((func, index) => [func, func.name || index + 1]));
    const executionResults = Object.create(null);

    for (let i = 0; i < allFuncRunCount; i++) {
      const shuffledFuncs = shuffle(funcs);
      for (let j = 0; j < shuffledFuncs.length; j++) {
        const result = testFunction(oneFuncRunCount, shuffledFuncs[j], context, ...args);
        const funcName = function__name.get(result.func);

        executionResults[funcName] = executionResults[funcName] || {
          times: [],
          name: funcName,
          args: result.args,
          returnedValue: result.returnedValue,
          func: result.func
        };

        executionResults[funcName].times.push(result.time);
      }
    }

    return new TestResult(executionResults);
  }

  return testFunctions;

});
