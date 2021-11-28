#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import axiosist from "axiosist";
import * as finalhandler from "finalhandler";

import {serveStaticGit, SSG} from "..";

const BASE = __dirname.replace(/\/[^/]+\/?$/, "")
const TITLE = __filename.split("/").pop()!

describe(TITLE, () => {
    const makeRequest = (options: Pick<SSG.Options, "root">) => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1`,
            root: options.root
        })

        return axiosist((req, res) => serve(req, res, finalhandler(req, res)))
    };

    it(`root: "htdocs"`, async () => {
        const request = makeRequest({root: "htdocs"})
        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/bar/bar.css").then(res => assert.equal(res.status, 200))
    })

    it(`root: "htdocs/bar"`, async () => {
        const request = makeRequest({root: "htdocs/bar"})
        await request.get("/bar.css").then(res => assert.equal(res.status, 200))
        await request.get("/buz/buz.js").then(res => assert.equal(res.status, 200))
    })

    it(`root: "htdocs/bar/buz"`, async () => {
        const request = makeRequest({root: "htdocs/bar/buz"})
        await request.get("/buz.js").then(res => assert.equal(res.status, 200))
    })

    it(`root: undefined`, async () => {
        const request = makeRequest({root: undefined})
        await request.get("/htdocs/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/htdocs/bar/bar.css").then(res => assert.equal(res.status, 200))
    })
})