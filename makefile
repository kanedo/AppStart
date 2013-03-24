# DON'T EDIT HERE!!!
all: 
	cd ./server && composer install
	./configure
	
install:
	chmod +x ./server/app-start
	cp net.kanedo.AppStart.plist ~/Library/LaunchAgents/net.kanedo.AppStart.plist
	chmod +x ~/Library/LaunchAgents/net.kanedo.AppStart.plist
	launchctl load ~/Library/LaunchAgents/net.kanedo.AppStart.plist
	launchctl start net.kanedo.AppStart