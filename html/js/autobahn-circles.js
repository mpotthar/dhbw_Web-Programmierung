document.addEventListener('DOMContentLoaded', function() {
    // Array mit den Daten für die verschiedenen Kreise
    // Jeder Kreis hat einen Wert, eine Einheit und eine Farbe
    const circles = [
        { value: 13210, unit: 'km', color: '#0dcaf0' },        // Gesamtlänge der Autobahnen
        { value: 120, unit: 'Stück', color: '#0dcaf0' },       // Anzahl der Autobahnen
        { value: 6000, unit: 'Mio. €', color: '#0dcaf0' },     // Jährliche Kosten
        { value: 171200, unit: 'Fzg/Tag', color: '#0dcaf0' }   // Durchschnittliche Fahrzeuge pro Tag
    ];

    // Für jeden Kreis im Array
    circles.forEach((circle, index) => {
        // Hole das Canvas-Element und seinen Kontext
        const canvas = document.querySelectorAll('.circle-progress canvas')[index];
        const ctx = canvas.getContext('2d');
        
        // Berechne den Mittelpunkt des Kreises
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 50;  // Radius des Kreises in Pixeln

        // Funktion zum Zeichnen eines Kreises mit Fortschrittsanzeige
        function drawCircle(percentage) {
            // Lösche vorherige Zeichnung
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Zeichne den grauen Hintergrundkreis
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#f0f0f0';
            ctx.lineWidth = 8;
            ctx.stroke();

            // Zeichne den farbigen Fortschrittskreis
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI / 2, (percentage * 2 * Math.PI) - Math.PI / 2);
            ctx.strokeStyle = circle.color;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';  // Runde Enden für schönere Optik
            ctx.stroke();

            // Aktualisiere den Zahlenwert in der Mitte
            const valueDisplay = canvas.nextElementSibling;
            const numberDisplay = valueDisplay.querySelector('.number');
            const currentValue = Math.round(circle.value * percentage);
            numberDisplay.textContent = currentValue.toLocaleString();
        }

        // Initialisierung der Animation
        let currentPercentage = 0;
        const animationDuration = 1250;  // Animation dauert 1,25 Sekunden
        const startTime = performance.now();

        // Animationsfunktion
        function animate(currentTime) {
            // Berechne vergangene Zeit seit Animationsstart
            const elapsed = currentTime - startTime;
            currentPercentage = Math.min(elapsed / animationDuration, 1);

            // Zeichne den aktuellen Zustand
            drawCircle(currentPercentage);

            // Wenn Animation noch nicht fertig, nächsten Frame anfordern
            if (currentPercentage < 1) {
                requestAnimationFrame(animate);
            }
        }

        // Starte die Animation
        requestAnimationFrame(animate);
    });
});