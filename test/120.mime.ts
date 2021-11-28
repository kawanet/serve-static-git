#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import axiosist from "axiosist";
import * as finalhandler from "finalhandler";

import {serveStaticGit} from "..";

const assert_match: typeof assert.match = (value, regexp) => assert.ok(regexp.test(value), `"${value}" should match ${regexp}`)
if (!assert.match) assert.match = assert_match;

const BASE = __dirname.replace(/\/[^/]+\/?$/, "")
const TITLE = __filename.split("/").pop()!

describe(TITLE, () => {
    const serve = serveStaticGit({
        repo: `${BASE}/repo/loose1`,
        root: `htdocs`,
    })
    const request = axiosist((req, res) => serve(req, res, finalhandler(req, res)))

    it(`content-type: text/html`, async () => {
        const res = await request.get(`/foo.html`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Foo/)
        assert.match(res.headers["content-type"], /^text\/html/)
    })

    it(`content-type: text/css`, async () => {
        const res = await request.get(`/bar/bar.css`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Bar/)
        assert.match(res.headers["content-type"], /^text\/css/)
    })

    it(`content-type: application/javascript`, async () => {
        const res = await request.get(`/bar/buz/buz.js`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Buz/)
        assert.match(res.headers["content-type"], /^application\/javascript/)
    })
})