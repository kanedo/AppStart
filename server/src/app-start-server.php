<?php
namespace Kanedo;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use CFPropertyList\CFPropertyList;

#require_once './vendor/plist/parsers/plist/PlistParser.inc';

class AppStartServer implements MessageComponentInterface {
	protected $clients;
	protected $apps;

	    public function __construct() {
	        $this->clients = new \SplObjectStorage;
			$this->loadConfig();
	    }
		
		private function loadConfig($file = "./apps.json"){
			$app_json = file_get_contents("./apps.json");
			$this->apps = json_decode($app_json);
			$this->createIcons();
		}
		
		private function createIcons(){			
			$i = 0;
			foreach($this->apps as $app){
				if(!file_exists($app->file."/Contents/info.plist"))
				break;
				echo "Trying to parse ".$app->file."/Contents/info.plist\n";
				try{
					$parser = new CFPropertyList($app->file."/Contents/info.plist",  CFPropertyList::FORMAT_XML);
					$plist = $parser->toArray();
					
					$icon = $app->file."/Contents/Resources/".$plist['CFBundleIconFile'];
					echo $icon."\n";
					if(substr($icon, -5) != ".icns"){
						echo "added icns extension...\n";
						$icon = $icon.".icns";
					}
					$ext = pathinfo($plist['CFBundleIconFile'], PATHINFO_EXTENSION);
					$icon_name = str_replace(".".$ext, '', $plist['CFBundleIconFile']);
					$out = "tmp";
					echo "Generating Icon for {$app->name}...\n";
					echo "Icon file presumed under {$icon} \n";
					if(!file_exists("tmp/".$icon_name.".png")){
						exec("sips --resampleHeightWidthMax 256 -s format png {$icon} --out {$out}");
					}else{
						echo "Icon {$icon_name} already exists, skipping \n";
					}
					$icon_file = @file_get_contents("tmp/".$icon_name.".png");
					$this->apps[$i]->icon = ($icon != NULL) ? base64_encode($icon_file) : false;
				}catch(Exception $e){
					echo "UhOhUh something went wrong...\n{$e->getMessage()}\n";
					$this->apps[$i]->icon = false;
				}
				$i++;
			}			
		}
		
		private function isValidCmd($message){
			switch($message->cmd){
				case 'refresh':
					return true;
				break;
				case 'start':
					return $this->isValidApp($message);
				break;
				case 'mediacontrol':
					return true;
				default:
				return false;
			}
		}
		
		private function parseCmd($message){
			switch($message->cmd){
				case 'refresh':
					$this->refresh();
				break;
				case 'start':
					$this->startApp($message->app);
				break;
				case 'mediacontrol':
					$this->mediaKeys($message->key);
				default:
				return false;
			}
			
		}
		
		private function refresh(){
			echo "Send refreshed data...\n";
			$this->loadConfig();
			foreach($this->clients as $conn){
				$this->sendApps($conn);
			}
		}
		
		private function startApp($name){
			echo "START {$name} NOW...\n";
			$app = $this->getApp($name);
			$cmd = "{$app->cmd} {$app->file}";
			echo $cmd."\n";
			exec($cmd);
		}
		
		private function isValidApp($message){
			if($message->app == NULL || $message->cmd != "start"){
				return false;
			}
			foreach($this->apps as $app){
				if($app->name == $message->app){
					return true;
				}
			}
			return false;
		}
		
		private function getApp($name){
			foreach($this->apps as $app){
				if($app->name == $name){
					return $app;
				}
			}
		}
		
		private function mediaKeys($key){
			$cmd = null;
			$log = "";
			switch($key){
				case 'play':
					$cmd = "playpause";
					$log = "Play/Pause...";
				break;
				case 'backward':
					$cmd = "prev";
					$log = "Previous track...";
				break;
				case 'forward':
					$cmd = "next";
					$log = "Next track...";
				break;
				case 'volume-up':
					$cmd = 'volup';
					$log = "Volume up...";
				break;
				case 'volume-down':
					$cmd = 'voldown';
					$log = "Volume down...";
				break;
				default:
				return false;
			}
			echo $log."\n";
			exec("./src/mediakeys.py {$cmd} &");
		}

	    public function onOpen(ConnectionInterface $conn) {
	        // Store the new connection to send messages to later
			echo "New Connection is comming in...\n";
	        $this->clients->attach($conn);
			$this->sendApps($conn);
	    }

	    public function onMessage(ConnectionInterface $from, $msg) {
	        if(($dec_message = json_decode($msg)) != NULL){
				if($this->isValidCmd($dec_message)){
						$this->parseCmd($dec_message);
				}else{
					echo "Attempt to start unknown app. Aborted...\n";
				}
			}
	    }

	    public function onClose(ConnectionInterface $conn) {
	        // The connection is closed, remove it, as we can no longer send it messages
			echo "Connection was closed...\n";
	        $this->clients->detach($conn);
	    }

	    public function onError(ConnectionInterface $conn, \Exception $e) {
	        echo "An error has occurred: {$e->getMessage()}\n";

	        $conn->close();
	    }
		
		private function hash(){
			$string = "";
			foreach($this->apps as $app){
				$string = $string.$app->name;
			}
			return md5($string);
		}
		
		public function sendApps(ConnectionInterface $conn){
			$msg = array(
				'hash' => $this->hash(),
				'apps'=> array()
			);	
			foreach($this->apps as $app){
				$msg['apps'][] = array('name' => $app->name, 'icon' => $app->icon);
			}
			$conn->send(json_encode($msg));
		}
}
?>