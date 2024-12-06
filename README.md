# Web-Programmierung

Ein Webprojekt zur Visualisierung von Autobahn-Daten mittels der Autobahn API.

## Projektbeschreibung
Diese Website wurde im Rahmen der Vorlesung Web-Programmierung entwickelt und nutzt die offizielle Autobahn API des Bundes zur Darstellung von Verkehrsinformationen.

Folgende Informationen werden auf der Webseite bereitgestellt:
- Baustellenanzeige auf interaktiven Karten
- Aktuelle Zahlen zur Autobahn
- Informationen zum Projekt

## Live-Version
Sie können eine Version dieses Projekts unter folgender URL abrufen:
```
https://autobahn-informationsportal.projects.pottharst.dev/
```

## Anforderungen
- Website mit Navigation zu mindestens 3 Unterseiten
- Verwendung von Bootstrap und JavaScript
- Integration einer öffentlichen API mit mindestens zwei Endpoints
- Responsive Layout
- Sauberer, dokumentierter Code
- Strukturierte Darstellung der API-Daten

## Technologien
- Bootstrap
- JavaScript
- Autobahn API

## Systemanforderungen
### Server
Webserver (beispielsweise):
- Apache HTTP Server
- Nginx
- Microsoft IIS

### Client
- Moderner Webbrowser (Chrome, Firefox, Safari, Edge)
- JavaScript muss aktiviert sein
- Internetverbindung für:
  - Abruf der Bootstrap Framework-Dateien (CSS/JS)
  - Kommunikation mit der Autobahn API

### Netzwerk
- Ausgehende HTTPS-Verbindungen müssen erlaubt sein
- Keine speziellen Ports oder Firewall-Regeln erforderlich
- Keine Authentifizierung für API-Zugriffe notwendig

## Installation
1. Laden Sie alle Projektdateien herunter
2. Kopieren Sie die Inhalte des html-Ordners in das HTML-Verzeichnis Ihres Webservers:
```bash
  /var/www/html/        # Linux (Apache)
  c:\inetpub\wwwroot\   # Windows (IIS)
```
3. Stellen Sie sicher, dass folgende Dateien im Wurzelverzeichnis des Webservers liegen:
```bash
.
├── about.html
├── autobahn.html
├── css
│   └── styles.css
├── img
│   ├── background_l.jpg
│   ├── background_m.jpg
│   ├── background_n.jpg
│   ├── icon_black.png
│   └── icon_white.png
├── index.html
├── js
│   ├── api-roadworks.js
│   └── autobahn-circles.js
└── roadworks.html
```
4. Öffnen Sie die Webseite über Ihren Webbrowser:
```bash
  http://localhost/
  http://ihre-domain.de/
```

## API-Integration
Die Website verwendet die offizielle Autobahn API. Weitere Details zur API-Nutzung finden Sie auf der About-Seite des Projekts. 
Eine Dokumentation zur API finden Sie [hier](https://autobahn.api.bund.dev/).
