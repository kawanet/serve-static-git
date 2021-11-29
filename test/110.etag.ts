#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import axiosist from "axiosist";
import * as finalhandler from "finalhandler";

import {serveStaticGit, SSG} from "..";

const assert_match: typeof assert.match = (value, regexp) => assert.ok(regexp.test(value), `"${value}" should match ${regexp}`)
if (!assert.match) assert.match = assert_match;

const BASE = __dirname.replace(/\/[^/]+\/?$/, "")
const TITLE = __filename.split("/").pop()!

describe(TITLE, () => {
    const makeRequest = (options: Pick<SSG.Options, "etag">) => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1/.git`,
            root: `htdocs`,
            etag: options.etag,
        })

        return axiosist((req, res) => serve(req, res, finalhandler(req, res)))
    };

    it(`etag: false`, async () => {
        const request = makeRequest({etag: false})
        const res = await request.get(`/foo.html`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Foo/)
        assert.equal(res.headers.etag, undefined, "should NOT have an eTag")
    })

    it(`etag: true`, async () => {
        const request = makeRequest({etag: true})
        const res = await request.get(`/bar/bar.css`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Bar/)
        assert.match(res.headers["content-type"], /^text\/css/)
        assert.match(res.headers.etag, /^W\/[0-9a-fA-F]{40,}$/)
    })

    it(`etag: undefined`, async () => {
        const request = makeRequest({})
        const res = await request.get(`/bar/buz/buz.js`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Buz/)
        assert.match(res.headers["content-type"], /^application\/javascript/)
        assert.match(res.headers.etag, /^W\/[0-9a-fA-F]{40,}$/)
    })
})