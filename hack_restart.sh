#!/bin/bash
# Note!: This is a temp hack for me. Do not use in real scripts
#


killall node
killall gulp
if [ "$1" == "-r" ]; then
	export NODE_ENV=
else
	export NODE_ENV=production
fi
/root/sire/bin/angel.sh "/var/www/fsb-demo/algo/server.js" >> /var/log/angel.log 2>&1
/root/sire/bin/angel.sh "/var/www/ranktt-web/index.js" >> /var/log/angel.log 2>&1
