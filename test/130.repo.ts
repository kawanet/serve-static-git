#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import axiosist from "axiosist";
import * as finalhandler from "finalhandler";

import {serveStaticGit} from "..";

const BASE = __dirname.replace(/\/[^/]+\/?$/, "")
const TITLE = __filename.split("/").pop()!

describe(TITLE, () => {

    ["repo/loose1", "repo/packed1", "repo/bare1.git"].forEach(test)

    function test(repo: string) {
        it(`repo: "${repo}"`, async () => {
            const serve = serveStaticGit({
                repo: `${BASE}/${repo}`,
                root: `htdocs`,
            })
            const request = axiosist((req, res) => serve(req, res, finalhandler(req, res)))
            await request.get("/foo.html").then(res => assert.equal(res.status, 200))
            await request.get("/bar/bar.css").then(res => assert.equal(res.status, 200))
            await request.get("/bar/buz/buz.js").then(res => assert.equal(res.status, 200))
            await request.get(`/not-found.html`).then(res => assert.equal(res.status, 404))
        })
    }
})