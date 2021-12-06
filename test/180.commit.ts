#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import axiosist from "axiosist";
import * as finalhandler from "finalhandler";

import {serveStaticGit, SSG} from "..";

const BASE = __dirname.replace(/\/[^/]+\/?$/, "")
const TITLE = __filename.split("/").pop()!

describe(TITLE, () => {
    const makeRequest = (options: Pick<SSG.Options, "commit">) => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1/.git`,
            root: `htdocs`,
            commit: options.commit,
        })

        return axiosist((req, res) => serve(req, res, finalhandler(req, res)))
    };

    it(`commit: false`, async () => {
        const request = makeRequest({commit: false})
        const res = await request.get(`/foo.html`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Foo/)
        assert.equal(res.headers["x-commit"], undefined, "should NOT have an X-Commit:")
    })

    it(`commit: true`, async () => {
        const request = makeRequest({commit: true})
        const res = await request.get(`/bar/bar.css`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Bar/)
        assert.match(res.headers["content-type"], /^text\/css/)
        assert.match(res.headers["x-commit"], /^[0-9a-fA-F]{40,}$/)
    })

    it(`commit: undefined`, async () => {
        const request = makeRequest({})
        const res = await request.get(`/bar/buz/buz.js`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Buz/)
        assert.match(res.headers["content-type"], /^application\/javascript/)
        assert.match(res.headers["x-commit"], /^[0-9a-fA-F]{40,}$/)
    })
})