// Jam lokal, hitung mundur, dan penanda waktu shalat berikutnya.

function updateLiveTimer() {
    const timezone = Number(document.getElementById('timezone').value);
    const now = new Date(Date.now() + new Date().getTimezoneOffset() * 60_000 + timezone * 3_600_000);
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const nowDecimal = hours + minutes / 60 + seconds / 3600;

    document.getElementById('live-clock').innerText = [hours, minutes, seconds]
        .map(value => String(value).padStart(2, '0'))
        .join(':');
    document.getElementById('live-date').innerText = now.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const prayers = [
        ['Imsak', todayPrayerTimes.imsak], ['Subuh', todayPrayerTimes.subuh],
        ['Syuruq', todayPrayerTimes.syuruq], ['Zuhur', todayPrayerTimes.zuhur],
        ['Asar', todayPrayerTimes.asar], ['Maghrib', todayPrayerTimes.maghrib], ['Isya', todayPrayerTimes.isya]
    ];
    const next = prayers.find(([, time]) => nowDecimal < time);
    const [nextName, nextTime] = next ?? ['Imsak (Esok)', computeSingleDay(new Date(now.getTime() + 86_400_000)).raw.imsak];

    document.querySelectorAll('[id^="card-"]').forEach(card => {
        card.classList.remove('ring-2', 'ring-primary-500', 'bg-primary-50/20', 'dark:bg-primary-950/20');
    });

    const previousIndex = next ? prayers.indexOf(next) - 1 : prayers.length - 1;
    const activeCard = document.getElementById(`card-${prayers[previousIndex]?.[0].toLowerCase()}`);
    activeCard?.classList.add('ring-2', 'ring-primary-500', 'bg-primary-50/20', 'dark:bg-primary-950/20');

    let remainingSeconds = Math.round((nextTime - nowDecimal) * 3600);
    if (remainingSeconds < 0) remainingSeconds += 86_400;
    const remainingHours = Math.floor(remainingSeconds / 3600);
    const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);
    const remaining = remainingSeconds % 60;

    document.getElementById('next-prayer-name').innerText = nextName;
    document.getElementById('next-prayer-countdown').innerText = [remainingHours, remainingMinutes, remaining]
        .map(value => String(value).padStart(2, '0'))
        .join(':');

    if (remainingSeconds === 0 && nextName !== 'Syuruq') triggerPrayerAlarm();
}
