#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import axiosist from "axiosist";
import * as express from "express";
import * as qs from "qs-lite";

import {serveStaticGit} from "..";

const assert_match: typeof assert.match = (value, regexp) => assert.ok(regexp.test(value), `"${value}" should match ${regexp}`)
if (!assert.match) assert.match = assert_match;

const BASE = __dirname.replace(/\/[^/]+\/?$/, "")
const TITLE = __filename.split("/").pop()!

describe(TITLE, () => {
    it("?refs=main", async () => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1/.git`,
            root: `htdocs`,
            refs: req => qs.parse(String(req.url).split("?")[1]).refs
        })

        const app = express().use(serve)
        const request = axiosist(app)

        await request.get("/foo.html?refs=main").then(res => assert.match(String(res.data), /Foo/))
        await request.get("/foo.html?refs=upper").then(res => assert.match(String(res.data), /FOO/))
        await request.get("/foo.html").then(res => assert.equal(res.status, 404))
    })

    it("X-Refs: main", async () => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1/.git`,
            root: `htdocs`,
            refs: req => String(req.headers["x-refs"])
        })

        const app = express().use(serve)
        const request = axiosist(app)

        await request.get("/foo.html", {headers: {"X-Refs": "main"}}).then(res => assert.match(String(res.data), /Foo/))
        await request.get("/foo.html", {headers: {"X-Refs": "upper"}}).then(res => assert.match(String(res.data), /FOO/))
        await request.get("/foo.html").then(res => assert.equal(res.status, 404))
    })
})