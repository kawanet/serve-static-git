#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import axiosist from "axiosist";
import * as finalhandler from "finalhandler";

import {serveStaticGit} from "..";

const BASE = __dirname.replace(/\/[^/]+\/?$/, "")
const TITLE = __filename.split("/").pop()!

describe(TITLE, () => {
    const serve = serveStaticGit({
        repo: `${BASE}/repo/loose1/.git`,
        root: `htdocs`,
    })

    const request = axiosist((req, res) => serve(req, res, finalhandler(req, res)))

    it(`maxRedirects: 0`, async () => {
        await request.get("/bar/buz", {maxRedirects: 0}).then(res => {
            assert.equal(res.status, 301, "/bar/buz")
            assert.match(res.headers.location, /\/bar\/buz\/$/)
        })

        await request.get("/bar/buz?_=1638157880", {maxRedirects: 0}).then(res => {
            assert.equal(res.status, 301, "/bar/buz?_=1638157880")
            assert.match(res.headers.location, /\/bar\/buz\/\?_=1638157880$/)
        })
    })

    it(`maxRedirects: 1`, async () => {
        await request.get("/bar/buz", {maxRedirects: 1}).then(res => {
            assert.equal(res.status, 200, "/bar/buz")
            assert.match(String(res.data), /Index/)
        })
    })
})