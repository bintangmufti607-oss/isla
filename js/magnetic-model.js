// Koreksi deklinasi magnetik WMM agar kompas memakai utara sejati.

function updateMagneticDeclination() {
    const latitude = Number(document.getElementById('lat').value);
    const longitude = Number(document.getElementById('lng').value);
    const elevation = Number(document.getElementById('elevation').value) || 0;
    const info = document.getElementById('magnetic-declination-info');

    try {
        const magnetic = window.WMM2025.calculate(latitude, longitude, elevation, new Date(dateInput.value));
        currentMagneticDeclination = magnetic.declination;
        const direction = currentMagneticDeclination >= 0 ? 'Timur' : 'Barat';
        if (info) info.innerText = `Deklinasi WMM-2025: ${Math.abs(currentMagneticDeclination).toFixed(2)}° ${direction}`;
    } catch (error) {
        currentMagneticDeclination = 0;
        if (info) info.innerText = 'Deklinasi WMM-2025: tidak tersedia';
        console.warn('Gagal menghitung deklinasi WMM:', error);
    }
}

window.updateMagneticDeclination = updateMagneticDeclination;
