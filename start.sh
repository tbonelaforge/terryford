#!/bin/bash
nohup gunicorn -w 2 --pid gunicorn.pid  --error-logfile server-errors.log --access-logfile server-access.log --max-requests 1 webserver:app >> server-output.log 2>&1 &
