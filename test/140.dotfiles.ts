import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";
import axiosist from "axiosist";
import finalhandler from "finalhandler";

import {serveStaticGit} from "../lib/index.ts";
import type {SSG} from "../types/serve-static-git.d.ts";

const BASE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/[^/]+\/?$/, "")
const TITLE = fileURLToPath(import.meta.url).split("/").pop()!

describe(TITLE, () => {
    const makeRequest = (options: Pick<SSG.Options, "dotfiles">) => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1/.git`,
            root: `htdocs`,
            dotfiles: options.dotfiles,
        })

        return axiosist((req, res) => serve(req, res, finalhandler(req, res)))
    };

    it(`dotfiles: "ignore"`, async () => {
        const request = makeRequest({dotfiles: "ignore"})
        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/.htaccess").then(res => assert.equal(res.status, 404))
    })

    it(`dotfiles: "deny"`, async () => {
        const request = makeRequest({dotfiles: "deny"})
        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/.htaccess").then(res => assert.equal(res.status, 403))
    })

    it(`dotfiles: "allow"`, async () => {
        const request = makeRequest({dotfiles: "allow"})
        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/.htaccess").then(res => assert.equal(res.status, 200))
    })

    it(`dotfiles: undefined`, async () => {
        const request = makeRequest({dotfiles: undefined})
        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/.htaccess").then(res => assert.equal(res.status, 404))
    })
})