#App Start 
App Start ist eine kleine offline WebApp die mit Hilfe von Websockets und einer Server Komponente Apps auf einem Mac starten und grundlegend steuern kann.
##Installation
Das Programm ist aufgeteilt in zwei wesentliche Komponenten
###WebApp
Die Webapp ist zu finden unter `./public`. Dieser Ordner muss via Web ereichbar sein.
###Server
Der Server befindet sich in `./server` und darf **nicht** öffentlich erreichbar sein!
Die Installation des servers ist relativ simpel. Zunächst installiert man sich [Composer](http://getcomposer.org) und navigiert im Terminal nach `./server`. Dort lassen sich die Abhängigkeiten mittels 

	composer install
	
installieren.   
Um den Server zu starten gibt es das Bash-Script `./server/app-start`.

##Konfiguration
###Apps
Die erreichbaren Anwendungen werden als JSON in `./server/apps.json` konfiguriert.  
Das Schema ist wie folgt:

	[
		{
			"name" : "XBMC",
			"file" : "\/Applications\/XBMC.app",
			"cmd"  : "open",
			"type" : "script" (optional)
		},
		...
	}
	
Grundlegend ist es ein Array von Objekten mit folgenden Eigenschaften:

* `name` Angezeigter Name
* `file` Pfad zur Anwendung.
* `cmd` Terminal Command zum starten, in der Regel `open`
* `type` Typ der Application. Wichtig im Moment nur bei Bash-Scripts die Eigenschaft `script`. In dem Fall wird das default icon "applet.png" verwendet.

Das Icon wird aus dem App-Bundle generiert.

###Tmp Ordner
Da die Anwendungsicons nicht jedes mal von neuem generiert werden sollen, werde diese in `./server/tmp` gecached. Dazu muss dieser Ordner existieren und von PHP beschreibbar sein.

##Usage
Bashscript starten, WebApp auf dem iPad aufrufen. Steuern.

##Requirements
* PHP >= 5.3
* [Composer](http://getcomposer.org)
* [sips](http://developer.apple.com/library/mac/#documentation/Darwin/Reference/ManPages/man1/sips.1.html) (Standardinstallation seit Mac OS 10.4)

##Dependencies/Libraries

###Mediakeys.py
Zur Steuerung von Play/Pause, Next Track, Prev Track etc. wird [mediakeys.py](https://gist.github.com/4078034) von [fredrikw](https://github.com/fredrikw) verwendet.
###CFPropertyList
[CFPropertyList](https://github.com/rodneyrehm/CFPropertyList) ist eine Library um die Info.plist Dateien der Anwendungen zu parsen von [Rodney Rehm](https://github.com/rodneyrehm)
###Ratchet
[Ratchet](http://socketo.me) ist eine Library die mir die Arbeit abnimmt einen Server zu implementieren, der sich um die Websocket-Verbindungen kümmert.
###Bootstrap
[Bootstrap](http://twitter.github.com/bootstrap/) von Twitter erleichtert mir die UI der Webapp.

###WebApp Icon
Das Icon der Webapp kommt von [CE0311](http://ce0311.deviantart.com/art/Aluminium-MacBook-Pro-OSX-106036633)

##Screenshots
![iPad](https://github.com/kanedo/AppStart/blob/master/screenshots/screenshot-ipad.PNG "iPad")  
iPad Webapp. Dafür wurde die Software entwickelt.  
![iPhone](https://github.com/kanedo/AppStart/blob/master/screenshots/screenshot-iphone.PNG "iPhone")  
Abfallprodukt ist, dass die Software auch auf dem iPhone funktioniert. 

##Fehler/Bugs/Verbesserungen
Wer etwas anzumerken hat, der schreibe doch bitte ein [github issue](https://github.com/kanedo/AppStart/issues) und wer es schnell gefixed wissen möchte und programmieren kann, der sendet mir bitte einen Pull-Request ;-) Das wäre ganz herzig!

##Known issues
Die Mediatasten funktionieren leider nur bei iTunes zuverlässig. Bei Spotify und anderen Musikanwendungen funktioniert aber in der Regel Play/Pause. Es ist oft hilfreich, dass Programm vorher noch einmal nach vorn zu holen, damit es sich die Mediakeys "schnappt". Das schafft man durch erneutes "starten" der App.