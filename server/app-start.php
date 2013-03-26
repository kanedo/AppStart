<?php
    require __DIR__ . '/vendor/autoload.php';
	require __DIR__.'/src/app-start-server.php';
	define("BASE_DIR", __DIR__);
	use Ratchet\Server\IoServer;
	use Kanedo\AppStartServer;
	use Ratchet\WebSocket\WsServer;
	
	$options = getopt("vhp:", array("verbose", "help", "port:"));
	if(array_key_exists("h", $options) || array_key_exists("help", $options)){
		echo "AppStart Server usage: \n";
		echo "-v --verbose to enable logging \n";
		echo "-h --help to see this message \n";
		exit(0);
	}
	$verbose = (array_key_exists("v", $options) || array_key_exists("verbose", $options))? true : false;
	$config = json_decode(file_get_contents(__DIR__."/../public/config.json"));
	$port = $config->server->port;
	/**
	 * Run baby!
	 **/
	try{
		$server = IoServer::factory(
	        new WsServer(
	            new AppStartServer($verbose)
	        )
	      , $port
	    );
	
    	$server->run();
	}catch(React\Socket\ConnectionException $e){
		echo "{$e->getMessage()}\n";
	}catch(Exception $e){
		echo $e;
	}