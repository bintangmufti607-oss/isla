// Arah kiblat dan visualisasi lintasan Matahari.

const KAABA = { latitude: 21.4225, longitude: 39.8262 };
const toRadians = degrees => degrees * Math.PI / 180;
const toDegrees = radians => radians * 180 / Math.PI;
const normalizeDegrees = degrees => (degrees % 360 + 360) % 360;

function calculateQibla(latitude, longitude) {
    const latitudeRad = toRadians(latitude);
    const longitudeRad = toRadians(longitude);
    const kaabaLatitudeRad = toRadians(KAABA.latitude);
    const longitudeDifference = toRadians(KAABA.longitude) - longitudeRad;

    const eastWest = Math.sin(longitudeDifference);
    const northSouth = Math.cos(latitudeRad) * Math.tan(kaabaLatitudeRad)
        - Math.sin(latitudeRad) * Math.cos(longitudeDifference);

    return normalizeDegrees(toDegrees(Math.atan2(eastWest, northSouth)));
}

function drawSolarPath(latitude, declination, transitHour) {
    const path = document.getElementById('solar-curve');
    const points = [];

    for (let hour = 0; hour <= 24; hour += 0.5) {
        const hourAngle = toRadians((hour - transitHour) * 15);
        const altitude = toDegrees(Math.asin(
            Math.sin(toRadians(latitude)) * Math.sin(toRadians(declination))
            + Math.cos(toRadians(latitude)) * Math.cos(toRadians(declination)) * Math.cos(hourAngle)
        ));
        points.push(`${hour / 24 * 500},${100 - altitude / 90 * 100}`);
    }

    path.setAttribute('d', `M ${points.join(' L ')}`);
}

window.calculateQibla = calculateQibla;
window.drawSolarPath = drawSolarPath;
