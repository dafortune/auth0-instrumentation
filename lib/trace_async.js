module.exports = ({ tracer }) => {
  const SPAN_SYMBOL = Symbol();

  function wrapAsyncFunction(name, options, fn) {
    if (typeof options === 'function') {
      fn = options;
      options = {};
    }

    return function wrappedCallbackBased() {
      return optimizedWrapCallbackBasedFunction(name, options, fn, this, Array.from(arguments));
    };
  }

  // This is a little optimization to restrict arguments to the minimal
  // necesary function to restrict the scope of the de-optimized function
  function optimizedWrapCallbackBasedFunction(name, options, fn, context, args) {
    const cb = args.pop();

    if (typeof cb !== 'function') {
      throw new Error(`Trace error: expected callback for wrapCallbackBased function ${name} to be a callback`);
    }

    const spanOptions = { childOf: options.childOf };
    const span = tracer.startSpan(name, spanOptions);

    if (options.exposeSpan) {
      args.unshift(span); // If exposeSpan = true insert span as the first argument
    }

    args.push(wrapCallback(span, cb));

    fn.apply(context, args);
  }

  function wrapCallback(span, cb) {
    const wrappedCallback = function wrappedCallback(err) {
      if (err) {
        span.setTag(tracer.Tags.ERROR, true);
        span.setTag(tracer.Tags.SAMPLING_PRIORITY, 1);
      }

      span.finish();
      cb.apply(this, arguments);
    };

    wrappedCallback[SPAN_SYMBOL] = span;

    return wrappedCallback;
  }

  function spanFromCallback(name, wrappedCallback) {
    const parent = wrappedCallback[SPAN_SYMBOL];

    return tracer.startSpan(name, { childOf: parent });
  }

  return {
    wrapAsyncFunction,
    wrapCallback,
    spanFromCallback
  };
};
