// Bootstrap halaman: tema, tanggal awal, lokasi, dan data atmosfer daring.

const themeToggleBtn = document.getElementById('theme-toggle');
const dateInput = document.getElementById('calc-date');

function applyTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('color-theme', theme);
}

themeToggleBtn.addEventListener('click', () => {
    applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
});

applyTheme(
    localStorage.getItem('color-theme') === 'dark'
    || (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark'
        : 'light'
);

const now = new Date();
dateInput.value = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
].join('-');

function setTimeZoneOffset(offsetHours) {
    const timezoneSelect = document.getElementById('timezone');
    const value = String(offsetHours);

    if (!Array.from(timezoneSelect.options).some(option => option.value === value)) {
        const sign = offsetHours >= 0 ? '+' : '';
        timezoneSelect.add(new Option(`UTC ${sign}${offsetHours}`, value));
    }
    timezoneSelect.value = value;
}

async function refreshInternetData() {
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    try {
        const query = new URLSearchParams({
            latitude: lat,
            longitude: lng,
            current: 'temperature_2m,surface_pressure',
            timezone: 'auto'
        });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (Number.isFinite(data.elevation)) document.getElementById('elevation').value = Math.round(data.elevation);
        if (Number.isFinite(data.utc_offset_seconds)) setTimeZoneOffset(data.utc_offset_seconds / 3600);
        if (Number.isFinite(data.current?.temperature_2m)) document.getElementById('temp').value = data.current.temperature_2m.toFixed(1);
        if (Number.isFinite(data.current?.surface_pressure)) document.getElementById('pressure').value = Math.round(data.current.surface_pressure);

        calculateFalak();
        generate30DaysTable();
    } catch (error) {
        console.warn('Data Internet tidak dapat diperbarui:', error);
    }
}

function syncInternetData() {
    // Tampilkan data untuk koordinat aktif segera, tanpa menunggu dialog GPS.
    refreshInternetData();
    const complete = () => refreshInternetData();

    if (!navigator.geolocation) return complete();

    navigator.geolocation.getCurrentPosition(
        async position => {
            document.getElementById('lat').value = position.coords.latitude.toFixed(6);
            document.getElementById('lng').value = position.coords.longitude.toFixed(6);
            if (position.coords.altitude) document.getElementById('elevation').value = Math.round(position.coords.altitude);
            await complete();
        },
        complete,
        { enableHighAccuracy: true, timeout: 5000 }
    );
}

function applyMethodPreset() {
    calculateFalak();
    generate30DaysTable();
}

document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('input', () => {
        calculateFalak();
        generate30DaysTable();
    });
});

window.syncInternetData = syncInternetData;
window.applyMethodPreset = applyMethodPreset;
function initializeApp() {
    try {
        calculateFalak();
        generate30DaysTable();
        // Memunculkan dialog izin lokasi sejak awal. Setelah disetujui, GPS dan
        // data atmosfer disinkronkan otomatis tanpa tindakan tambahan pengguna.
        syncInternetData();
        setInterval(updateLiveTimer, 1000);
    } catch (error) {
        console.error('Miqatara gagal diinisialisasi:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp, { once: true });
} else {
    initializeApp();
}
