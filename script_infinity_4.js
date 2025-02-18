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

// 🎨 Load images into memory for overlaying
let images = {
    "QR_CODE_1": new Image(),
    "QR_CODE_2": new Image(),
    "QR_CODE_3": new Image()
};

// 🔄 Update these URLs to match your GitHub Pages or local server paths
images["QR_CODE_1"].src = "https://yourusername.github.io/image1.png";
images["QR_CODE_2"].src = "https://yourusername.github.io/image2.png";
images["QR_CODE_3"].src = "https://yourusername.github.io/image3.png";

let activeImage = null; // Stores the currently displayed image

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

            // 🧹 Clear the previous overlay before drawing new content
            overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

            if (qrCode) {
                const detectedQR = qrCode.data.trim();
                console.log("QR Detected:", detectedQR);

                // ✅ Remove overlay when "QR_CODE_REMOVE" is scanned
                if (detectedQR === "QR_CODE_REMOVE") {
                    activeImage = null; // ✅ Clear the image
                    console.log("Overlay removed.");
                } 
                // ✅ Set the active image based on the detected QR code
                else if (images.hasOwnProperty(detectedQR)) {
                    activeImage = images[detectedQR]; // Load corresponding image
                }
            }

            // 🖼 Draw the active image on the overlay canvas if available
            if (activeImage) {
                overlayCtx.drawImage(activeImage, 50, 50, 300, 300); // Adjust position & size as needed
            }
        }
        requestAnimationFrame(tick);
    }

    tick();
}

// 🚀 Start the camera on page load
startCamera();