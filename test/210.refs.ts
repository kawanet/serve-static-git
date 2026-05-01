import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";
import axiosist from "axiosist";
import express from "express4";
import * as qs from "qs-lite";

import {serveStaticGit} from "../lib/index.ts";

const BASE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/[^/]+\/?$/, "")
const TITLE = fileURLToPath(import.meta.url).split("/").pop()!

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
        await request.get("/foo.html?refs=main-tag").then(res => assert.match(String(res.data), /Foo/))
        await request.get("/foo.html?refs=upper-tag").then(res => assert.match(String(res.data), /FOO/))
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
        await request.get("/foo.html", {headers: {"X-Refs": "main-tag"}}).then(res => assert.match(String(res.data), /Foo/))
        await request.get("/foo.html", {headers: {"X-Refs": "upper-tag"}}).then(res => assert.match(String(res.data), /FOO/))
        await request.get("/foo.html").then(res => assert.equal(res.status, 404))
    })
})
