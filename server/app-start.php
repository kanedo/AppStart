<?php
    require __DIR__ . '/vendor/autoload.php';
	require __DIR__.'/src/app-start-server.php';
	use Ratchet\Server\IoServer;
	use Kanedo\AppStartServer;
	use Ratchet\WebSocket\WsServer;
	
	$options = getopt("vh", array("verbose", "help"));
	$verbose = (array_key_exists("v", $options) || array_key_exists("verbose", $options))? true : false;
	if(array_key_exists("h", $options) || array_key_exists("help", $options)){
		echo "AppStart Server usage: \n";
		echo "-v --verbose to enable logging \n";
		echo "-h --help to see this message \n";
		exit(0);
	}
		$server = IoServer::factory(
		        new WsServer(
		            new AppStartServer($verbose)
		        )
		      , 8080
		    );

	    $server->run();