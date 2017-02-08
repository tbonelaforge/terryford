#!/bin/bash
cat gunicorn.pid | xargs kill -s SIGQUIT
