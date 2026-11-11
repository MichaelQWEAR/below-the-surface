let feedBase = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/";
let hourMs = 60 * 60 * 1000;

let period = document.getElementById("period");
let magnitudeFilter = document.getElementById("magnitudeFilter");
let refreshBtn = document.getElementById("refreshBtn");
let updatedTime = document.getElementById("updatedTime");
let eventCount = document.getElementById("eventCount");
let largestMagnitude = document.getElementById("largestMagnitude");
let deepestEvent = document.getElementById("deepestEvent");
let timeStart = document.getElementById("timeStart");
let timeMiddle = document.getElementById("timeMiddle");
let depthAxis = document.getElementById("depthAxis");
let gridLines = document.getElementById("gridLines");
let points = document.getElementById("points");
let plotMessage = document.getElementById("plotMessage");
let detailMagnitude = document.getElementById("detailMagnitude");
let magnitudeType = document.getElementById("magnitudeType");
let eventPlace = document.getElementById("eventPlace");
let eventDepth = document.getElementById("eventDepth");
let eventTime = document.getElementById("eventTime");
let eventStatus = document.getElementById("eventStatus");
let eventLink = document.getElementById("eventLink");
let olderBtn = document.getElementById("olderBtn");
let newerBtn = document.getElementById("newerBtn");
let eventPosition = document.getElementById("eventPosition");
let quakeSound = document.getElementById("quakeSound");

let allQuakes = [];
let visibleQuakes = [];
let pointButtons = [];
let selectedIndex = -1;
let startTime = 0;
let endTime = 0;
let bottomDepth = 100;

function timeLabel(time) {
    return new Date(time).toLocaleString();
}

function depthLabel(depth) {
    return depth.toFixed(1) + " km";
}

function positionPercent(value, start, end) {
    return (value - start) / (end - start) * 100;
}

function readFeed(data) {
    endTime = data.metadata.generated;
    if (period.value === "day") {
        startTime = endTime - 24 * hourMs;
    } else {
        startTime = endTime - 7 * 24 * hourMs;
    }

    allQuakes = [];
    let deepest = 0;
    for (let i = data.features.length - 1; i >= 0; i--) {
        let quake = data.features[i];
        if (quake.properties.mag !== null && quake.properties.time >= startTime) {
            allQuakes.push(quake);
            deepest = Math.max(deepest, quake.geometry.coordinates[2]);
        }
    }

    bottomDepth = Math.max(100, Math.ceil(deepest / 100) * 100);
}

function drawDepthScale() {
    gridLines.innerHTML = "";
    depthAxis.innerHTML = "";
    for (let i = 0; i <= 4; i++) {
        let position = i * 25 + "%";

        let line = document.createElement("div");
        line.className = "grid-line";
        line.style.top = position;
        gridLines.appendChild(line);

        let label = document.createElement("span");
        label.className = "depth-tick";
        label.style.top = position;
        label.textContent = bottomDepth * i / 4;
        depthAxis.appendChild(label);
    }
}

function showDetails(quake) {
    if (quake === null) {
        detailMagnitude.textContent = "-";
        magnitudeType.textContent = "";
        eventPlace.textContent = "Choose an event in the field";
        eventDepth.textContent = "-";
        eventTime.textContent = "-";
        eventStatus.textContent = "-";
        eventLink.style.display = "none";
        return;
    }

    detailMagnitude.textContent = "M " + quake.properties.mag;
    magnitudeType.textContent = quake.properties.magType;
    eventPlace.textContent = quake.properties.place;
    eventDepth.textContent = depthLabel(quake.geometry.coordinates[2]);
    eventTime.textContent = timeLabel(quake.properties.time);
    eventStatus.textContent = quake.properties.status;
    eventLink.href = quake.properties.url;
    eventLink.style.display = "inline-block";
}

function depthClass(depth) {
    if (depth >= 300) {
        return "point deep";
    } else if (depth >= 70) {
        return "point middle";
    } else {
        return "point";
    }
}

function shakeClass(magnitude) {
    if (magnitude >= 6) {
        return "shake-large";
    } else if (magnitude >= 4.5) {
        return "shake-medium";
    } else {
        return "shake-small";
    }
}

function setPointClass(index, shaking) {
    let quake = visibleQuakes[index];
    let name = depthClass(quake.geometry.coordinates[2]);
    if (index === selectedIndex) {
        name = name + " selected";
    }
    if (shaking) {
        name = name + " " + shakeClass(quake.properties.mag);
    }
    pointButtons[index].className = name;
}

function selectQuake(index) {
    if (index === selectedIndex || index < 0 || index >= visibleQuakes.length) {
        return;
    }
    let previousIndex = selectedIndex;
    selectedIndex = index;
    if (previousIndex >= 0) {
        setPointClass(previousIndex, false);
    }
    setPointClass(index, false);

    showDetails(visibleQuakes[index]);
    eventPosition.textContent = (index + 1) + " of " + visibleQuakes.length;
    olderBtn.disabled = index === 0;
    newerBtn.disabled = index === visibleQuakes.length - 1;
}

function playRumble(magnitude) {
    quakeSound.currentTime = 0;
    quakeSound.volume = Math.min(0.8, magnitude / 10);
    quakeSound.playbackRate = Math.max(0.5, 1.5 - magnitude / 10);
    quakeSound.play();
}

function activateQuake(index) {
    if (index < 0 || index >= visibleQuakes.length) {
        return;
    }
    selectQuake(index);
    setPointClass(index, true);
    playRumble(visibleQuakes[index].properties.mag);
}

function drawPoint(quake, index) {
    let magnitude = quake.properties.mag;
    let depth = quake.geometry.coordinates[2];
    let diameter = 9 + 4 * magnitude;

    let point = document.createElement("button");
    point.title = "M " + magnitude + ", " + quake.properties.place + ", " + depthLabel(depth);
    point.style.left = positionPercent(quake.properties.time, startTime, endTime) + "%";
    point.style.top = positionPercent(depth, 0, bottomDepth) + "%";
    point.style.width = diameter + "px";
    point.style.height = diameter + "px";

    point.addEventListener("animationend", function () {
        setPointClass(index, false);
    });
    point.addEventListener("click", function () {
        activateQuake(index);
    });

    points.appendChild(point);
    pointButtons.push(point);
    setPointClass(index, true);
}

function clearField() {
    selectedIndex = -1;
    pointButtons = [];
    visibleQuakes = [];
    points.innerHTML = "";
    showDetails(null);
    eventPosition.textContent = "-";
    olderBtn.disabled = true;
    newerBtn.disabled = true;
    largestMagnitude.textContent = "-";
    deepestEvent.textContent = "-";
}

function drawField() {
    clearField();
    drawDepthScale();

    let threshold = Number(magnitudeFilter.value);
    let maxMagnitude = 0;
    let maxDepth = 0;
    for (let i = 0; i < allQuakes.length; i++) {
        let quake = allQuakes[i];
        if (quake.properties.mag >= threshold) {
            let index = visibleQuakes.length;
            maxMagnitude = Math.max(maxMagnitude, quake.properties.mag);
            maxDepth = Math.max(maxDepth, quake.geometry.coordinates[2]);
            visibleQuakes.push(quake);
            drawPoint(quake, index);
        }
    }

    let count = visibleQuakes.length;
    eventCount.textContent = count;
    if (count === 0) {
        plotMessage.style.display = "block";
        plotMessage.textContent = "No earthquakes match this time window and magnitude filter.";
        return;
    }
    plotMessage.style.display = "none";
    largestMagnitude.textContent = "M " + maxMagnitude;
    deepestEvent.textContent = depthLabel(maxDepth);
    selectQuake(count - 1);
}

async function loadFeed() {
    let feedFile = "2.5_day.geojson";
    if (period.value === "day") {
        timeStart.textContent = "24 h ago";
        timeMiddle.textContent = "12 h ago";
    } else {
        feedFile = "2.5_week.geojson";
        timeStart.textContent = "7 d ago";
        timeMiddle.textContent = "3.5 d ago";
    }

    refreshBtn.disabled = true;
    plotMessage.style.display = "block";
    plotMessage.textContent = "Loading the earthquake field...";

    try {
        const response = await fetch(feedBase + feedFile);
        if (!response.ok) {
            throw new Error("Request failed");
        }
        const data = await response.json();
        console.log(data);

        readFeed(data);
        updatedTime.textContent = "Updated " + timeLabel(endTime);
        drawField();
    } catch (error) {
        console.error("Error:", error);
        plotMessage.style.display = "block";
        plotMessage.textContent = "Could not load the USGS feed. Try Refresh feed again.";
    }
    refreshBtn.disabled = false;
}

olderBtn.addEventListener("click", function () {
    selectQuake(selectedIndex - 1);
});

newerBtn.addEventListener("click", function () {
    selectQuake(selectedIndex + 1);
});

document.addEventListener("keydown", function (event) {
    if (visibleQuakes.length === 0) {
        return;
    }
    if (event.key === "ArrowLeft") {
        activateQuake(selectedIndex - 1);
    } else if (event.key === "ArrowRight") {
        activateQuake(selectedIndex + 1);
    } else {
        return;
    }
    event.preventDefault();
});

period.addEventListener("change", loadFeed);
magnitudeFilter.addEventListener("change", drawField);
refreshBtn.addEventListener("click", loadFeed);

loadFeed();
