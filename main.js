// ==UserScript==
// @name         GeoFS Extra Vehicles
// @version      1.1
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

    const DATA_URL = "https://raw.githubusercontent.com/af267/GeoFS-Extra-Vehicles/refs/heads/main/vehicles.json";

    const aircraftButton = document.querySelector('button[data-toggle-panel=".geofs-aircraft-list"]');
    if (!aircraftButton) {
        console.warn("Aircraft button not found.");
        return;
    }

    const extrasButton = aircraftButton.cloneNode(true);
    extrasButton.textContent = "Extras";
    extrasButton.removeAttribute("data-toggle-panel");
    extrasButton.setAttribute("data-toggle-panel", ".geofs-extras-list");
    extrasButton.id = "extras-button";
    aircraftButton.parentNode.insertBefore(extrasButton, aircraftButton);

    const extrasPanel = document.createElement("ul");
    extrasPanel.className = "geofs-list geofs-extras-list geofs-toggle-panel";

    // create div, temporary header only
    extrasPanel.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; padding-left: 20px;">
            <img src="https://raw.githubusercontent.com/af267/GeoFS-Extra-Vehicles/refs/heads/main/JXT%20Logo.png" style="width: 100px; height: auto;" />
            <h4 style="margin: 0;">GeoFS Extra Vehicles</h4>
        </div>
    `;

    const aircraftPanel = document.querySelector(".geofs-aircraft-list");
    if (aircraftPanel && aircraftPanel.parentNode) {
        aircraftPanel.parentNode.insertBefore(extrasPanel, aircraftPanel.nextSibling);
    }

    function createCategorySection(title, items) {
        const category = document.createElement("li");
        category.className = "geofs-list-collapsible-item";
        category.textContent = title;

        const sublist = document.createElement("ul");
        sublist.className = "geofs-collapsible";

        items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.name;
            li.setAttribute("data-url", item.url);
            li.setAttribute("data-mpid", item.id);
            sublist.appendChild(li);
        });

        category.appendChild(sublist);
        return category;
    }

    // add about section to the end
    function appendAboutSection() {
        const aboutSection = document.createElement("li");
        aboutSection.className = "geofs-list-collapsible-item";
        aboutSection.textContent = "About";

        const aboutContent = document.createElement("ul");
        aboutContent.className = "geofs-collapsible";
        aboutContent.innerHTML = `
            <a href="https://github.com/af267/GeoFS-Extra-Vehicles" target="_blank" rel="nofollow"><h4>Current Version: 1.1</h4></a>
            <p>GeoFS Extra Vehicles is a privately maintained addon not associated with GeoFS.</p>
            <p>GeoFS Extra Vehicles is an addon developed by AF267 that adds external vehicles from JAaMDG's JXT Group as well as unreleased projects into the simulator. Multiplayer models are supported with some aircraft.</p>
            <p>If you have any questions or if you have an aircraft (must have a working aircraft.json) you would like to add, visit the JAaMDG Discord</p>
            <a href="https://discord.gg/fcFQH6Qhb7" target="_blank" rel="nofollow"><img src="https://www.geo-fs.com/images/discord.png" style="margin: 10px 10px 10px 0px;"/></a>
            <p>Copyright © AF267 - 2025</p>
        `;
        aboutSection.appendChild(aboutContent);
        extrasPanel.appendChild(aboutSection);
    }

    function loadAircraftFromUrl(baseUrl, mpID) {
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
                    customRecord.id = mpID;
                    geofs.aircraft.instance.id = mpID;
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

    extrasPanel.addEventListener("click", function (e) {
        const li = e.target.closest("li[data-url]");
        if (li) {
            const url = li.getAttribute("data-url");
            const mpID = li.getAttribute("data-mpid");
            loadAircraftFromUrl(url, mpID);
        }
    });

    fetch(DATA_URL)
        .then(response => response.json())
        .then(data => {
            for (const [category, items] of Object.entries(data)) {
                const section = createCategorySection(category, items);
                extrasPanel.appendChild(section);
            }
            appendAboutSection();
        })
        .catch(error => {
            console.error("Error loading vehicle data:", error);

            // emergency purposes backup
            extrasPanel.innerHTML += `
                <div style="display: flex; align-items: center; gap: 10px; padding-left: 20px;">
                    <img src="https://raw.githubusercontent.com/af267/GeoFS-Extra-Vehicles/refs/heads/main/JXT%20Logo.png" style="width: 100px; height: auto;" />
                    <h4 style="margin: 0;">GeoFS Extra Vehicles</h4>
                    <p>Error: Too many requests to GitHub. Could not load latest JSON data. Last updated vehicles:
                </div>
                <li class="geofs-list-collapsible-item">
                    Aircraft
                    <ul class="geofs-collapsible">
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/md11_380019_5369/" data-mpid="1023">McDonnell Douglas MD-11 (ADSB)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/c25a_380019_5367/" data-mpid="1021">Cessna Citation CJ2 (ADSB)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/heli_380019_5371/" data-mpid="1025">Eurocopter AS365 Dauphin (ADSB)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/e190_380019_5372/" data-mpid="1018">Embraer E190 (ADSB)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/A160_267286_3007/" data-mpid="50">Paramotor (by AF267)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/P180Y_267286_3557/" data-mpid="2000">Starship SN5 (by AF267)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/Piper%20XCub_380019_3226/" data-mpid="1">Piper PA-18 Super Cub (GeoFS)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/Cessna%20Skymaster%20(Nightheart/Kitten-cat)_380019_4792/" data-mpID="2">Cessna 337 Super Skymaster (by Nightheart)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/Hang%20Glider%20Belgium_380019_3111/" data-mpid="50">Hang Glider Belgium (by Johani)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/Sikorsky UH-60 Black Hawk_380019_3068/" data-mpid="2806">Sikorsky UH-60 Black Hawk (by Spice_9)</li>
                    </ul>
                </li>
                <li class="geofs-list-collapsible-item">
                    Ground Vehicles
                    <ul class="geofs-collapsible">
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/truck_380019_5368/" data-mpid="1027">Food Service Truck (ADSB)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/NeoAD XTerra_267286_4894/" data-mpid="1027">XTerra SUV (2024 APRIL FOOLS) (by AF267)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/Steelbird Sagittarius Pulsar_267286_5155/" data-mpid="102">Sagittarius Hypercar (2025 APRIL FOOLS) (by AF267)</li>
                    </ul>
                </li>
                <li class="geofs-list-collapsible-item">
                    Miscellaneous
                    <ul class="geofs-collapsible">
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/CMV Probability_267286_5009/" data-mpid="2000">CMV Probability Megayacht (2025 APRIL FOOLS) (by AF267)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/X2000BWB_267286_2329/" data-mpid="2000">Northtech RADIO (2025 APRIL FOOLS) (by AF267)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/Northtech UTOPIA_267286_4136/" data-mpid="2000">Northtech UTOPIA (by AF267)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/ARCHANGEL_267286_3974/" data-mpid="2000">Northtech ARCHANGEL (2023 APRIL FOOLS) (by AF267)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/Proximus Hovercraft_267286_4644/" data-mpid="2000">Proximus Hovercraft (by AF267)</li>
                        <li data-url="https://www.geo-fs.com/backend/aircraft/repository/WK2 testbed_267286_2783/" data-mpid="5193">Boeing 747x (2025 APRIL FOOLS) (by AF267)</li>
                    </ul>
                </li>
                <li class="geofs-list-collapsible-item">
                    About
                    <ul class="geofs-collapsible">
                        <a href="https://github.com/af267/GeoFS-Extra-Vehicles" target="_blank" rel="nofollow"><h4>Current Version: 1.1</h4></a>
                        <p>GeoFS Extra Vehicles is a privately maintained addon not associated with GeoFS.</p>
                        <p>GeoFS Extra Vehicles is an addon developed by AF267 that adds external vehicles from JAaMDG's JXT Group as well as unreleased projects into the simulator. Multiplayer models are supported with some aircraft.</p>
                        <p>If you have any questions or if you have an aircraft (must have a working aircraft.json) you would like to add, visit the JAaMDG Discord</p>
                        <a href="https://discord.gg/fcFQH6Qhb7" target="_blank" rel="nofollow"><img src="https://www.geo-fs.com/images/discord.png" style="margin: 10px 10px 10px 0px;"/></a>
                        <br/>
                        <p/>
                        <p>Copyright © AF267 - 2025</p>
                    </ul>
                </li>
            `;
        });

})();
