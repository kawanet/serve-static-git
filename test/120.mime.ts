import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";
import * as http from "node:http";
import supertest from "supertest";
import finalhandler from "finalhandler";

import {serveStaticGit} from "../lib/index.ts";

const BASE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/[^/]+\/?$/, "")
const TITLE = fileURLToPath(import.meta.url).split("/").pop()!

describe(TITLE, () => {
    const serve = serveStaticGit({
        repo: `${BASE}/repo/loose1/.git`,
        root: `htdocs`,
    })
    const request = supertest(http.createServer((req, res) => serve(req, res, finalhandler(req, res))))

    it(`content-type: text/html`, async () => {
        const res = await request.get(`/foo.html`)
        assert.strictEqual(res.status, 200)
        assert.match(res.text, /Foo/)
        assert.match(res.headers["content-type"], /^text\/html/)
    })

    it(`content-type: text/css`, async () => {
        const res = await request.get(`/bar/bar.css`)
        assert.strictEqual(res.status, 200)
        assert.match(res.text, /Bar/)
        assert.match(res.headers["content-type"], /^text\/css/)
    })

    it(`content-type: text/javascript`, async () => {
        const res = await request.get(`/bar/buz/buz.js`)
        assert.strictEqual(res.status, 200)
        assert.match(res.text, /Buz/)
        assert.match(res.headers["content-type"], /^text\/javascript/)
    })
})