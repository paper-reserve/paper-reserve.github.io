#!/bin/bash

ng build --prod;

npm run-script postbuild;

cd dist/ng7-pre;

http-server -c-1;
