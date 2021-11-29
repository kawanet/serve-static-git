#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import axiosist from "axiosist";
import * as finalhandler from "finalhandler";

import {serveStaticGit, SSG} from "..";

const BASE = __dirname.replace(/\/[^/]+\/?$/, "")
const TITLE = __filename.split("/").pop()!

describe(TITLE, () => {
    const makeRequest = (options: Pick<SSG.Options, "index">) => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1/.git`,
            root: `htdocs`,
            index: options.index,
        })

        return axiosist((req, res) => serve(req, res, finalhandler(req, res)))
    };

    it(`index: undefined`, async () => {
        const request = makeRequest({index: undefined})
        await request.get("/bar/buz/index.html").then(res => assert.match(String(res.data), /Index/, "/bar/buz/index.html"))
        await request.get("/bar/buz/").then(res => assert.match(String(res.data), /Index/, "/bar/buz/"))
        await request.get("/bar/").then(res => assert.equal(res.status, 404, "/bar/"))
        await request.get("/").then(res => assert.equal(res.status, 404, "/"))
    })

    it(`index: "foo.html"`, async () => {
        const request = makeRequest({index: "foo.html"})
        await request.get("/bar/buz/").then(res => assert.equal(res.status, 404, "/bar/buz/"))
        await request.get("/bar/").then(res => assert.equal(res.status, 404, "/bar/"))
        await request.get("/").then(res => assert.match(String(res.data), /Foo/, "/"))
    })

    it(`index: ["index.html", "foo.html"]`, async () => {
        const request = makeRequest({index: ["index.html", "foo.html"]})
        await request.get("/bar/buz/").then(res => assert.match(String(res.data), /Index/, "/bar/buz/"))
        await request.get("/bar/").then(res => assert.equal(res.status, 404, "/bar/"))
        await request.get("/").then(res => assert.match(String(res.data), /Foo/, "/"))

        await request.get("/?_=1638157880").then(res => assert.match(String(res.data), /Foo/, "/?_=1638157880"))
    })
})