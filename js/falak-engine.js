// Inti astronomi Jean Meeus: koordinat Matahari dan persamaan waktu.

const radians = degrees => degrees * Math.PI / 180;
const degrees = radiansValue => radiansValue * 180 / Math.PI;
const normalize = value => (value % 360 + 360) % 360;

function getSolarCoordinatesMeeus(julianDay, deltaTSeconds) {
    const centuries = (julianDay + deltaTSeconds / 86_400 - 2_451_545) / 36_525;
    const meanLongitude = normalize(280.46646 + 36000.76983 * centuries + 0.0003032 * centuries ** 2);
    const meanAnomaly = normalize(357.52911 + 35999.05029 * centuries - 0.0001537 * centuries ** 2);
    const eccentricity = 0.016708634 - 0.000042037 * centuries - 0.0000001267 * centuries ** 2;
    const equationCenter = (1.914602 - 0.004817 * centuries - 0.000014 * centuries ** 2) * Math.sin(radians(meanAnomaly))
        + (0.019993 - 0.000101 * centuries) * Math.sin(radians(2 * meanAnomaly))
        + 0.000289 * Math.sin(radians(3 * meanAnomaly));
    const obliquityBase = 23.439291 - 0.013004167 * centuries - 0.00000016399 * centuries ** 2 + 0.0000005036 * centuries ** 3;
    const omega = 125.04 - 1934.136 * centuries;
    const apparentLongitude = meanLongitude + equationCenter - 0.00569 - 0.00478 * Math.sin(radians(omega));
    const obliquity = obliquityBase + 0.00256 * Math.cos(radians(omega));
    const declination = degrees(Math.asin(Math.sin(radians(obliquity)) * Math.sin(radians(apparentLongitude))));
    const y = Math.tan(radians(obliquity) / 2) ** 2;
    const equationOfTime = y * Math.sin(2 * radians(meanLongitude))
        - 2 * eccentricity * Math.sin(radians(meanAnomaly))
        + 4 * eccentricity * y * Math.sin(radians(meanAnomaly)) * Math.cos(2 * radians(meanLongitude))
        - 0.5 * y ** 2 * Math.sin(4 * radians(meanLongitude));

    return { declination, eot: equationOfTime / Math.PI * 720 };
}

window.getSolarCoordinatesMeeus = getSolarCoordinatesMeeus;
