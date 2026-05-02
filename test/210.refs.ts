import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";
import supertest from "supertest";
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
        const request = supertest(app)

        await request.get("/foo.html?refs=main").then(res => assert.match(res.text, /Foo/))
        await request.get("/foo.html?refs=upper").then(res => assert.match(res.text, /FOO/))
        await request.get("/foo.html?refs=main-tag").then(res => assert.match(res.text, /Foo/))
        await request.get("/foo.html?refs=upper-tag").then(res => assert.match(res.text, /FOO/))
        await request.get("/foo.html").then(res => assert.equal(res.status, 404))
    })

    it("X-Refs: main", async () => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1/.git`,
            root: `htdocs`,
            refs: req => String(req.headers["x-refs"])
        })

        const app = express().use(serve)
        const request = supertest(app)

        await request.get("/foo.html").set("X-Refs", "main").then(res => assert.match(res.text, /Foo/))
        await request.get("/foo.html").set("X-Refs", "upper").then(res => assert.match(res.text, /FOO/))
        await request.get("/foo.html").set("X-Refs", "main-tag").then(res => assert.match(res.text, /Foo/))
        await request.get("/foo.html").set("X-Refs", "upper-tag").then(res => assert.match(res.text, /FOO/))
        await request.get("/foo.html").then(res => assert.equal(res.status, 404))
    })
})
