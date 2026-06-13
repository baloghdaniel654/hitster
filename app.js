document.addEventListener("DOMContentLoaded", () => {
    const qrReader = new Html5Qrcode("qr-reader");
    const scanBtn = document.getElementById("scan-btn");
    const scanBtnLabel = document.getElementById("scan-btn-label");
    const qrReaderContainer = document.getElementById("qr-reader");
    const idleState = document.getElementById("idle-state");
    const playerContainer = document.getElementById("player-container");
    const audioPlayer = document.getElementById("audio-player");

    let isScanning = false;

    const setScanningUi = (active) => {
        isScanning = active;
        qrReaderContainer.classList.toggle("active", active);
        idleState.classList.toggle("hidden", active);
        scanBtn.classList.toggle("scanning", active);
        scanBtnLabel.textContent = active ? "Leállítás" : "Beolvasás indítása";
    };

    const resetAudioPlayer = () => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.removeAttribute("src");
        audioPlayer.load();
        playerContainer.hidden = true;
    };

    const resetScanner = async () => {
        if (!isScanning) {
            return;
        }

        try {
            await qrReader.stop();
        } catch (err) {
            console.error("QR olvasó leállítási hiba:", err);
        }

        setScanningUi(false);
    };

    const onScanSuccess = async (decodedText) => {
        const match = decodedText.trim().match(/^zene(\d+)$/);

        if (match) {
            const zeneIndex = match[1];
            const audioFileName = `https://67a0ef16f7bb26008b264ccd--cozy-pavlova-1e6a0d.netlify.app/zene%20(${zeneIndex}).mp3`;

            resetAudioPlayer();
            audioPlayer.src = audioFileName;
            try {
                await audioPlayer.play();
                playerContainer.hidden = false;
            } catch (err) {
                console.error("Hiba a hangfájl lejátszása közben:", err);
            }
        } else {
            console.error("Érvénytelen QR-kód tartalom:", decodedText);
        }

        await resetScanner();
    };

    const onScanError = () => {};

    scanBtn.addEventListener("click", async () => {
        if (isScanning) {
            await resetScanner();
            resetAudioPlayer();
            return;
        }

        resetAudioPlayer();
        setScanningUi(true);

        try {
            await qrReader.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                onScanSuccess,
                onScanError
            );
        } catch (err) {
            console.error("QR kód olvasó nem indítható:", err);
            setScanningUi(false);
        }
    });
});
