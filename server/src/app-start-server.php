<?php
namespace Kanedo;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use CFPropertyList\CFPropertyList;

#require_once './vendor/plist/parsers/plist/PlistParser.inc';

class AppStartServer implements MessageComponentInterface {
	protected $clients;
	protected $apps;
	protected static $log;
	    public function __construct($log = false) {
			self::$log = $log;
	        $this->clients = new \SplObjectStorage;
			$this->loadConfig();
	    }
		
		private function loadConfig($file = "/apps.json"){
			$app_json = file_get_contents(BASE_DIR.$file);
			$this->apps = json_decode($app_json);
			$this->createIcons();
		}
		
		private function createIcons(){			
			$i = 0;
			foreach($this->apps as $app){
				if(!file_exists($app->file."/Contents/info.plist")){
					if(!(property_exists($app, "type") && $app->type == "script")){
						AppStartServer::log("unset app {$app->name}");
						unset($this->apps[$i]);
						$i++;
						continue;
					}
				}
				
				if(property_exists($app, "type") && $app->type == "script"){
					AppStartServer::log("App {$app->name} is a script. Use default icon..."); 
					$this->apps[$i]->icon = "";
					$i++;
					continue;
				}
				
				AppStartServer::log("Trying to parse ".$app->file."/Contents/info.plist");
				try{
					$parser = new CFPropertyList($app->file."/Contents/info.plist",  CFPropertyList::FORMAT_XML);
					$plist = $parser->toArray();
					
					$icon = $app->file."/Contents/Resources/".$plist['CFBundleIconFile'];
					$icon = str_replace(" ", "\\ ", $icon);
					AppStartServer::log($icon);
					if(substr($icon, -5) != ".icns"){
						AppStartServer::log("added icns extension...");
						$icon = $icon.".icns";
					}
					$ext = pathinfo($plist['CFBundleIconFile'], PATHINFO_EXTENSION);
					$icon_name = strtolower(str_replace(array('\\','/',':','*','?','"','<','>','|', ' '),'_',$app->name));
					$out = "tmp";
					AppStartServer::log("Generating Icon for {$app->name}...");
					AppStartServer::log("Icon file presumed under {$icon}");
					if(!file_exists(BASE_DIR."/tmp/".$icon_name.".png")){
						AppStartServer::log("sips --resampleHeightWidthMax 256 -s format png {$icon} --out ".BASE_DIR."/{$out}/{$icon_name}.png");
						exec("sips --resampleHeightWidthMax 256 -s format png {$icon} --out ".BASE_DIR."/{$out}/{$icon_name}.png");
					}else{
						AppStartServer::log("Icon {$icon_name} already exists, skipping");
					}
					$icon_file = @file_get_contents(BASE_DIR."/tmp/".$icon_name.".png");
					$this->apps[$i]->icon = ($icon != NULL) ? base64_encode($icon_file) : false;
				}catch(Exception $e){
					AppStartServer::log("UhOhUh something went wrong...\n{$e->getMessage()}");
					$this->apps[$i]->icon = false;
				}
				$i++;
			}	
			$this->apps = array_values($this->apps);		
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
				case 'sleep':
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
					break;
				case 'sleep':
					$this->sleepMac();
					break;
				default:
				return false;
			}
			
		}
		
		private function refresh(){
			AppStartServer::log("Send refreshed data...");
			$this->loadConfig();
			foreach($this->clients as $conn){
				$this->sendApps($conn);
			}
		}
		
		private function sleepMac(){
			AppStartServer::log("Send Mac to sleep...");
			exec("osascript -e 'tell the application \"Finder\" to sleep'");
		}
		
		private function startApp($name){
			AppStartServer::log("START {$name} NOW...");
			$app = $this->getApp($name);
			$file = escapeshellarg($app->file);
			$cmd = "{$app->cmd} {$file}";
			AppStartServer::log($cmd);
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
		
		private function getCurrentTrack(){
			exec("osascript ".BASE_DIR."/src/current_track.scp", $current_track);
			if(!is_array($current_track) || $current_track[0] == "false"){
				return false;
			}
			return $current_track[0];
		}
		
		private function spotifyPrevNext($cmd){
			$is_running = "-e 'on is_running(appName)' -e ' tell application \"System Events\" to (name of processes) contains appName' -e 'end is_running'";
			$cmd_string = "-e 'if is_running(\"Spotify\") then' -e 'tell application \"Spotify\"' -e '{$cmd} track' -e 'end tell' -e 'end if'";
			
			exec("osascript {$is_running} {$cmd_string}");
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
					$this->spotifyPrevNext("previous");
					$log = "Previous track...";
				break;
				case 'forward':
					$cmd = "next";
					$this->spotifyPrevNext("next");
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
			AppStartServer::log($log);
			exec(BASE_DIR."/src/mediakeys.py {$cmd} &");
		}

	    public function onOpen(ConnectionInterface $conn) {
	        // Store the new connection to send messages to later
			AppStartServer::log("New Connection is comming in...");
			AppStartServer::log("get current track...");
			AppStartServer::log($this->getCurrentTrack());
	        $this->clients->attach($conn);
			$this->sendApps($conn);
	    }

	    public function onMessage(ConnectionInterface $from, $msg) {
	        if(($dec_message = json_decode($msg)) != NULL){
				if($this->isValidCmd($dec_message)){
						$this->parseCmd($dec_message);
				}else{
					AppStartServer::log("Attempt to start unknown app. Aborted...");
				}
			}
	    }

	    public function onClose(ConnectionInterface $conn) {
	        // The connection is closed, remove it, as we can no longer send it messages
			AppStartServer::log("Connection was closed...");
	        $this->clients->detach($conn);
	    }

	    public function onError(ConnectionInterface $conn, \Exception $e) {
	        AppStartServer::log("An error has occurred: {$e->getMessage()}");

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
				'apps'=> array(),
				'cmd' => 'apps'
			);	
			foreach($this->apps as $app){	
				$msg['apps'][] = array('name' => $app->name, 'icon' => $app->icon);
			}

			$conn->send(json_encode($msg));
		}
		
		public static function log($message){
			if(!self::$log){
				return;
			}
			date_default_timezone_set('Europe/Berlin');
			echo "[".date("Y-m-d H:i:s")."] ".$message."\n";
			syslog(LOG_ERR, $message);
		}
}
?>