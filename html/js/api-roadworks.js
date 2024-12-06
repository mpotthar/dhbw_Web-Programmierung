document.addEventListener('DOMContentLoaded', function() {
    // Initialisierung der Leaflet-Karte, setze auf Mittelpunkt Deutschlands
    const map = L.map('map').setView([51.59056, 10.10611], 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Holt die HTML-Elemente mit den IDs und weist sie den Konstanten zu.
    const autobahnSelect = document.getElementById('autobahnSelect');
    const baustellenContainer = document.getElementById('baustellenContainer');
    const noBaustellenWarning = document.getElementById('noBaustellenWarning');

    // Layer-Gruppen für Baustellen-Marker und Autobahn-Polyline erstellen
    let baustellenMarkers = L.layerGroup().addTo(map);
    let autobahnPolyline;

    // Funktion zum Abrufen von URL-Parametern
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Funktion zum Aktualisieren der URL
    // Fügt den ausgewählten Autobahn-Parameter zur URL hinzu
    function updateUrl(autobahn) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('autobahn', autobahn);
        window.history.pushState({path: newUrl.href}, '', newUrl.href);
    }

    // Abrufen der Autobahn-Daten und Befüllen des Dropdown-Menüs
    fetch('https://verkehr.autobahn.de/o/autobahn/')
        .then(response => response.json())
        .then(data => {
            // Befüllen des Dropdown-Menüs mit den Autobahn-Optionen
            // ForEach-Schleife läuft über die Autobahnen und fügt diese iterativ als Optionen hinzu
            data.roads.forEach(road => {
                const option = document.createElement('option');
                option.value = road;
                option.textContent = road;
                autobahnSelect.appendChild(option);
            });

            // Prüfen, ob eine Autobahn in der URL angegeben ist
            // Wenn ja, die Autobahn-Daten laden
            // Andernfalls die Autobahn-Auswahl überprüfen
            const urlAutobahn = getUrlParameter('autobahn');
            if (urlAutobahn) {
                autobahnSelect.value = urlAutobahn;
                loadAutobahnData(urlAutobahn);
            } else {
                checkAutobahnSelection();
            }
        });

    // Event-Listener für Auswahländerungen im Autobahn-Dropdown
    // Stellt sicher, dass die Autobahn-Daten neu geladen werden, wenn eine andere Autobahn ausgewählt wird
    autobahnSelect.addEventListener('change', (event) => {
        const selectedAutobahn = event.target.value;
        if (selectedAutobahn) {
            updateUrl(selectedAutobahn);
            loadAutobahnData(selectedAutobahn);
        } else {
            checkAutobahnSelection();
        }
    });

    // Funktion zum Laden der Autobahn-Daten und Baustellen
    function loadAutobahnData(selectedAutobahn) {
        // Verbirgt den Hinweistext "Autobahn auswählen"
        document.getElementById('selectAutobahnInfo').style.display = 'none';

        // Bestehende Marker und Polylines entfernen
        baustellenMarkers.clearLayers();
        if (autobahnPolyline) {
            map.removeLayer(autobahnPolyline);
        }

        // Leeren des Baustellen-Containers
        baustellenContainer.innerHTML = '';

        // Ladeanzeige hinzufügen
        const loadingIndicator = document.createElement('div');
        loadingIndicator.textContent = 'Lade Daten...';
        loadingIndicator.id = 'loadingIndicator';
        baustellenContainer.appendChild(loadingIndicator);

        // Abrufen der Autobahn- und Baustellen-Daten
        Promise.all([
            fetch(`https://verkehr.autobahn.de/o/autobahn/`).then(response => response.json()),
            fetch(`https://verkehr.autobahn.de/o/autobahn/${selectedAutobahn}/services/roadworks`).then(response => response.json())
        ]).then(([autobahnData, roadworksData]) => {
            // Ladeanzeige entfernen
            document.getElementById('loadingIndicator').remove();

            const bounds = L.latLngBounds();

            // Verarbeiten der Baustellen-Daten
            if (roadworksData.roadworks && roadworksData.roadworks.length > 0) {
                noBaustellenWarning.style.display = 'none';
                roadworksData.roadworks.forEach((roadwork, index) => {
                    // Erstellen und Hinzufügen der Baustellen-Karte für
                    // jede Baustelle im Baustellen-Container
                    const card = createBaustelleCard(roadwork, selectedAutobahn, index);
                    baustellenContainer.appendChild(card);

                    // Hinzufügen des Baustellen-Markers zur Hauptkarte
                    const lat = roadwork.coordinate.lat;
                    const long = roadwork.coordinate.long;
                    if (lat && long) {
                        L.marker([lat, long]).addTo(baustellenMarkers)
                            .bindPopup(`<strong><i class="bi bi-cone-striped"></i>&nbsp;${selectedAutobahn}: ${roadwork.subtitle || 'Keine Angabe'}</strong><br><strong>Abschnitt:</strong> ${roadwork.impact?.upper || 'N/A'} - ${roadwork.impact?.lower || 'N/A'}`);
                        bounds.extend([lat, long]);
                    }

                    // Erstellen der individuellen Baustellen-Karte
                    setTimeout(() => {
                        createBaustelleMap(roadwork, index);
                    }, 100);
                });
            } else {
                // Anzeigen der Warnung, wenn keine Baustellen vorhanden sind
                noBaustellenWarning.style.display = 'block';
            }

            // Anpassen des Kartenausschnitts
            if (bounds.isValid()) {
                map.fitBounds(bounds, {padding: [35, 35]});
            } else {
                map.setView([51.1657, 10.4515], 6);
            }
        });
    }

    // Funktion zum Erstellen einer Baustellen-Karte (Bootstrap Card)
    function createBaustelleCard(roadwork, selectedAutobahn, index) {
        // Erstellen der Baustellen-Card
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-2';
        // Wandelt das description-Array in einen String mit Zeilenumbrüchen um
        const description = roadwork.description.join('\n').replace(/\n/g, '<br>');
        // Einzelne Baustellen-Card mit Modal für Details erstellen
        card.innerHTML = `
            <div class="card h-100 d-flex flex-column shadow-sm">
                <div class="card-header p-0">
                    <div id="map-${index}" class="card-img-top card-map" style="height: 200px; width: 100%;"></div> 
                </div>
                <div class="card-body d-flex flex-column p-0">
                    <h5 class="card-title mb-0 px-3 pt-3 pb-2">${selectedAutobahn}: ${roadwork.subtitle || 'Keine Angabe'}</h5>
                    <p class="card-text px-3 pt-2">
                        <strong>Abschnitt:</strong> ${roadwork.impact?.upper || 'N/A'} - ${roadwork.impact?.lower || 'N/A'}
                    </p>
                    <div class="mt-auto p-0">
                        <button class="btn btn-info w-100" style="border-top-left-radius: 0; border-top-right-radius: 0;" data-bs-toggle="modal" data-bs-target="#detailModal-${index}">
                            Baustellendetails
                        </button>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="detailModal-${index}" tabindex="-1" aria-labelledby="detailModalLabel-${index}" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="detailModalLabel-${index}"><i class="bi bi-cone-striped"></i>&nbsp;Baustellendetails</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <h5><strong>${selectedAutobahn}: ${roadwork.subtitle || roadwork.title}</strong></h5>
                            <p><strong>Abschnitt:</strong><br /> ${roadwork.impact?.upper || 'N/A'} - ${roadwork.impact?.lower || 'N/A'}</p>
                            <p><strong>Beschreibung:</strong><br /> ${description}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // Rückgabe der erstellten Baustellen-Card
        return card;
    }

    // Funktion zum Erstellen einer individuellen Baustellen-Karte (Leaflet Map in Bootstrap Card)
    function createBaustelleMap(roadwork, index) {
        const lat = roadwork.coordinate.lat;
        const long = roadwork.coordinate.long;
        if (lat && long) {
            // Erstellen der Leaflet-Karte für die Baustelle
            const roadworkMap = L.map(`map-${index}`);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(roadworkMap);

            // Hinzufügen des Markers für die Baustelle
            const marker = L.marker([lat, long]).addTo(roadworkMap);

            // Zeichnen der Baustellen-Geometrie, falls vorhanden
            if (roadwork.geometry && roadwork.geometry.coordinates) {
                const coordinates = roadwork.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                const polyline = L.polyline(coordinates, {color: 'red', weight: 5}).addTo(roadworkMap);
                const bounds = polyline.getBounds();
                roadworkMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 13});
            } else {
                roadworkMap.setView([lat, long], 10);
            }

            // Aktualisieren der Kartengröße
            // (Leaflet-Karten in Bootstrap Cards benötigen eine manuelle Größenanpassung)
            roadworkMap.invalidateSize();
        } else {
            // Fehlerbehandlung für ungültige Koordinaten
            console.error(`Ungültige Koordinaten für Baustelle ${index}`);
            document.getElementById(`map-${index}`).innerHTML = 'Keine Karteninformationen verfügbar';
        }
    }

    // Funktion zum Überprüfen der Autobahn-Auswahl
    // Wird aufgerufen, wenn sich die Auswahl im Dropdown-Menü ändert
    function checkAutobahnSelection() {
        const selectAutobahnInfo = document.getElementById('selectAutobahnInfo');
        const selectedAutobahn = autobahnSelect.value;
        if (!selectedAutobahn) {
            selectAutobahnInfo.style.display = 'block';
            noBaustellenWarning.style.display = 'none';
            baustellenContainer.innerHTML = '';
            if (autobahnPolyline) {
                map.removeLayer(autobahnPolyline);
            }
            baustellenMarkers.clearLayers();
            map.setView([51.59056, 10.10611], 6);
        } else {
            selectAutobahnInfo.style.display = 'none';
        }
    }
    checkAutobahnSelection();
});
