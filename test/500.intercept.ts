import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";
import axiosist from "axiosist";
import express from "express";

import {serveStaticGit} from "../lib/index.ts";
import {responseHandler} from "express-intercept";

const BASE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/[^/]+\/?$/, "")
const TITLE = fileURLToPath(import.meta.url).split("/").pop()!

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