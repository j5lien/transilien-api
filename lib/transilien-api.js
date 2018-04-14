'use strict';

/**
 * Module dependencies
 */

const request = require('request');
const extend = require('deep-extend');
const { parseString } = require('xml2js');

// Package version
const VERSION = require('../package.json').version;

function TransilienApi(options) {
  if (!(this instanceof TransilienApi)) {
    return new TransilienApi(options);
  }

  this.VERSION = VERSION;

  // Merge the default options with the client submitted options
  this.options = extend({
    base_url: 'http://api.transilien.com',
    basic_authorization: null,
    request_options: {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/vnd.sncf.transilien.od.depart+xml;vers=1',
        'User-Agent': 'transilien-api/' + VERSION
      }
    }
  }, options);

  const authentication_options = {};
  if (this.options.basic_authorization) {
    authentication_options.headers = {
      Authorization: `Basic ${this.options.basic_authorization}`
    };
  }

  // Configure default request options
  this.request = request.defaults(
    extend(
      this.options.request_options,
      authentication_options
    )
  );
}

TransilienApi.prototype.__buildEndpoint = function(path) {
  return this.options.base_url + ('/' === path.charAt(0) ? path : '/' + path);
};

TransilienApi.prototype.__request = function(method, path, params) {

  // Build the options to pass to our custom request object
  const options = {
    method: method.toLowerCase(),  // Request method - get || post
    url: this.__buildEndpoint(path) // Generate url
  };

  // Pass url parameters if get
  if ('get' === method) {
    options.qs = params;
  } else {
    options.body = JSON.stringify(params);
  }

  const _this = this;
  return new Promise(function(resolve, reject) {
    _this.request(options, function(error, response, data) {
      // request error
      if (error) {
        return reject(error);
      }

      // status code errors
      if(response.statusCode < 200 || response.statusCode > 299) {
        return reject(new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage));
      }

      if ('' === data) {
        return resolve({});
      }

      parseString(data, function(error, data) {
        if (error) {
          return reject(new Error('XML parseError with HTTP Status: ' + response.statusCode + ' ' + response.statusMessage));
        }

        // no errors
        resolve(data);
      });
    });
  });
};

/**
 * GET
 */
TransilienApi.prototype.get = function(url, params) {
  return this.__request('get', url, params);
};

/**
 * Next departures from a train station
 *
 * @param {integer} trainStation - train station.
 */
TransilienApi.prototype.nextDepartures = function(trainStation) {
  return this.get(`/gare/${trainStation}/depart/`);
};

/**
 * Next departures from a train station
 *
 * @param {integer} departureTrainStation - train station.
 * @param {integer} destinationTrainStation - train station.
 */
TransilienApi.prototype.nextDeparturesToDestination = function(departureTrainStation, destinationTrainStation) {
  return this.get(`/gare/${departureTrainStation}/depart/${destinationTrainStation}/`);
};

module.exports = TransilienApi;
