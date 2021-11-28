#!/usr/bin/env bash -v

cd $(dirname $0)/..
/bin/rm -fr repo/loose1 repo/packed1 repo/bare1.git

echo "==== loose1 ===="

mkdir -p repo/loose1
git -C repo/loose1 init -b main
cd repo/loose1
git config user.email "9765+kawanet@users.noreply.github.com"
git config user.name "serve-static-git"
git commit --allow-empty -m 'root commit'

mkdir -p htdocs/bar/buz
echo "<!-- Foo -->" > htdocs/foo.html
echo "/* Bar */" > htdocs/bar/bar.css
echo "// Buz" > htdocs/bar/buz/buz.js
echo "# htaccess" > htdocs/.htaccess
git add htdocs
git commit -m 'main branch'

git switch -c upper
echo "<!-- FOO -->" > htdocs/foo.html
echo "/* BAR */" > htdocs/bar/bar.css
echo "// BUZ" > htdocs/bar/buz/buz.js
echo "# HTACCESS" > htdocs/.htaccess
git add htdocs
git commit -m 'upper branch'
git switch main

echo "==== packed1 ===="

cd ..
git clone --no-single-branch loose1 packed1
cd packed1
git gc

echo "==== bare1.git ===="

cd ..
git clone --no-single-branch --bare packed1 bare1.git
cd bare1.git
