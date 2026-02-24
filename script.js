// -----------------------------
// TEXT TO SPEECH FUNCTION
// -----------------------------
function speakText(text) {

    const speech = new SpeechSynthesisUtterance(text);

    function setVoiceAndSpeak() {
        const voices = window.speechSynthesis.getVoices();

        let femaleVoice = voices.find(voice =>
            voice.name.includes("Zira") ||
            voice.name.includes("Heera") ||
            voice.name.includes("Hazel")
        );

        if (!femaleVoice) {
            femaleVoice = voices.find(voice =>
                voice.name.toLowerCase().includes("female")
            );
        }

        if (femaleVoice) {
            speech.voice = femaleVoice;
        }

        speech.rate = 1.3;
        speech.pitch = 1.1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
    }

    if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    } else {
        setVoiceAndSpeak();
    }
}


// -----------------------------
// VOICE INPUT FUNCTION
// -----------------------------
function startListening() {

    if (!('webkitSpeechRecognition' in window)) {
        alert("Use Google Chrome for voice input.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    const micBtn = document.getElementById("micBtn");

    recognition.onstart = function() {
        micBtn.style.background = "red"; // 🔴 mic active
    };

    recognition.onend = function() {
        micBtn.style.background = "#6c4ce3"; // 🟣 normal
    };

    recognition.onresult = function(event) {
        let transcript = event.results[0][0].transcript;
        document.getElementById("userInput").value = transcript;
        sendMessage();
    };

    recognition.onerror = function(event) {
        console.log("Speech error:", event.error);
    };

    recognition.start();
}


// -----------------------------
// SEND MESSAGE FUNCTION
// -----------------------------
function sendMessage(messageText = null) {

    let input = document.getElementById("userInput");
    let message = messageText || input.value.trim();

    if (message === "") return;

    let chatBox = document.getElementById("chatBox");

    // USER MESSAGE
    let userDiv = document.createElement("div");
    userDiv.className = "user-msg";
    userDiv.innerText = message;
    chatBox.appendChild(userDiv);

    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // SEND TO BACKEND
    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
    })
    .then(res => res.json())
    .then(data => {

        let botDiv = document.createElement("div");
        botDiv.className = "bot-msg";
        botDiv.innerText = data.response;

        chatBox.appendChild(botDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        // 🔊 Speak response
        speakText(data.response);
    })
    .catch(error => {
        console.log("Server error:", error);
    });
}


// -----------------------------
// ENTER KEY SUPPORT
// -----------------------------
window.onload = function () {

    const input = document.getElementById("userInput");

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

};