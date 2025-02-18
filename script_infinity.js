let lastScannedQR = null;
let infinityPoints = [];
const maxTrailLength = 100; // Increased trail for smoother curves
let drawingEnabled = false;
let startTime = null; // Tracks animation timing

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        const video = document.getElementById("video");
        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
            scanQR(video);
        };
    } catch (err) {
        console.error("Error accessing the camera:", err);
        alert("Camera access required for QR scanning.");
    }
}

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

            // Fading effect: Apply a slight transparent overlay
            overlayCtx.fillStyle = "rgba(0, 0, 0, 0.08)"; // Faster fading
            overlayCtx.fillRect(0, 0, overlay.width, overlay.height);

            if (qrCode) {
                const detectedQR = qrCode.data.trim();
                console.log("QR Detected:", detectedQR);

                // Start drawing when "QR_CODE_1" is detected for the first time
                if (detectedQR === "QR_CODE_1" && lastScannedQR !== "QR_CODE_1") {
                    drawingEnabled = true;
                    infinityPoints = []; // Reset trail
                    lastScannedQR = "QR_CODE_1";
                    startTime = Date.now(); // Reset animation timing
                    console.log("Infinity symbol drawing started.");

                    // ✅ Ensure the first frame has a clean starting point
                    setTimeout(() => {
                        drawInfinitySymbol(overlay.width / 2, overlay.height / 2, overlayCtx);
                    }, 50); // Small delay to sync frames

                }

                // Stop drawing when a different QR code is detected
                if (detectedQR !== "QR_CODE_1" && detectedQR !== lastScannedQR) {
                    drawingEnabled = false;
                    infinityPoints = [];
                    lastScannedQR = detectedQR;

                    if (detectedQR === "CLEAR_OVERLAY_123") {
                        console.log("Clearing overlay...");
                        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
                        lastScannedQR = null;
                        return;
                    }
                }

                // Get QR code position and center infinity symbol on it
                const loc = qrCode.location;
                const centerX = (loc.topLeftCorner.x + loc.bottomRightCorner.x) / 2;
                const centerY = (loc.topLeftCorner.y + loc.bottomRightCorner.y) / 2;

                if (drawingEnabled) {
                    drawInfinitySymbol(centerX, centerY, overlayCtx);
                }
            } else {
                // Keep drawing even if the QR code goes out of view
                if (drawingEnabled) {
                    drawInfinitySymbol(overlay.width / 2, overlay.height / 2, overlayCtx);
                }
            }
        }
        requestAnimationFrame(tick);
    }

    tick();
}

function drawInfinitySymbol(cx, cy, ctx) {
    const elapsedTime = (Date.now() - startTime) / 2000; // Slow down drawing

    // Reset every 1.5 seconds to create a continuous flowing effect
    if (elapsedTime > 1.5) {
        infinityPoints = [];
        startTime = Date.now();
    }

    const t = (elapsedTime * Math.PI * 2); // Smooth looping motion
    const scaleX = 80; // Fatter horizontal loops
    const scaleY = 40; // Taller vertical loops

    // Parametric equation for an elliptical infinity symbol
    const x = scaleX * Math.cos(t) / (1 + Math.sin(t) ** 2) + cx;
    const y = scaleY * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) ** 2) + cy;

    // Store points for fading effect
    infinityPoints.push({ x, y });

    // Keep trail length limited
    if (infinityPoints.length > maxTrailLength) {
        infinityPoints.shift(); // Remove oldest point for smooth fading effect
    }

    // Draw the fading infinity symbol
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (let i = 1; i < infinityPoints.length; i++) {
        const fadeFactor = i / infinityPoints.length; // Adjust transparency
        ctx.strokeStyle = `rgba(255, 255, 0, ${fadeFactor})`; // Yellow with fade
        ctx.moveTo(infinityPoints[i - 1].x, infinityPoints[i - 1].y);
        ctx.lineTo(infinityPoints[i].x, infinityPoints[i].y);
    }

    ctx.stroke();
}

// Start the camera when the page loads
startCamera();