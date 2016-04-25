#!/bin/bash
#
# # sync existing commit
# ./restart.sh 
#
# # new tag
# ./restart.sh -c v0.1.129_release
#
# # rebuild
# ./restart.sh -c v0.1.129_release -r
#


echo 'This is just a placeholder atm';exit

while getopts 'c:r' opt; do
	case $opt in
		c)
			COMMIT=$OPTARG
		;;
		r)
			REBUILD=1
		;;
	esac
done


if [ "$COMMIT" == "" ]; then
	# dont pull if we have modified files
	if [ "`git diff | head -n1`" == "" ]; then
		COMMIT=`git log | head -n1 | awk '{print $2}'`
	fi
fi

if [ "$COMMIT" != "" ]; then
	echo "checking out $COMMIT..."
	git fetch
	git fetch --tags
	git checkout "$COMMIT"

	echo "tag: "`git describe --tags`
	echo "branch: "`git branch | grep '*'`
else
	echo "no change"
fi

if [ "$REBUILD" == "1" ]; then
	echo "rebuilding..."
	#npm install -g bower
	#bower --allow-root install
	npm install
	# Trouble installing toobusy package? One solution may be use older version of python, shown below.
	# However I'm pretty damn sure there is a better solution I've used in the past...
	# npm install --python=python2.7
	npm rebuild
fi

echo "restart platform-v2..."
restart platform-v2
#sleep 1
#echo "restarting varnish..."
#/etc/init.d/varnish restart

