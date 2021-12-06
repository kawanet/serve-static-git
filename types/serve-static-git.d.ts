/**
 * https://github.com/kawanet/serve-static-git
 */

import type * as http from "http";

export const serveStaticGit: (options: SSG.Options) => SSG.RequestHandler;

export declare namespace SSG {
    interface Options {
        /**
         * path to git repository to mount
         * "path/to/bare/repository.git"
         * "path/to/working/repository/.git"
         */
        repo: string;

        /**
         * document root path within the repository
         */
        root?: string;

        /**
         * function to determine branch, tag or commit id
         *
         * @default `req => req.headers.host.split(/[.:]/).shift()`
         */
        refs?: <R extends http.IncomingMessage>(req: R) => string;

        /**
         * - `allow` to serving dot files.
         * - `deny` to return 403 error.
         * - `ignore` to ignore and call `next()`.
         *
         * @default `ignore`
         */
        dotfiles?: "allow" | "deny" | "ignore";

        /**
         * - `true` to respond `ETag: W/` header with SHA-1 object ID
         * - `false` not to add `ETag:` header
         *
         * @default `true`
         */
        etag?: boolean;

        /**
         * index file name(s) for directory URL with trailing `/`
         *
         * @default `index.html`
         */
        index?: string | string[];

        /**
         * - `true` to respond `X-Commit:` header with SHA-1 commit ID
         * - `false` not to add `X-Commit:` header
         *
         * @default `true`
         */
        commit?: boolean;
    }

    interface RequestHandler<R extends http.ServerResponse> {
        (request: http.IncomingMessage, response: R, next: () => void): any;
    }
}
