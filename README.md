# serve-static-git

[![Node.js CI](https://github.com/kawanet/serve-static-git/workflows/Node.js%20CI/badge.svg?branch=main)](https://github.com/kawanet/serve-static-git/actions/)
[![npm version](https://img.shields.io/npm/v/serve-static-git)](https://www.npmjs.com/package/serve-static-git)

Express middleware to serve static files directly from `.git` repository

## SYNOPSIS

With Express.js:

```js
const express = require("express");
const {serveStaticGit} = require("serve-static-git");

const app = express();

app.use(serveStaticGit({
  repo: "path/to/repository/.git",
  root: "htdocs",
}));

app.listen(3000);
```

With vanilla Node.js `http` module:

```js
const http = require("http");
const finalhandler = require('finalhandler')
const {serveStaticGit} = require("serve-static-git");

const serve = serveStaticGit({
  repo: "path/to/bare.git",
  root: "htdocs",
});

const server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res))
})

server.listen(3000)
```

### LINKS

- https://github.com/kawanet/serve-static-git
- https://www.npmjs.com/package/git-cat-file
- https://www.npmjs.com/package/serve-static-git
- https://www.npmjs.com/package/weboverlay

### LICENSE

MIT License

Copyright (c) 2021 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
