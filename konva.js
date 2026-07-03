// script.js
const canvasContainer = document.getElementById('container');
const uploadInput = document.getElementById('upload');
const downloadButton = document.getElementById('download-btn');
const fileNameDisplay = document.getElementById('file-name');
const nameInput = document.getElementById('name-input');
const originInput = document.getElementById('origin-input');
const mottoInput = document.getElementById('motto-input');
const templateText = document.getElementById('template-text');
const copyButton = document.getElementById('copy-btn');
const notification = document.getElementById('notification');
const spamNotification = document.getElementById('spam-notification');
let copied = false;

const stage = new Konva.Stage({
    container: 'container',
    width: 512,
    height: 512,
});

const layer = new Konva.Layer();
stage.add(layer);

const frameImg = new Image();
frameImg.src = 'twibbon_mpls.png';

const frameKonvaImage = new Konva.Image({
    image: frameImg,
    width: 512,
    height: 512,
});
layer.add(frameKonvaImage);

let userImage = new Konva.Image({
    draggable: true,
});
layer.add(userImage);

uploadInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    fileNameDisplay.textContent = file.name;

    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            userImage.image(img);
            userImage.width(512);
            userImage.height(512);
            userImage.draggable(true);
            layer.draw();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

downloadButton.addEventListener('click', function() {
    const dataURL = stage.toDataURL({ pixelRatio: 1 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'MPLS_SMANSA_TIRAY.png';
    link.click();
});

nameInput.addEventListener('input', updateTemplateText);
originInput.addEventListener('input', updateTemplateText);
mottoInput.addEventListener('input', updateTemplateText);

function updateTemplateText() {
    const name = nameInput.value || 'Nama';
    const origin = originInput.value || 'Asal';
    const motto = mottoInput.value || 'Pendidikan bukan hanya tentang mengisi pikiran, tetapi juga membentuk karakter.';
    document.getElementById('name-placeholder').textContent = name;
    document.getElementById('origin-placeholder').textContent = origin;
    document.getElementById('motto-placeholder').textContent = motto;
}

copyButton.addEventListener('click', function() {
    const text = templateText.innerText;
    navigator.clipboard.writeText(text).then(() => {
        if (copied) {
            showSpamNotification();
        } else {
            showNotification();
            copied = true;
            setTimeout(() => { copied = false; }, 3000);
        }
    });
});

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
