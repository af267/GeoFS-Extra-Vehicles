// ==UserScript==
// @name         GeoFS Extra Vehicles
// @version      1.0
// @description  Adds extra vehicles to GeoFS
// @author       AF267
// @match        https://geo-fs.com/geofs.php*
// @match        https://*.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    console.log("Extras script running...");

    const aircraftButton = document.querySelector('button[data-toggle-panel=".geofs-aircraft-list"]');
    if (!aircraftButton) {
        console.warn("Aircraft button not found.");
        return;
    }

    // Create Extras button
    const extrasButton = aircraftButton.cloneNode(true);
    extrasButton.textContent = "Extras";
    extrasButton.removeAttribute("data-toggle-panel");
    extrasButton.setAttribute("data-toggle-panel", ".geofs-extras-list");
    extrasButton.id = "extras-button";
    aircraftButton.parentNode.insertBefore(extrasButton, aircraftButton);

    // Create Extras panel
    const extrasPanel = document.createElement("ul");
    extrasPanel.className = "geofs-list geofs-extras-list geofs-toggle-panel";
    extrasPanel.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; padding-left: 20px;">
            <img src="https://raw.githubusercontent.com/af267/GeoFS-Extra-Vehicles/refs/heads/main/JXT%20Logo.png" style="width: 100px; height: auto;" />
            <h4 style="margin: 0;">GeoFS Extra Vehicles</h4>
        </div>
        <li class="geofs-list-collapsible-item">
            Aircraft
            <ul class="geofs-collapsible">
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/md11_380019_5369/">McDonnell Douglas MD-11 (ADSB)</li>
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/c25a_380019_5367/">Cessna Citation CJ2 (ADSB)</li>
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/heli_380019_5371/">Eurocopter AS365 Dauphin (ADSB)</li>
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/e190_380019_5372/">Embraer E190 (ADSB)</li>
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/A160_267286_3007/">Paramotor (by AF267)</li>
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/P180Y_267286_3557/">Starship SN5 (by AF267)</li>
            </ul>
        </li>
        <li class="geofs-list-collapsible-item">
            Ground Vehicles
            <ul class="geofs-collapsible">
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/truck_380019_5368/">Food Service Truck (ADSB)</li>
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/NeoAD XTerra_267286_4894/">XTerra SUV (2024 APRIL FOOLS) (by AF267)</li>
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/Steelbird Sagittarius Pulsar_267286_5155/">Sagittarius Hypercar (2025 APRIL FOOLS) (by AF267)</li>
            </ul>
        </li>
        <li class="geofs-list-collapsible-item">
            Miscellaneous
            <ul class="geofs-collapsible">
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/CMV Probability_267286_5009/">CMV Probability Megayacht (2025 APRIL FOOLS) (by AF267)</li>
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/X2000BWB_267286_2329/">Northtech RADIO (2025 APRIL FOOLS) (by AF267)</li>
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/Northtech UTOPIA_267286_4136/">Northtech UTOPIA (by AF267)</li>
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/ARCHANGEL_267286_3974/">Northtech ARCHANGEL (2023 APRIL FOOLS) (by AF267)</li>
                <li data-url="https://www.geo-fs.com/backend/aircraft/repository/Proximus Hovercraft_267286_4644/">Proximus Hovercraft (by AF267)</li>
            </ul>
        </li>
        <li class="geofs-list-collapsible-item">
            About
            <ul class="geofs-collapsible">
                <a href="https://github.com/af267/GeoFS-Extra-Vehicles" target="_blank" rel="nofollow"><h4>Current Version: 1.0</h4></a>
                <p>GeoFS Extra Vehicles is a privately maintained addon not associated with GeoFS.</p>
                <p>GeoFS Extra Vehicles is an addon developed by AF267 that adds external vehicles from JAaMDG's JXT Group as well as unreleased projects into the simulator. Multiplayer models are not supported.</p>
                <p>If you have any questions or if you have an aircraft (must have a working aircraft.json) you would like to add, visit the JAaMDG Discord</p>
                <a href="https://discord.gg/fcFQH6Qhb7" target="_blank" rel="nofollow"><img src="https://www.geo-fs.com/images/discord.png" style="margin: 10px 10px 10px 0px;"/></a>
                <br/>
                <p/>
                <p>Copyright © AF267 - 2025</p>
            </ul>
        </li>
    `;

    const aircraftPanel = document.querySelector(".geofs-aircraft-list");
    if (aircraftPanel && aircraftPanel.parentNode) {
        aircraftPanel.parentNode.insertBefore(extrasPanel, aircraftPanel.nextSibling);
    }

    // Main loader function using your working approach
    function loadAircraftFromUrl(baseUrl) {
        $.ajax(baseUrl + "aircraft.json", {
            dataType: "text",
            success: function (jsonText) {
                var customRecord = {
                    id: "custom_" + Date.now(),
                    name: "Custom Aircraft",
                    fullPath: baseUrl,
                    isPremium: false,
                    isCommunity: false,
                    definition: btoa(jsonText),
                    multiplayerFiles: [
                        baseUrl + "multiplayer.glb",
                        baseUrl + "multiplayer-low.glb"
                    ]
                };

                var parsedDefinition = geofs.aircraft.instance.parseRecord(JSON.stringify(customRecord));

                if (parsedDefinition) {
                    geofs.aircraft.instance.unloadAircraft();
                    geofs.aircraft.instance.id = customRecord.id;
                    geofs.aircraft.instance.fullPath = customRecord.fullPath;
                    geofs.aircraft.instance.aircraftRecord = customRecord;
                    geofs.aircraft.instance.init(parsedDefinition, geofs.aircraft.instance.getCurrentCoordinates());

                } else {
                    ui.notification.show("Failed to parse aircraft.json");
                }
            },
            error: function () {
                ui.notification.show("Could not load aircraft.json");
            }
        });
    }

    // Attach click handlers to the aircraft elements
    extrasPanel.addEventListener("click", function (e) {
        const li = e.target.closest("li[data-url]");
        if (li) {
            const url = li.getAttribute("data-url");
            loadAircraftFromUrl(url);
        }
    });

})();
