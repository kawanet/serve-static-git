#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import axiosist from "axiosist";
import * as express from "express";

import {serveStaticGit} from "..";
import {responseHandler} from "express-intercept";

const BASE = __dirname.replace(/\/[^/]+\/?$/, "")
const TITLE = __filename.split("/").pop()!

describe(TITLE, () => {
    const app = express();

    app.use(responseHandler().replaceString(body => body.toLowerCase()))

    app.use(serveStaticGit({
        repo: `${BASE}/repo/loose1/.git`,
        root: `htdocs`,
        dotfiles: "deny",
    }))

    const request = axiosist(app)

    it(`replaceString()`, async () => {
        await request.get("/foo.html").then(res => assert.match(String(res.data), /foo/))
        await request.get("/bar/bar.css").then(res => assert.match(String(res.data), /bar/))
        await request.get("/bar/buz/buz.js").then(res => assert.match(String(res.data), /buz/))
        await request.get("/not-found.html").then(res => assert.equal(res.status, 404))
        await request.get("/.htaccess").then(res => assert.equal(res.status, 403))
    })
})