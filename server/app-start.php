<?php
    require __DIR__ . '/vendor/autoload.php';
	require __DIR__.'/src/app-start-server.php';
	use Ratchet\Server\IoServer;
	use Kanedo\AppStartServer;
	use Ratchet\WebSocket\WsServer;
	
		$server = IoServer::factory(
		        new WsServer(
		            new AppStartServer()
		        )
		      , 8080
		    );

	    $server->run();