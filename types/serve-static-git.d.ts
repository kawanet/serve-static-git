/**
 * https://github.com/kawanet/serve-static-git
 */

import type * as http from "http";

export const serveStaticGit: (options: SSG.Options) => SSG.RequestHandler;

export declare namespace SSG {
    interface Options {
        /**
         * Path to the git repository to mount.
         *
         * @example "path/to/bare/repository.git"
         * @example "path/to/working/repository/.git"
         */
        repo: string;

        /**
         * Document root within the repository.
         */
        root?: string;

        /**
         * Resolves the branch, tag, or commit id from the incoming request.
         *
         * @default `req => req.headers.host.split(/[.:]/).shift()`
         */
        refs?: <R extends http.IncomingMessage>(req: R) => string;

        /**
         * How to handle requests for dot-files (paths whose final segment
         * starts with `.`):
         *
         * - `allow`: serve the file as usual.
         * - `deny`: respond with 403.
         * - `ignore`: skip handling and call `next()`.
         *
         * @default `ignore`
         */
        dotfiles?: "allow" | "deny" | "ignore";

        /**
         * Whether to send an `ETag` header derived from the SHA-1 object id.
         *
         * - `true`: respond with a weak `ETag: W/...` header.
         * - `false`: omit the `ETag` header.
         *
         * @default `true`
         */
        etag?: boolean;

        /**
         * File name(s) to serve for a directory URL ending in `/`.
         *
         * @default `index.html`
         */
        index?: string | string[];

        /**
         * Whether (and under which name) to send a header carrying the
         * SHA-1 commit id.
         *
         * - `true`: send `X-Commit: <sha>`.
         * - `false`: omit the header.
         * - any string: use that string as the header name.
         *
         * @default `X-Commit`
         */
        commit?: string | boolean;

        /**
         * Whether (and under which name) to send a header carrying the
         * commit date.
         *
         * - `true`: send `Last-Modified: <date>`.
         * - `false`: omit the header.
         * - any string: use that string as the header name.
         *
         * @default `Last-Modified`
         */
        lastModified?: string | boolean;
    }

    interface RequestHandler<R extends http.ServerResponse> {
        (request: http.IncomingMessage, response: R, next: () => void): any;
    }
}
