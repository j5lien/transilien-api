'use strict';

const assert = require('assert');
const nock = require('nock');
const TransilienApi = require('../lib/transilien-api');
const VERSION = require('../package.json').version;

describe('TransilienApi', function() {

  describe('Constructor', function() {
    let defaults = {};
    before(function() {
      defaults = {
        base_url: 'http://api.transilien.com',
        basic_authorization: null,
        request_options: {
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/vnd.sncf.transilien.od.depart+xml;vers=1',
            'User-Agent': 'transilien-api/' + VERSION
          }
        }
      };
    });

    it('create new instance', function() {
      const client = new TransilienApi();
      assert(client instanceof TransilienApi);
    });

    it('auto constructs', function() {
      // eslint-disable-next-line new-cap
      const client = TransilienApi();
      assert(client instanceof TransilienApi);
    });

    it('has default options', function() {
      const client = new TransilienApi();
      assert.deepEqual(
        Object.keys(defaults),
        Object.keys(client.options)
      );
    });

    it('accepts and overrides options', function() {
      const options = {
        base_url: 'http://127.0.0.1:8080',
        power: 'Max',
        request_options: {
          headers: {
            'User-Agent': 'test'
          }
        }
      };

      const client = new TransilienApi(options);

      assert(client.options.hasOwnProperty('power'));
      assert.equal(client.options.power, options.power);

      assert.equal(client.options.base_url, options.base_url);

      assert.equal(
        client.options.request_options.headers['User-Agent'],
        options.request_options.headers['User-Agent']
      );
    });

    it('has pre-configured request object', function(next) {
      const client = new TransilienApi({
        basic_authorization: '12345',
        request_options: {
          headers: {
            foo: 'bar'
          }
        }
      });

      assert(client.hasOwnProperty('request'));

      nock('http://api.transilien.com').get('/').reply(200);
      client.request.get('http://api.transilien.com/', function(error, response) {

        const headers = response.request.headers;

        assert(headers.hasOwnProperty('foo'));
        assert(headers.foo, 'bar');

        assert.equal(headers['User-Agent'], 'transilien-api/' + VERSION);
        assert(headers.hasOwnProperty('Authorization'));
        assert.equal(headers.Authorization, 'Basic 12345');

        next();
      });
    });
  });

  describe('Methods', function() {
    describe('__buildEndpoint()', function() {
      let client;

      before(function() {
        client = new TransilienApi();
      });

      it('method exists', function() {
        assert.equal(typeof client.__buildEndpoint, 'function');
      });

      it('build url', function() {
        const path = 'gare/87758011/depart';

        assert.throws(
          client.__buildEndpoint,
          Error
        );

        assert.equal(
          client.__buildEndpoint(path),
          `${client.options.base_url}/${path}`
        );

        assert.equal(
          client.__buildEndpoint('/' + path),
          `${client.options.base_url}/${path}`
        );

        assert.equal(
          client.__buildEndpoint(path + '/'),
          `${client.options.base_url}/${path}/`
        );

        assert.equal(
          client.__buildEndpoint(path),
          'http://api.transilien.com/gare/87758011/depart'
        );
      });
    });

    describe('__request()', function(){
      before(function(){
        this.nock = nock('http://api.transilien.com');
        this.client = new TransilienApi();
      });

      it('accepts any 2xx response', function(done) {
        var xmlResponse = '<?xml version="1.0" encoding="UTF-8"?><passages gare="87758011"></passages>';
        this.nock.get(/.*/).reply(201, xmlResponse);
        this.client.__request('get', '/gare/87758011/depart')
          .then(data => {
            assert.deepEqual(data, { passages: { '$': { gare: '87758011' } } });
            done();
          });
      });

      it('errors on bad xml', function(done) {
        this.nock.get(/.*/).reply(200, 'fail whale');
        this.client.__request('get', '/gare/87758011/depart')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });

      it('allows an empty response', function(done){
        this.nock.get(/.*/).reply(201, '');
        this.client.__request('get', '/gare/87758011/depart')
          .then(data => {
            assert.deepEqual(data, {});
            done();
          });
      });

      it('errors when there is a bad http status code', function(done) {
        this.nock.get(/.*/).reply(500, '{}');
        this.client.__request('get', '/gare/87758011/depart')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });

      it('errors on a request or network error', function(done) {
        this.nock.get(/.*/).replyWithError('something bad happened');
        this.client.__request('get', '/gare/87758011/depart')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });
    });

    describe('get()', function() {
    });
  });
});
