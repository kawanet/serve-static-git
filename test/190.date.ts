#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import axiosist from "axiosist";
import * as finalhandler from "finalhandler";

import {serveStaticGit, SSG} from "..";

const BASE = __dirname.replace(/\/[^/]+\/?$/, "")
const TITLE = __filename.split("/").pop()!
const VALID_DATE = /^\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT/;

describe(TITLE, () => {
    const makeRequest = (options: Pick<SSG.Options, "lastModified">) => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1/.git`,
            root: `htdocs`,
            lastModified: options.lastModified,
        })

        return axiosist((req, res) => serve(req, res, finalhandler(req, res)))
    };

    it(`lastModified: false`, async () => {
        const request = makeRequest({lastModified: false})
        const res = await request.get(`/foo.html`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Foo/)
        assert.match(res.headers["date"], VALID_DATE)
        assert.equal(res.headers["last-modified"], undefined, "should NOT have an Last-Modified:")
    })

    it(`lastModified: true`, async () => {
        const request = makeRequest({lastModified: true})
        const res = await request.get(`/bar/bar.css`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Bar/)
        assert.match(res.headers["date"], VALID_DATE)
        assert.match(res.headers["last-modified"], VALID_DATE)
    })

    it(`lastModified: undefined`, async () => {
        const request = makeRequest({})
        const res = await request.get(`/bar/buz/buz.js`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Buz/)
        assert.match(res.headers["date"], VALID_DATE)
        assert.match(res.headers["last-modified"], VALID_DATE)
    })

    it(`lastModified: "X-Commit-Date"`, async () => {
        const request = makeRequest({lastModified: "X-Commit-Date"})
        const res = await request.get(`/bar/buz/`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Index/)
        assert.match(res.headers["date"], VALID_DATE)
        assert.match(res.headers["x-commit-date"], VALID_DATE)
    })
})