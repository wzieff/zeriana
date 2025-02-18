// 🎥 Start the camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" } // Use back camera on mobile
        });

        const video = document.getElementById("video");
        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
            scanQR(video); // Start scanning once the video is ready
        };
    } catch (err) {
        console.error("Error accessing the camera:", err);
        alert("Camera access is required for QR scanning.");
    }
}

// 🖍️ Superimposed text settings
let activeText = ""; // The currently displayed text

// 📡 Function to continuously scan QR codes
function scanQR(video) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
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

            // 🧹 Clear overlay before drawing
            overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

            if (qrCode) {
                const detectedQR = qrCode.data.trim();
                console.log("QR Detected:", detectedQR);

                // ✅ Remove text when "QR_CODE_REMOVE" is scanned
                if (detectedQR === "QR_CODE_REMOVE_IMAGE") {
                    activeText = ""; // Clear text
                    console.log("Overlay text removed.");
                } else {
                    activeText = detectedQR; // Set the detected QR code text
                }
            }

            // 🖍️ Draw superimposed text if available
            if (activeText) {
                overlayCtx.font = "bold 50px Arial"; // Big bold font
                overlayCtx.fillStyle = "pink"; // Set text color
                overlayCtx.textAlign = "center"; // Center the text
                overlayCtx.fillText(activeText, overlay.width / 2, overlay.height / 2); // Draw text
            }
        }
        requestAnimationFrame(tick);
    }

    tick();
}

// 🚀 Start the camera on page load
startCamera();