// Pemutaran alarm adzan dan bunyi cadangan Web Audio API.

const ADHAN_AUDIO_URL = 'https://upload.wikimedia.org/wikipedia/commons/2/27/Call_to_prayer_by_Sabah_Fakhry.mp3';
const ADHAN_START_SECONDS = 2;
const ADHAN_CLIP_SECONDS = 11;

let audioCtx = null;
let adhanStopTimer = null;
const adhanAudio = new Audio(ADHAN_AUDIO_URL);
adhanAudio.preload = 'auto';

async function triggerPrayerAlarm() {
    try {
        adhanAudio.pause();
        adhanAudio.currentTime = ADHAN_START_SECONDS;
        await adhanAudio.play();

        clearTimeout(adhanStopTimer);
        adhanStopTimer = setTimeout(() => {
            adhanAudio.pause();
            adhanAudio.currentTime = ADHAN_START_SECONDS;
        }, ADHAN_CLIP_SECONDS * 1000);
    } catch (error) {
        console.warn('Audio adzan tidak dapat diputar, memakai bunyi cadangan:', error);
        playFallbackAlarm();
    }
}

function playFallbackAlarm() {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();

    [293.66, 329.63, 392.00, 440.00].forEach((frequency, index) => {
        const time = audioCtx.currentTime + index * 0.4;
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);

        oscillator.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.start(time);
        oscillator.stop(time + 1);
    });
}

window.triggerPrayerAlarm = triggerPrayerAlarm;
window.playTestTone = () => triggerPrayerAlarm();
