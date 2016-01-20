'use strict';

var expect = require('expect');
var lowercasePath = require('../index.js');

describe('koa-lowercase-path', function() {
    describe('defer = false', function() {
        it('should redirect on url and path has uppercase characters', function() {
            var mock = createMock('/fOo');
            var lowercasePathMock = lowercasePath({defer: false}).bind(mock.this);
            var lowercasePathMockGenerator = lowercasePathMock();
            lowercasePathMockGenerator.next();
            expect(mock.redirectMock.calls[0].arguments[0]).toEqual('/foo');
            expect(mock.this.status).toBe(301);
        });
    });

    describe('chained = false', function() {
        it('should not redirect on url that already have been modified', function() {
            var mock = createMock('/fOo/');

            // Mock that something has made a redirect before us
            mock.this.status = 301;
            mock.this.body = 'Redirecting to …';
            mock.this.response = {
                get: function() {
                    return '/fOo';
                }
            };

            var lowercasePathMock = lowercasePath({chained: false}).bind(mock.this);
            var lowercasePathMockGenerator = lowercasePathMock();
            lowercasePathMockGenerator.next();
            lowercasePathMockGenerator.next();
            expect(mock.redirectMock).toNotHaveBeenCalled();
            expect(mock.this.status).toBe(301);
        });
    });

    describe('chained = true & defer = true', function() {
        describe('redirect', function() {
            it('should redirect on url that already have been modified and path has upercase characters', function() {
                var mock = createMock('/fOo/');

                // Mock that something has made a redirect before us
                mock.this.status = 301;
                mock.this.body = 'Redirecting to …';
                mock.this.response = {
                    get: function() {
                        return '/fOo';
                    }
                };

                var lowercasePathMock = lowercasePath().bind(mock.this);
                var lowercasePathMockGenerator = lowercasePathMock();
                lowercasePathMockGenerator.next();
                lowercasePathMockGenerator.next();
                expect(mock.redirectMock.calls[0].arguments[0]).toEqual('/foo');
                expect(mock.this.status).toBe(301);
            });

            it('should redirect on simple path and path has uppercase characters', function() {
                var mock = createMock('/fOo');
                var lowercasePathMock = lowercasePath().bind(mock.this);
                var lowercasePathMockGenerator = lowercasePathMock();
                lowercasePathMockGenerator.next();
                lowercasePathMockGenerator.next();
                expect(mock.redirectMock.calls[0].arguments[0]).toEqual('/foo');
                expect(mock.this.status).toBe(301);
            });

            it('should redirect on simple path and path has uppercase characters and query', function() {
                var mock = createMock('/fOo?hello=wOrld', 'hello=wOrld');
                var lowercasePathMock = lowercasePath().bind(mock.this);
                var lowercasePathMockGenerator = lowercasePathMock();
                lowercasePathMockGenerator.next();
                lowercasePathMockGenerator.next();
                expect(mock.redirectMock.calls[0].arguments[0]).toEqual('/foo?hello=wOrld');
                expect(mock.this.status).toBe(301);
            });

            it('should redirect on UTF-8 path and path has uppercase characters', function() {
                var mock = createMock('/fØö/БАЯ');
                var lowercasePathMock = lowercasePath().bind(mock.this);
                var lowercasePathMockGenerator = lowercasePathMock();
                lowercasePathMockGenerator.next();
                lowercasePathMockGenerator.next();
                expect(mock.redirectMock.calls[0].arguments[0]).toEqual('/føö/бая');
                expect(mock.this.status).toBe(301);
            });
        });

        describe('not redirect', function() {
            it('should not redirect on simple path that is all lowercase', function() {
                var mock = createMock('/foo');
                var lowercasePathMock = lowercasePath().bind(mock.this);
                var lowercasePathMockGenerator = lowercasePathMock();
                lowercasePathMockGenerator.next();
                lowercasePathMockGenerator.next();
                expect(mock.redirectMock).toNotHaveBeenCalled();
                expect(mock.this.status).toBe(undefined);
            });

            it('should not redirect on simple path that is all lowercase and have query', function() {
                var mock = createMock('/foo?hello=wOrld', 'hello=wOrld');
                var lowercasePathMock = lowercasePath().bind(mock.this);
                var lowercasePathMockGenerator = lowercasePathMock();
                lowercasePathMockGenerator.next();
                lowercasePathMockGenerator.next();
                expect(mock.redirectMock).toNotHaveBeenCalled();
                expect(mock.this.status).toBe(undefined);
            });

            it('should not redirect on when body is defined', function() {
                var mock = createMock('/fOo?hello=wOrld', 'hello=wOrld');
                var lowercasePathMock = lowercasePath().bind(mock.this);
                var lowercasePathMockGenerator = lowercasePathMock();
                lowercasePathMockGenerator.next();
                mock.this.body = 'some content';
                mock.this.status = 200;
                lowercasePathMockGenerator.next();
                expect(mock.redirectMock).toNotHaveBeenCalled();
                expect(mock.this.status).toBe(200);
            });
        });
    });
});

function createMock(originalUrl, querystring) {
    querystring = querystring || '';
    var redirectMock = expect.createSpy();
    return {
        redirectMock: redirectMock,
        this: {
            originalUrl: originalUrl,
            querystring: querystring,
            status: undefined,
            redirect: redirectMock
        }
    };
}
