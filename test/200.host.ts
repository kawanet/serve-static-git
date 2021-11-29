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

    {
        const host = "main.localhost"
        it(`host: "${host}"`, async () => {
            await request.get("/foo.html", {headers: {host}}).then(res => assert.match(String(res.data), /Foo/))
            await request.get("/bar/bar.css", {headers: {host}}).then(res => assert.match(String(res.data), /Bar/))
            await request.get("/bar/buz/buz.js", {headers: {host}}).then(res => assert.match(String(res.data), /Buz/))
        })
    }

    {
        const host = "upper.localhost"
        it(`host: "${host}"`, async () => {
            await request.get("/foo.html", {headers: {host}}).then(res => assert.match(String(res.data), /FOO/))
            await request.get("/bar/bar.css", {headers: {host}}).then(res => assert.match(String(res.data), /BAR/))
            await request.get("/bar/buz/buz.js", {headers: {host}}).then(res => assert.match(String(res.data), /BUZ/))
        })
    }
})