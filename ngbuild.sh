#!/bin/bash

ng build --prod;

cd dist/ng7-pre;

http-server -c-1;
