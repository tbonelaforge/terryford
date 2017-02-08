#!/bin/bash
source ./venv/bin/activate
nohup gunicorn -w 2 --pid gunicorn.pid  --error-logfile server-errors.log --access-logfile server-access.log webserver:app >> server-output.log 2>&1 &
