#!/bin/sh
PORT=1822
HOST=$(hostname -f)
echo "AppStart server started"
echo "You can now reach the interface at $(tput bold)${HOST}:${PORT}$(tput sgr0)"
echo "To Stop serving press CTRL + C"
echo ""
echo "If you're using an iOS device, open the URL and hit: Add to Homescreen"
echo "Open the new 'App' and wait a few seconds. You can now stop this server."
PHP -S 0.0.0.0:$PORT -t PATH/public/