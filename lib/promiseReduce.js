function promiseReduce(tasks, context) {
  return tasks.reduce((promise, task) => {
    return promise.then((ctx) => task(ctx));
  }, Promise.resolve(context));
}

module.exports = promiseReduce;
