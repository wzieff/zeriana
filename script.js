const qrCodes = [
    "CLEAR_OVERLAY_123", // Clears overlay
    "QR_CODE_1",
    "QR_CODE_2",
    "QR_CODE_3",
    "QR_CODE_4",
    "QR_CODE_5"
];

const qrImages = {
    "QR_CODE_1": "image1.png",
    "QR_CODE_2": "image2.png",
    "QR_CODE_3": "image3.png",
    "QR_CODE_4": "image4.png",
    "QR_CODE_5": "image5.png"
};

let lastScannedQR = null;
let lastOverlay = null;

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const video = document.getElementById("video");
        video.srcObject = stream;
        video.play();
        video.onloadedmetadata = () => {
            scanQR(video);
        };
    } catch (err) {
        console.error("Camera access denied or unavailable.", err);
        alert("Camera access required.");
    }
}

function scanQR(video) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const overlay = document.getElementById("overlay");
    const overlayCtx = overlay.getContext("2d");

    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            overlay.width = video.videoWidth;
            overlay.height = video.videoHeight;

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

            if (qrCode) {
                const detectedQR = qrCode.data.trim();
                console.log("QR Detected:", detectedQR);

                if (detectedQR !== lastScannedQR) {
                    lastScannedQR = detectedQR;

                    if (detectedQR === qrCodes[0]) {
                        console.log("Clearing overlay...");
                        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
                        lastScannedQR = null;
                        lastOverlay = null;
                        return;
                    }

                    if (qrImages.hasOwnProperty(detectedQR)) {
                        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
                        const img = new Image();
                        img.src = qrImages[detectedQR];
                        img.onload = () => {
                            overlayCtx.drawImage(img, 100, 100, 200, 200);
                            lastOverlay = img;
                        };
                    }
                }
            } else {
                if (lastOverlay) {
                    overlayCtx.drawImage(lastOverlay, 100, 100, 200, 200);
                }
            }
        }
        requestAnimationFrame(tick);
    }

    tick();
}

startCamera();