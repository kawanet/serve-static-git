#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import axiosist from "axiosist";
import * as finalhandler from "finalhandler";

import {serveStaticGit, SSG} from "..";

const BASE = __dirname.replace(/\/[^/]+\/?$/, "")
const TITLE = __filename.split("/").pop()!

describe(TITLE, () => {
    const makeRequest = (options: Pick<SSG.Options, "dotfiles">) => {
        const serve = serveStaticGit({
            repo: `${BASE}/repo/loose1`,
            root: `htdocs`,
            dotfiles: options.dotfiles,
        })

        return axiosist((req, res) => serve(req, res, finalhandler(req, res)))
    };

    it(`dotfiles: "ignore"`, async () => {
        const request = makeRequest({dotfiles: "ignore"})
        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/.htaccess").then(res => assert.equal(res.status, 404))
    })

    it(`dotfiles: "deny"`, async () => {
        const request = makeRequest({dotfiles: "deny"})
        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/.htaccess").then(res => assert.equal(res.status, 403))
    })

    it(`dotfiles: "allow"`, async () => {
        const request = makeRequest({dotfiles: "allow"})
        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/.htaccess").then(res => assert.equal(res.status, 200))
    })

    it(`dotfiles: undefined`, async () => {
        const request = makeRequest({dotfiles: undefined})
        await request.get("/foo.html").then(res => assert.equal(res.status, 200))
        await request.get("/.htaccess").then(res => assert.equal(res.status, 404))
    })
})