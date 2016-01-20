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

    return function* (next) {
        if (opts.defer) {
            yield next;
        }

        var path;

        // We have already done a redirect and we will continue if we are in chained mode
        if (opts.chained && this.status === 301) {
            path = getPath(this.response.get('Location'), this.querystring);
        } else if (this.status !== 301) {
            path = getPath(this.originalUrl, this.querystring);
        }

        if (path && (!this.body || this.status !== 200)) {
            var lowercasedPath = path.toLowerCase();
            if (path !== lowercasedPath) {
                var query = this.querystring.length ? '?' + this.querystring : '';

                this.status = 301;
                this.redirect(path.toLowerCase() + query);
            }
        }

        if (!opts.defer) {
            yield next;
        }
    };
}

function getPath(original, querystring) {
    if (querystring.length) {
        return original.slice(0, -querystring.length - 1);
    }

    return original;
}
