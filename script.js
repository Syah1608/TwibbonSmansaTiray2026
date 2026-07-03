const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const uploadInput = document.getElementById('upload');
const downloadButton = document.getElementById('download-btn');
const fileNameDisplay = document.getElementById('file-name');
const frameImg = new Image();
frameImg.src = 'twibbon_mpls.png';

let userImage = new Image();
let userImageLoaded = false;

let offsetX = 0;
let offsetY = 0;
let drawWidth = canvas.width;
let drawHeight = canvas.height;
let zoomFactor = 1;
let isDragging = false;

// Kontrol slider
const zoomSlider = document.getElementById('zoom-slider');
const xOffsetSlider = document.getElementById('x-offset-slider');
const yOffsetSlider = document.getElementById('y-offset-slider');

function resizeCanvas() {
    const containerWidth = document.querySelector('.frame').offsetWidth;
    canvas.width = containerWidth;
    canvas.height = containerWidth;
    drawImageOnCanvas();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawImageOnCanvas() {
    if (userImageLoaded) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const imgAspect = userImage.width / userImage.height;
        drawWidth = canvas.width * zoomFactor;
        drawHeight = drawWidth / imgAspect;
        offsetX = (canvas.width - drawWidth) / 2 + parseFloat(xOffsetSlider.value);
        offsetY = (canvas.height - drawHeight) / 2 + parseFloat(yOffsetSlider.value);
        context.drawImage(userImage, offsetX, offsetY, drawWidth, drawHeight);
        context.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
    }
}

uploadInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        userImage = new Image();
        userImage.onload = function() {
            userImageLoaded = true;
            drawImageOnCanvas();
        };
        userImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
    fileNameDisplay.textContent = file.name;
});

canvas.addEventListener('mousedown', startDragging);
canvas.addEventListener('mousemove', dragImage);
canvas.addEventListener('mouseup', stopDragging);
canvas.addEventListener('touchstart', startDragging);
canvas.addEventListener('touchmove', dragImage);
canvas.addEventListener('touchend', stopDragging);

function startDragging(e) {
    e.preventDefault();
    if (!userImageLoaded) return;
    const mouseX = e.offsetX || e.touches[0].clientX - canvas.offsetLeft;
    const mouseY = e.offsetY || e.touches[0].clientY - canvas.offsetTop;
    if (mouseX >= offsetX && mouseX <= offsetX + drawWidth && mouseY >= offsetY && mouseY <= offsetY + drawHeight) {
        isDragging = true;
    }
}

function dragImage(e) {
    e.preventDefault();
    if (!userImageLoaded || !isDragging) return;
    const mouseX = e.offsetX || e.touches[0].clientX - canvas.offsetLeft;
    const mouseY = e.offsetY || e.touches[0].clientY - canvas.offsetTop;
    offsetX = mouseX - drawWidth / 2;
    offsetY = mouseY - drawHeight / 2;
    drawImageOnCanvas();
}

function stopDragging() {
    isDragging = false;
}

zoomSlider.addEventListener('input', function() {
    zoomFactor = zoomSlider.value;
    drawImageOnCanvas();
});
xOffsetSlider.addEventListener('input', function() {
    drawImageOnCanvas();
});
yOffsetSlider.addEventListener('input', function() {
    drawImageOnCanvas();
});

// Download HD
downloadButton.addEventListener('click', function() {
    if (!userImageLoaded) {
        alert("Silakan unggah gambar terlebih dahulu.");
        return;
    }

    const scale = 3;
    const hdCanvas = document.createElement('canvas');
    hdCanvas.width = canvas.width * scale;
    hdCanvas.height = canvas.height * scale;
    const hdContext = hdCanvas.getContext('2d');

    const imgAspect = userImage.width / userImage.height;
    const drawWidthHD = hdCanvas.width * zoomFactor;
    const drawHeightHD = drawWidthHD / imgAspect;
    const offsetXHD = (hdCanvas.width - drawWidthHD) / 2 + parseFloat(xOffsetSlider.value) * scale;
    const offsetYHD = (hdCanvas.height - drawHeightHD) / 2 + parseFloat(yOffsetSlider.value) * scale;

    hdContext.drawImage(userImage, offsetXHD, offsetYHD, drawWidthHD, drawHeightHD);
    const hdFrame = new Image();
    hdFrame.onload = () => {
        hdContext.drawImage(hdFrame, 0, 0, hdCanvas.width, hdCanvas.height);
        const link = document.createElement('a');
        link.download = 'MPLS_SMANSA_TIRAY_HD.png';
        link.href = hdCanvas.toDataURL('image/png');
        link.click();
    };
    hdFrame.src = 'twibbon_mpls.png';
});

// Teks + Anti-spam copy
document.addEventListener('DOMContentLoaded', function () {
    const nameInput = document.getElementById('name-input');
    const originInput = document.getElementById('origin-input');
    const reasonInput = document.getElementById('reason-input');
    const mottoInput = document.getElementById('motto-input');
    const templateText = document.getElementById('template-text');
    const copyTextButton = document.getElementById('copy-text-btn');
    const notification = document.getElementById('notification');
    const spamNotification = document.getElementById('spam-notification');
    let lastCopiedText = '';

    nameInput.addEventListener('input', updateTemplateText);
    originInput.addEventListener('input', updateTemplateText);
    reasonInput.addEventListener('input', updateTemplateText);
    mottoInput.addEventListener('input', updateTemplateText);

    function updateTemplateText() {
        const name = nameInput.value || 'Nama';
        const origin = originInput.value || 'Asal sekolah';
        const reason = reasonInput.value || 'Alasan bergabung';
        const motto = mottoInput.value || 'Motto';
        document.getElementById('name').textContent = name;
        document.getElementById('origin').textContent = origin;
        document.getElementById('reason').textContent = reason;
        document.getElementById('motto').textContent = motto;
    }

    copyTextButton.addEventListener('click', function () {
        const text = templateText.innerText;
        if (text === lastCopiedText) {
            showSpamNotification();
        } else {
            copyTextToClipboard(text);
            lastCopiedText = text;
            showNotification();
        }
    });

    function copyTextToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    function showNotification() {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    function showSpamNotification() {
        spamNotification.classList.add('show');
        setTimeout(() => {
            spamNotification.classList.remove('show');
        }, 3000);
    }

    frameImg.onload = function () {
        context.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
    };
});
