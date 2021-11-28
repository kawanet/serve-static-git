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
         * - `allow` to serving dot files.
         * - `deny` to return 403 error.
         * - `ignore` to ignore and call `next()`.
         */
        dotfiles?: "allow" | "deny" | "ignore";

        /**
         * - `true` to set `ETag: W/` header with SHA-1 object ID
         */
        etag?: boolean;
    }

    interface RequestHandler<R extends http.ServerResponse> {
        (request: http.IncomingMessage, response: R, next: () => void): any;
    }
}
