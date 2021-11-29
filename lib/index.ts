/**
 * https://github.com/kawanet/serve-static-git
 */

import {openLocalRepo, GCF} from "git-cat-file"
import type * as http from "http"
import * as mime from "mime"

import type {SSG} from ".."

export function serveStaticGit(options: SSG.Options): SSG.RequestHandler<http.ServerResponse> {
    if (!/\.git$/.test(options.repo)) {
        throw new TypeError(`Invalid repository path: ${options.repo}`)
    }

    const repo = openLocalRepo(options.repo)

    let root = options.root
    if (root) root = root.replace(/\/?$/, "/")

    const etag = (options.etag !== false)
    const dotfiles = options.dotfiles || "ignore"

    return async (req, res, next) => {
        const host = String(req.headers.host)
        let commit: GCF.Commit;

        if (options.refs) {
            const rev = options.refs(req)
            if (rev) commit = await repo.getCommit(rev)
        } else {
            const isIP = /^\d+\.\d+\.\d+\.\d+(:|$)/.test(host)
            const rev = !isIP && host.split(/[.:]/).shift()!
            if (rev) commit = await repo.getCommit(rev)
            if (!commit!) commit = await repo.getCommit("HEAD")
        }

        if (!commit!) return next()

        const url = new URL(String(req.url), `http://${host}`)
        let path = url.pathname.replace(/^\/+/, "").replace(/\?.*$/, "")

        const hasDot = path.split("/").filter(v => /^\./.test(v)).length
        if (hasDot) {
            if (dotfiles === "deny") {
                res.statusCode = 403
                res.end()
                return
            } else if (dotfiles === "ignore") {
                next()
                return
            }
        }

        if (root) path = root + path

        const tree = await commit.getTree()
        if (!tree) return next()

        const entry = await tree.getEntry(path)
        if (!entry) return next()

        if (entry.mode.isDirectory) {
            if (!/\/$/.test(path)) {
                res.statusCode = 301
                let url = (req as any).originalUrl || req.url
                url = url!.replace(/(#|\?|$)/, "/$1")
                res.setHeader("Location", url)
                res.end()
                return
            }

            const indexList = Array.isArray(options.index) ? options.index : options.index ? [options.index] : ["index.html"];
            for (const index of indexList) {
                const indexPath = path.replace(/\/*$/, `/${index}`)
                const entry = await tree.getEntry(indexPath)
                if (entry) {
                    path = indexPath
                    break;
                }
            }
        }

        const file = await commit.getFile(path)
        if (!file) return next()

        const type = mime.lookup(path)
        if (type) res.setHeader("Content-Type", type)

        if (etag) res.setHeader("ETag", `W/${file.oid}`)

        res.statusCode = 200
        res.end(file.data)
    }
}