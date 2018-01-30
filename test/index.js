'use strict';

const expect = require('expect');
const lowercasePath = require('../');

describe('koa-lowercase-path', () => {
    describe('defer = false', () => {
        it('should redirect on url and path has uppercase characters', async () => {
            const mock = createMock('/fOo');
            await lowercasePath({defer: false})(mock.ctx, mock.next);

            expect(mock.redirectMock.calls[0].arguments[0]).toEqual('/foo');
            expect(mock.ctx.status).toBe(301);
        });
    });

    describe('chained = false', () => {
        it('should not redirect on url that already have been modified', async () => {
            const mock = createMock('/fOo/');

            // Mock that something has made a redirect before us
            mock.ctx.status = 301;
            mock.ctx.body = 'Redirecting to …';
            mock.ctx.response = {
                get: function() {
                    return '/fOo';
                }
            };

            await lowercasePath({chained: false})(mock.ctx, mock.next);

            expect(mock.redirectMock).toNotHaveBeenCalled();
            expect(mock.ctx.status).toBe(301);
        });
    });

    describe('chained = true & defer = true', () => {
        describe('redirect', () => {
            it('should redirect on url that already have been modified and path has upercase characters', async () => {
                const mock = createMock('/fOo/');

                // Mock that something has made a redirect before us
                mock.ctx.status = 301;
                mock.ctx.body = 'Redirecting to …';
                mock.ctx.response = {
                    get: function() {
                        return '/fOo';
                    }
                };

                await lowercasePath()(mock.ctx, mock.next);

                expect(mock.redirectMock.calls[0].arguments[0]).toEqual('/foo');
                expect(mock.ctx.status).toBe(301);
            });

            it('should redirect on simple path and path has uppercase characters', async () => {
                const mock = createMock('/fOo');
                await lowercasePath()(mock.ctx, mock.next);

                expect(mock.redirectMock.calls[0].arguments[0]).toEqual('/foo');
                expect(mock.ctx.status).toBe(301);
            });

            it('should redirect on simple path and path has uppercase characters and query', async () => {
                const mock = createMock('/fOo?hello=wOrld', 'hello=wOrld');
                await lowercasePath()(mock.ctx, mock.next);

                expect(mock.redirectMock.calls[0].arguments[0]).toEqual('/foo?hello=wOrld');
                expect(mock.ctx.status).toBe(301);
            });

            it('should redirect on UTF-8 path and path has uppercase characters', async () => {
                const mock = createMock('/fØö/БАЯ');
                await lowercasePath()(mock.ctx, mock.next);

                expect(mock.redirectMock.calls[0].arguments[0]).toEqual('/føö/бая');
                expect(mock.ctx.status).toBe(301);
            });
        });

        describe('not redirect', () => {
            it('should not redirect on simple path that is all lowercase', async () => {
                const mock = createMock('/foo');
                await lowercasePath()(mock.ctx, mock.next);

                expect(mock.redirectMock).toNotHaveBeenCalled();
                expect(mock.ctx.status).toBe(undefined);
            });

            it('should not redirect on simple path that is all lowercase and have query', async () => {
                const mock = createMock('/foo?hello=wOrld', 'hello=wOrld');
                await lowercasePath()(mock.ctx, mock.next);

                expect(mock.redirectMock).toNotHaveBeenCalled();
                expect(mock.ctx.status).toBe(undefined);
            });

            it('should not redirect on when body is defined', async () => {
                const mock = createMock('/fOo?hello=wOrld', 'hello=wOrld');
                mock.ctx.body = 'some content';
                mock.ctx.status = 200;

                await lowercasePath()(mock.ctx, mock.next);

                expect(mock.redirectMock).toNotHaveBeenCalled();
                expect(mock.ctx.status).toBe(200);
            });
        });
    });
});

function createMock(originalUrl, querystring) {
    querystring = querystring || '';
    const redirectMock = expect.createSpy();
    return {
        redirectMock: redirectMock,
        ctx: {
            originalUrl: originalUrl,
            querystring: querystring,
            status: undefined,
            redirect: redirectMock
        },
        next: async () => {}
    };
}
