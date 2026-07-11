(function () {
    const MAX_N = 12;
    const MODEL_EPOCH = 2025.0;
    const EARTH_REFERENCE_RADIUS_KM = 6371.2;
    const WGS84_A_KM = 6378.137;
    const WGS84_B_KM = 6356.7523142;

    const COF = `
  1  0  -29351.8       0.0       12.0        0.0
  1  1   -1410.8    4545.4        9.7      -21.5
  2  0   -2556.6       0.0      -11.6        0.0
  2  1    2951.1   -3133.6       -5.2      -27.7
  2  2    1649.3    -815.1       -8.0      -12.1
  3  0    1361.0       0.0       -1.3        0.0
  3  1   -2404.1     -56.6       -4.2        4.0
  3  2    1243.8     237.5        0.4       -0.3
  3  3     453.6    -549.5      -15.6       -4.1
  4  0     895.0       0.0       -1.6        0.0
  4  1     799.5     278.6       -2.4       -1.1
  4  2      55.7    -133.9       -6.0        4.1
  4  3    -281.1     212.0        5.6        1.6
  4  4      12.1    -375.6       -7.0       -4.4
  5  0    -233.2       0.0        0.6        0.0
  5  1     368.9      45.4        1.4       -0.5
  5  2     187.2     220.2        0.0        2.2
  5  3    -138.7    -122.9        0.6        0.4
  5  4    -142.0      43.0        2.2        1.7
  5  5      20.9     106.1        0.9        1.9
  6  0      64.4       0.0       -0.2        0.0
  6  1      63.8     -18.4       -0.4        0.3
  6  2      76.9      16.8        0.9       -1.6
  6  3    -115.7      48.8        1.2       -0.4
  6  4     -40.9     -59.8       -0.9        0.9
  6  5      14.9      10.9        0.3        0.7
  6  6     -60.7      72.7        0.9        0.9
  7  0      79.5       0.0       -0.0        0.0
  7  1     -77.0     -48.9       -0.1        0.6
  7  2      -8.8     -14.4       -0.1        0.5
  7  3      59.3      -1.0        0.5       -0.8
  7  4      15.8      23.4       -0.1        0.0
  7  5       2.5      -7.4       -0.8       -1.0
  7  6     -11.1     -25.1       -0.8        0.6
  7  7      14.2      -2.3        0.8       -0.2
  8  0      23.2       0.0       -0.1        0.0
  8  1      10.8       7.1        0.2       -0.2
  8  2     -17.5     -12.6        0.0        0.5
  8  3       2.0      11.4        0.5       -0.4
  8  4     -21.7      -9.7       -0.1        0.4
  8  5      16.9      12.7        0.3       -0.5
  8  6      15.0       0.7        0.2       -0.6
  8  7     -16.8      -5.2       -0.0        0.3
  8  8       0.9       3.9        0.2        0.2
  9  0       4.6       0.0       -0.0        0.0
  9  1       7.8     -24.8       -0.1       -0.3
  9  2       3.0      12.2        0.1        0.3
  9  3      -0.2       8.3        0.3       -0.3
  9  4      -2.5      -3.3       -0.3        0.3
  9  5     -13.1      -5.2        0.0        0.2
  9  6       2.4       7.2        0.3       -0.1
  9  7       8.6      -0.6       -0.1       -0.2
  9  8      -8.7       0.8        0.1        0.4
  9  9     -12.9      10.0       -0.1        0.1
 10  0      -1.3       0.0        0.1        0.0
 10  1      -6.4       3.3        0.0        0.0
 10  2       0.2       0.0        0.1       -0.0
 10  3       2.0       2.4        0.1       -0.2
 10  4      -1.0       5.3       -0.0        0.1
 10  5      -0.6      -9.1       -0.3       -0.1
 10  6      -0.9       0.4        0.0        0.1
 10  7       1.5      -4.2       -0.1        0.0
 10  8       0.9      -3.8       -0.1       -0.1
 10  9      -2.7       0.9       -0.0        0.2
 10 10      -3.9      -9.1       -0.0       -0.0
 11  0       2.9       0.0        0.0        0.0
 11  1      -1.5       0.0       -0.0       -0.0
 11  2      -2.5       2.9        0.0        0.1
 11  3       2.4      -0.6        0.0       -0.0
 11  4      -0.6       0.2        0.0        0.1
 11  5      -0.1       0.5       -0.1       -0.0
 11  6      -0.6      -0.3        0.0       -0.0
 11  7      -0.1      -1.2       -0.0        0.1
 11  8       1.1      -1.7       -0.1       -0.0
 11  9      -1.0      -2.9       -0.1        0.0
 11 10      -0.2      -1.8       -0.1        0.0
 11 11       2.6      -2.3       -0.1        0.0
 12  0      -2.0       0.0        0.0        0.0
 12  1      -0.2      -1.3        0.0       -0.0
 12  2       0.3       0.7       -0.0        0.0
 12  3       1.2       1.0       -0.0       -0.1
 12  4      -1.3      -1.4       -0.0        0.1
 12  5       0.6      -0.0       -0.0       -0.0
 12  6       0.6       0.6        0.1       -0.0
 12  7       0.5      -0.1       -0.0       -0.0
 12  8      -0.1       0.8        0.0        0.0
 12  9      -0.4       0.1        0.0       -0.0
 12 10      -0.2      -1.0       -0.1       -0.0
 12 11      -1.3       0.1       -0.0        0.0
 12 12      -0.7       0.2       -0.1       -0.1
`;

    function index(n, m) {
        return n + (MAX_N + 1) * m;
    }

    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    function radToDeg(radians) {
        return radians * 180 / Math.PI;
    }

    function parseCoefficients() {
        const size = (MAX_N + 1) * (MAX_N + 1);
        const c = new Array(size).fill(0);
        const cd = new Array(size).fill(0);
        const k = new Array(size).fill(0);
        const snorm = new Array(size).fill(0);
        const fn = new Array(MAX_N + 1).fill(0);
        const fm = new Array(MAX_N + 1).fill(0);

        COF.trim().split(/\r?\n/).forEach((line) => {
            const parts = line.trim().split(/\s+/).map(Number);
            const [n, m, gnm, hnm, dgnm, dhnm] = parts;
            c[index(n, m)] = gnm;
            cd[index(n, m)] = dgnm;
            if (m !== 0) {
                c[index(m - 1, n)] = hnm;
                cd[index(m - 1, n)] = dhnm;
            }
        });

        snorm[0] = 1;
        for (let n = 1; n <= MAX_N; n++) {
            snorm[index(n, 0)] = snorm[index(n - 1, 0)] * (2 * n - 1) / n;
            let j = 2;
            for (let m = 0; m <= n; m++) {
                k[index(n, m)] = ((n - 1) * (n - 1) - m * m) / ((2 * n - 1) * (2 * n - 3));

                if (m > 0) {
                    const flnmj = ((n - m + 1) * j) / (n + m);
                    snorm[index(n, m)] = snorm[index(n, m - 1)] * Math.sqrt(flnmj);
                    j = 1;
                    c[index(n, m)] *= snorm[index(n, m)];
                    cd[index(n, m)] *= snorm[index(n, m)];
                    c[index(m - 1, n)] *= snorm[index(n, m)];
                    cd[index(m - 1, n)] *= snorm[index(n, m)];
                } else {
                    c[index(n, m)] *= snorm[index(n, m)];
                    cd[index(n, m)] *= snorm[index(n, m)];
                }
            }
            fn[n] = n + 1;
            fm[n] = n;
        }

        return { c, cd, k, fn, fm };
    }

    const MODEL = parseCoefficients();

    function decimalYear(date) {
        const start = Date.UTC(date.getUTCFullYear(), 0, 1);
        const next = Date.UTC(date.getUTCFullYear() + 1, 0, 1);
        return date.getUTCFullYear() + (date.getTime() - start) / (next - start);
    }

    function geodeticToSpherical(latDeg, altitudeKm) {
        const lat = degToRad(latDeg);
        const sinLat = Math.sin(lat);
        const cosLat = Math.cos(lat);
        const a2 = WGS84_A_KM * WGS84_A_KM;
        const b2 = WGS84_B_KM * WGS84_B_KM;
        const c2 = a2 - b2;
        const a4 = a2 * a2;
        const b4 = b2 * b2;
        const c4 = a4 - b4;

        const q = Math.sqrt(a2 - c2 * sinLat * sinLat);
        const q1 = altitudeKm * q;
        const q2 = Math.pow((q1 + a2) / (q1 + b2), 2);
        const ct = sinLat / Math.sqrt(q2 * cosLat * cosLat + sinLat * sinLat);
        const st = Math.sqrt(Math.max(0, 1 - ct * ct));
        const r2 = altitudeKm * altitudeKm + 2 * q1 + (a4 - c4 * sinLat * sinLat) / (q * q);
        const r = Math.sqrt(r2);
        const d = Math.sqrt(a2 * cosLat * cosLat + b2 * sinLat * sinLat);
        const ca = (altitudeKm + d) / r;
        const sa = c2 * cosLat * sinLat / (r * d);

        return { r, st, ct, ca, sa };
    }

    function calculate(latDeg, lonDeg, altitudeMeters = 0, date = new Date()) {
        if (!Number.isFinite(latDeg) || !Number.isFinite(lonDeg)) {
            throw new Error('Latitude dan longitude harus angka.');
        }

        const altitudeKm = (Number.isFinite(altitudeMeters) ? altitudeMeters : 0) / 1000;
        const time = decimalYear(date);
        const dt = time - MODEL_EPOCH;
        const lon = degToRad(lonDeg);
        const { r, st, ct, ca, sa } = geodeticToSpherical(latDeg, altitudeKm);
        const aor = EARTH_REFERENCE_RADIUS_KM / r;

        const p = new Array((MAX_N + 1) * (MAX_N + 1)).fill(0);
        const dp = new Array((MAX_N + 1) * (MAX_N + 1)).fill(0);
        const sp = new Array(MAX_N + 1).fill(0);
        const cp = new Array(MAX_N + 1).fill(0);

        p[0] = 1;
        cp[0] = 1;
        sp[0] = 0;
        cp[1] = Math.cos(lon);
        sp[1] = Math.sin(lon);
        for (let m = 2; m <= MAX_N; m++) {
            cp[m] = cp[1] * cp[m - 1] - sp[1] * sp[m - 1];
            sp[m] = sp[1] * cp[m - 1] + cp[1] * sp[m - 1];
        }

        let ar = aor * aor;
        let br = 0;
        let bt = 0;
        let bp = 0;
        let bpp = 0;

        for (let n = 1; n <= MAX_N; n++) {
            ar *= aor;
            for (let m = 0; m <= n; m++) {
                if (n === m) {
                    p[index(n, m)] = st * p[index(n - 1, m - 1)];
                    dp[index(n, m)] = st * dp[index(n - 1, m - 1)] + ct * p[index(n - 1, m - 1)];
                } else if (n === 1 && m === 0) {
                    p[index(n, m)] = ct * p[index(n - 1, m)];
                    dp[index(n, m)] = ct * dp[index(n - 1, m)] - st * p[index(n - 1, m)];
                } else {
                    p[index(n, m)] = ct * p[index(n - 1, m)] - MODEL.k[index(n, m)] * p[index(n - 2, m)];
                    dp[index(n, m)] = ct * dp[index(n - 1, m)] - st * p[index(n - 1, m)] - MODEL.k[index(n, m)] * dp[index(n - 2, m)];
                }

                const g = MODEL.c[index(n, m)] + dt * MODEL.cd[index(n, m)];
                const h = m === 0 ? 0 : MODEL.c[index(m - 1, n)] + dt * MODEL.cd[index(m - 1, n)];
                const temp1 = g * cp[m] + h * sp[m];
                const temp2 = g * sp[m] - h * cp[m];
                const par = ar * p[index(n, m)];

                bt -= ar * temp1 * dp[index(n, m)];
                br += MODEL.fn[n] * temp1 * par;
                if (m !== 0) {
                    if (st === 0) {
                        bpp += MODEL.fm[m] * temp2 * ar * p[index(n, m)];
                    } else {
                        bp += MODEL.fm[m] * temp2 * par / st;
                    }
                }
            }
        }

        if (st === 0) {
            bp = bpp;
        }

        const x = -bt * ca - br * sa;
        const y = bp;
        const z = bt * sa - br * ca;
        const h = Math.sqrt(x * x + y * y);
        const f = Math.sqrt(h * h + z * z);
        const declination = radToDeg(Math.atan2(y, x));
        const inclination = radToDeg(Math.atan2(z, h));

        return { declination, inclination, x, y, z, h, f, model: 'WMM-2025', decimalYear: time };
    }

    window.WMM2025 = {
        calculate,
        declination: (lat, lon, altitudeMeters, date) => calculate(lat, lon, altitudeMeters, date).declination,
        decimalYear,
    };
})();
