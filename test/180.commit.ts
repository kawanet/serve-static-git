import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";
import * as http from "node:http";
import supertest from "supertest";
import finalhandler from "finalhandler";

import {serveStaticGit} from "../lib/index.ts";
import type {SSG} from "../types/serve-static-git.d.ts";

const BASE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/[^/]+\/?$/, "")
const TITLE = fileURLToPath(import.meta.url).split("/").pop()!

describe(TITLE, () => {
    const makeRequest = (options: Pick<SSG.Options, "commit">) => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1/.git`,
            root: `htdocs`,
            commit: options.commit,
        })

        return supertest(http.createServer((req, res) => serve(req, res, finalhandler(req, res))))
    };

    it(`commit: false`, async () => {
        const request = makeRequest({commit: false})
        const res = await request.get(`/foo.html`)
        assert.strictEqual(res.status, 200)
        assert.match(res.text, /Foo/)
        assert.equal(res.headers["x-commit"], undefined, "should NOT have an X-Commit:")
    })

    it(`commit: true`, async () => {
        const request = makeRequest({commit: true})
        const res = await request.get(`/bar/bar.css`)
        assert.strictEqual(res.status, 200)
        assert.match(res.text, /Bar/)
        assert.match(res.headers["content-type"], /^text\/css/)
        assert.match(res.headers["x-commit"], /^[0-9a-fA-F]{40,}$/)
    })

    it(`commit: undefined`, async () => {
        const request = makeRequest({})
        const res = await request.get(`/bar/buz/buz.js`)
        assert.strictEqual(res.status, 200)
        assert.match(res.text, /Buz/)
        assert.match(res.headers["content-type"], /^application\/javascript/)
        assert.match(res.headers["x-commit"], /^[0-9a-fA-F]{40,}$/)
    })

    it(`commit: "X-Commit-Id"`, async () => {
        const request = makeRequest({commit: "X-Commit-Id"})
        const res = await request.get(`/bar/buz/`)
        assert.strictEqual(res.status, 200)
        assert.match(res.text, /Index/)
        assert.match(res.headers["content-type"], /^text\/html/)
        assert.match(res.headers["x-commit-id"], /^[0-9a-fA-F]{40,}$/)
    })
})