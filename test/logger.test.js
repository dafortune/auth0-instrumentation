'use strict';

const assert = require('assert');
const sentry = require('../lib/error_reporter')({}, {});
const logger = require('../lib/logger')({ name: 'test' },
                                        { LOG_LEVEL: 'fatal',
                                          PURPOSE: 'test-purpose',
                                          ENVIRONMENT: 'test-env',
                                          AWS_REGION: 'test-region'
                                        });
const spy = require('sinon').spy;

describe('logger', function() {

});
