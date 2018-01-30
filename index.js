'use strict';

module.exports = lowercasePath;

function lowercasePath(opts) {
    opts = opts || {};

    if (opts.defer !== false) {
        opts.defer = opts.defer || true;
    }

    if (opts.chained !== false) {
        opts.chained = opts.chained || true;
    }

    return async function(ctx, next) {
        if (opts.defer) {
            await next();
        }

        let path;

        // We have already done a redirect and we will continue if we are in chained mode
        if (opts.chained && ctx.status === 301) {
            path = getPath(ctx.response.get('Location'), ctx.querystring);
        } else if (ctx.status !== 301) {
            path = getPath(ctx.originalUrl, ctx.querystring);
        }

        if (path && (!ctx.body || ctx.status !== 200)) {
            const lowercasedPath = path.toLowerCase();
            if (path !== lowercasedPath) {
                const query = ctx.querystring.length ? '?' + ctx.querystring : '';

                ctx.status = 301;
                ctx.redirect(path.toLowerCase() + query);
            }
        }

        if (!opts.defer) {
            await next();
        }
    };
}

function getPath(original, querystring) {
    if (querystring.length) {
        return original.slice(0, -querystring.length - 1);
    }

    return original;
}
