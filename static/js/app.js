const textInput = document.getElementById("textInput");
const language = document.getElementById("language");
const voiceSelect = document.getElementById("voice");

const speed = document.getElementById("speed");
const pitch = document.getElementById("pitch");
const volume = document.getElementById("volume");

const speedValue = document.getElementById("speedValue");
const pitchValue = document.getElementById("pitchValue");
const volumeValue = document.getElementById("volumeValue");

const characterCount = document.getElementById("characterCount");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");

const clearBtn = document.getElementById("clearBtn");

const status = document.getElementById("status");
const progress = document.getElementById("progress");

let voices = [];
let speech = null;
let progressTimer = null;

const languageNames = {
    "en-US": "English",
    "ne-NP": "Nepali"
};

function getPreferredVoice(availableVoices) {

    return availableVoices.find(voice =>
        voice.lang.toLowerCase() === language.value.toLowerCase() &&
        /google|nepali/i.test(voice.name)
    ) || availableVoices.find(voice =>
        voice.lang.toLowerCase() === language.value.toLowerCase()
    ) || availableVoices[0];
}


/* Load voices */

function loadVoices() {

    voices = speechSynthesis.getVoices();

    voiceSelect.innerHTML = "";

    const selectedLanguage = language.value;

    const matchingVoices = voices.filter(voice =>
        voice.lang.toLowerCase().startsWith(
            selectedLanguage.substring(0, 2).toLowerCase()
        )
    );

    const availableVoices = matchingVoices;

    if (availableVoices.length === 0) {

        const option = document.createElement("option");

        option.value = "";
        option.textContent =
            `No ${languageNames[selectedLanguage]} voice available in this browser`;

        voiceSelect.appendChild(option);

        return;
    }

    const preferredVoice = getPreferredVoice(availableVoices);

    availableVoices.forEach(voice => {

        const option = document.createElement("option");

        option.value = voices.indexOf(voice);

        option.textContent =
            `${voice.name} (${voice.lang})`;

        if (voice === preferredVoice) {
            option.selected = true;
        }

        voiceSelect.appendChild(option);

    });
}


speechSynthesis.onvoiceschanged = loadVoices;

loadVoices();


/* Language */

language.addEventListener("change", () => {

    loadVoices();

    textInput.placeholder =
        language.value === "ne-NP"
            ? "यहाँ आफ्नो नेपाली पाठ लेख्नुहोस्..."
            : "Type or paste your English text here...";

});


/* Character counter */

textInput.addEventListener("input", () => {

    characterCount.textContent =
        `${textInput.value.length} / 5000 characters`;

});


/* Speed */

speed.addEventListener("input", () => {

    speedValue.textContent =
        `${speed.value}x`;

});


/* Pitch */

pitch.addEventListener("input", () => {

    pitchValue.textContent =
        pitch.value;

});


/* Volume */

volume.addEventListener("input", () => {

    volumeValue.textContent =
        `${Math.round(volume.value * 100)}%`;

});


/* Speak */

function speakText() {

    const text = textInput.value.trim();

    if (!text) {

        status.textContent =
            "Please enter some text first.";

        return;

    }

    speechSynthesis.cancel();

    speech = new SpeechSynthesisUtterance(text);

    speech.lang = language.value;

    speech.rate = parseFloat(speed.value);

    speech.pitch = parseFloat(pitch.value);

    speech.volume = parseFloat(volume.value);


    const selectedVoice =
        voices[parseInt(voiceSelect.value, 10)];

    if (!selectedVoice || !selectedVoice.lang.toLowerCase().startsWith("ne")) {

        if (language.value === "ne-NP") {
            status.textContent =
                "Nepali voice is not installed in this browser. Add a Nepali voice to your system or use Google Cloud TTS.";

            return;
        }

    } else {
        speech.voice = selectedVoice;
    }


    speech.onstart = () => {

        status.textContent =
            "Speaking...";

        playBtn.innerHTML =
            '<i class="fa-solid fa-volume-high"></i> Speaking';

        startProgress();

    };


    speech.onend = () => {

        status.textContent =
            "Speech completed.";

        playBtn.innerHTML =
            '<i class="fa-solid fa-play"></i> Convert & Play';

        stopProgress();

        progress.style.width = "100%";

    };


    speech.onerror = () => {

        status.textContent =
            "Unable to play speech.";

        stopProgress();

    };


    speechSynthesis.speak(speech);

}


/* Play */

playBtn.addEventListener("click", speakText);


/* Pause */

pauseBtn.addEventListener("click", () => {

    if (speechSynthesis.speaking) {

        speechSynthesis.pause();

        status.textContent =
            "Speech paused.";

    }

});


/* Resume when play clicked after pause */

playBtn.addEventListener("dblclick", () => {

    speechSynthesis.resume();

});


/* Stop */

stopBtn.addEventListener("click", () => {

    speechSynthesis.cancel();

    status.textContent =
        "Speech stopped.";

    playBtn.innerHTML =
        '<i class="fa-solid fa-play"></i> Convert & Play';

    stopProgress();

    progress.style.width = "0%";

});


/* Clear */

clearBtn.addEventListener("click", () => {

    speechSynthesis.cancel();

    textInput.value = "";

    characterCount.textContent =
        "0 / 5000 characters";

    status.textContent =
        "Ready to convert your text";

    progress.style.width =
        "0%";

});


/* Progress */

function startProgress() {

    stopProgress();

    let value = 0;

    progressTimer = setInterval(() => {

        value += 0.5;

        if (value >= 95) {
            value = 95;
        }

        progress.style.width =
            `${value}%`;

    }, 100);

}


function stopProgress() {

    if (progressTimer) {

        clearInterval(progressTimer);

        progressTimer = null;

    }

}


/* Dark mode */

const themeBtn =
    document.getElementById("themeBtn");

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const icon =
        themeBtn.querySelector("i");

    if (document.body.classList.contains("dark")) {

        icon.className =
            "fa-solid fa-sun";

    } else {

        icon.className =
            "fa-solid fa-moon";

    }

});
