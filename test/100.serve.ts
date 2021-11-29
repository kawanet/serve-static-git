#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import axiosist from "axiosist";
import * as express from "express";
import * as finalhandler from "finalhandler";
import * as http from "http";

import {serveStaticGit} from "..";

const BASE = __dirname.replace(/\/[^/]+\/?$/, "")
const TITLE = __filename.split("/").pop()!

describe(TITLE, () => {
    const serve = serveStaticGit({
        repo: `${BASE}/repo/loose1/.git`,
        root: `htdocs`,
    })

    it(`express`, async () => {
        const app = express().use(serve)
        const request = axiosist(app)

        const res = await request.get(`/foo.html`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Foo/)
        assert.match(res.headers["content-type"], /^text\/html/)
        assert.ok(res.headers.etag, "should have an eTag")

        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/bar/bar.css").then(res => assert.equal(res.status, 200))
        await request.get("/bar/buz/buz.js").then(res => assert.equal(res.status, 200))
        await request.get(`/not-found.html`).then(res => assert.equal(res.status, 404))
    })

    it(`createServer`, async () => {
        const app = http.createServer((req, res) => serve(req, res, finalhandler(req, res)))
        const request = axiosist(app)

        const res = await request.get(`/bar/bar.css`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Bar/)
        assert.match(res.headers["content-type"], /^text\/css/)
        assert.ok(res.headers.etag, "should have an eTag")

        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/bar/bar.css").then(res => assert.equal(res.status, 200))
        await request.get("/bar/buz/buz.js").then(res => assert.equal(res.status, 200))
        await request.get(`/bar/not-found.html`).then(res => assert.equal(res.status, 404))
    })

    it(`finalhandler`, async () => {
        const request = axiosist((req, res) => serve(req, res, finalhandler(req, res)))

        const res = await request.get(`/bar/buz/buz.js`)
        assert.strictEqual(res.status, 200)
        assert.match(String(res.data), /Buz/)
        assert.match(res.headers["content-type"], /^application\/javascript/)
        assert.ok(res.headers.etag, "should have an eTag")

        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/bar/bar.css").then(res => assert.equal(res.status, 200))
        await request.get("/bar/buz/buz.js").then(res => assert.equal(res.status, 200))
        await request.get(`/bar/buz/not-found.html`).then(res => assert.equal(res.status, 404))
    })
})