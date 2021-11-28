/**
 * https://github.com/kawanet/serve-static-git
 */

import {openLocalRepo} from "git-cat-file"
import * as http from "http"
import * as mime from "mime"

import type {SSG} from ".."

export function serveStaticGit(options: SSG.Options): SSG.RequestHandler<http.ServerResponse> {
    const repo = openLocalRepo(options.repo)

    let root = options.root
    if (root) root = root.replace(/\/?$/, "/")

    const etag = (options.etag !== false)
    const dotfiles = options.dotfiles || "ignore"

    return async (req, res, next) => {
        const host = String(req.headers.host)
        const isIP = /^\d+\.\d+\.\d+\.\d+(:|$)/.test(host)
        const rev = !isIP && host.split(/[.:]/).shift()!

        let commit = await repo.getCommit(rev || "HEAD").catch(_ => undefined)
        if (rev && !commit) {
            commit = await repo.getCommit("HEAD").catch(_ => undefined)
        }

        if (!commit) return next()

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
        const file = await commit.getFile(path).catch(_ => undefined)
        if (!file) return next()

        const type = mime.lookup(path)
        if (type) res.setHeader("Content-Type", type)

        if (etag) res.setHeader("ETag", `W/${file.oid}`)

        res.statusCode = 200
        res.end(file.data)
    }
}