const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const uploadInput = document.getElementById("upload");
const downloadButton = document.getElementById("download-btn");
const fileNameDisplay = document.getElementById("file-name");

const zoomSlider = document.getElementById("zoom-slider");
const xOffsetSlider = document.getElementById("x-offset-slider");
const yOffsetSlider = document.getElementById("y-offset-slider");

const nameInput = document.getElementById("name-input");
const originInput = document.getElementById("origin-input");
const mottoInput = document.getElementById("motto-input");

const copyTextButton = document.getElementById("copy-text-btn");
const templateText = document.getElementById("template-text");
const notification = document.getElementById("notification");
const spamNotification = document.getElementById("spam-notification");

const frameImg = new Image();
frameImg.src = "twibbon_mpls.png";

let userImage = new Image();
let userImageLoaded = false;

let zoomFactor = 1;
let sliderOffsetX = 0;
let sliderOffsetY = 0;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragInitialOffsetX = 0;
let dragInitialOffsetY = 0;

let copyCooldown = false;
let lastCopiedText = "";

function showToast(type = "success") {
  const toast = type === "spam" ? spamNotification : notification;
  toast.classList.add("show");

  clearTimeout(toast.hideTimeout);
  toast.hideTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function updateTemplateText() {
  document.getElementById("name").textContent =
    nameInput.value.trim() || "Nama";

  document.getElementById("origin").textContent =
    originInput.value.trim() || "asal sekolah";

  document.getElementById("motto").textContent =
    mottoInput.value.trim() || "Motto";
}

nameInput.addEventListener("input", updateTemplateText);
originInput.addEventListener("input", updateTemplateText);
mottoInput.addEventListener("input", updateTemplateText);
updateTemplateText();

async function copyTemplateText() {
  if (copyCooldown) return;

  const text = templateText.innerText.trim();
  if (!text) return;

  copyCooldown = true;
  copyTextButton.disabled = true;

  try {
    if (text === lastCopiedText) {
      showToast("spam");
    } else {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      lastCopiedText = text;
      showToast("success");
    }
  } catch (err) {
    alert("Gagal menyalin teks. Coba lagi ya.");
  } finally {
    setTimeout(() => {
      copyCooldown = false;
      copyTextButton.disabled = false;
    }, 500);
  }
}

copyTextButton.addEventListener("click", copyTemplateText);

function getCanvasSize() {
  const frame = document.querySelector(".frame");
  const size = Math.floor(frame.clientWidth || 420);
  return size;
}

function resizeCanvas() {
  const size = getCanvasSize();
  canvas.width = size;
  canvas.height = size;
  drawImageOnCanvas();
}

window.addEventListener("resize", resizeCanvas);

function drawImageOnCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (userImageLoaded) {
    const imgAspect = userImage.width / userImage.height;

    let drawWidth;
    let drawHeight;

    // Cover canvas agar foto penuh dan tidak ada area kosong
    if (imgAspect > 1) {
      drawHeight = canvas.height * zoomFactor;
      drawWidth = drawHeight * imgAspect;
    } else {
      drawWidth = canvas.width * zoomFactor;
      drawHeight = drawWidth / imgAspect;
    }

    const baseX = (canvas.width - drawWidth) / 2;
    const baseY = (canvas.height - drawHeight) / 2;

    const finalX = baseX + sliderOffsetX;
    const finalY = baseY + sliderOffsetY;

    context.drawImage(userImage, finalX, finalY, drawWidth, drawHeight);
  }

  // Frame tetap digambar walau belum ada foto
  if (frameImg.complete) {
    context.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
  }
}

frameImg.onload = () => {
  resizeCanvas();
};

uploadInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      userImage = img;
      userImageLoaded = true;

      // reset posisi tiap upload baru
      zoomFactor = 1;
      sliderOffsetX = 0;
      sliderOffsetY = 0;

      zoomSlider.value = 1;
      xOffsetSlider.value = 0;
      yOffsetSlider.value = 0;

      drawImageOnCanvas();
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
  fileNameDisplay.textContent = file.name;
});

zoomSlider.addEventListener("input", function () {
  zoomFactor = parseFloat(this.value);
  drawImageOnCanvas();
});

xOffsetSlider.addEventListener("input", function () {
  sliderOffsetX = parseFloat(this.value);
  drawImageOnCanvas();
});

yOffsetSlider.addEventListener("input", function () {
  sliderOffsetY = parseFloat(this.value);
  drawImageOnCanvas();
});

function getPointerPosition(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches && e.touches.length > 0) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  }
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function startDragging(e) {
  if (!userImageLoaded) return;
  e.preventDefault();

  const pos = getPointerPosition(e);
  isDragging = true;
  dragStartX = pos.x;
  dragStartY = pos.y;
  dragInitialOffsetX = sliderOffsetX;
  dragInitialOffsetY = sliderOffsetY;
}

function dragImage(e) {
  if (!userImageLoaded || !isDragging) return;
  e.preventDefault();

  const pos = getPointerPosition(e);
  const dx = pos.x - dragStartX;
  const dy = pos.y - dragStartY;

  sliderOffsetX = dragInitialOffsetX + dx;
  sliderOffsetY = dragInitialOffsetY + dy;

  xOffsetSlider.value = Math.max(
    parseFloat(xOffsetSlider.min),
    Math.min(parseFloat(xOffsetSlider.max), sliderOffsetX)
  );
  yOffsetSlider.value = Math.max(
    parseFloat(yOffsetSlider.min),
    Math.min(parseFloat(yOffsetSlider.max), sliderOffsetY)
  );

  drawImageOnCanvas();
}

function stopDragging() {
  isDragging = false;
}

canvas.addEventListener("mousedown", startDragging);
canvas.addEventListener("mousemove", dragImage);
window.addEventListener("mouseup", stopDragging);

canvas.addEventListener("touchstart", startDragging, { passive: false });
canvas.addEventListener("touchmove", dragImage, { passive: false });
window.addEventListener("touchend", stopDragging);

downloadButton.addEventListener("click", function () {
  if (!userImageLoaded) {
    alert("Silakan unggah gambar terlebih dahulu.");
    return;
  }

  const exportSize = 1080;
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = exportSize;
  exportCanvas.height = exportSize;
  const exportCtx = exportCanvas.getContext("2d");

  const imgAspect = userImage.width / userImage.height;

  let drawWidth;
  let drawHeight;

  if (imgAspect > 1) {
    drawHeight = exportCanvas.height * zoomFactor;
    drawWidth = drawHeight * imgAspect;
  } else {
    drawWidth = exportCanvas.width * zoomFactor;
    drawHeight = drawWidth / imgAspect;
  }

  const currentCanvasSize = canvas.width;
  const ratio = exportSize / currentCanvasSize;

  const finalX = (exportCanvas.width - drawWidth) / 2 + sliderOffsetX * ratio;
  const finalY = (exportCanvas.height - drawHeight) / 2 + sliderOffsetY * ratio;

  exportCtx.drawImage(userImage, finalX, finalY, drawWidth, drawHeight);

  const exportFrame = new Image();
  exportFrame.onload = function () {
    exportCtx.drawImage(exportFrame, 0, 0, exportSize, exportSize);

    const link = document.createElement("a");
    link.download = "Twibbon_MPLS_2026_UPTD_SMAN_1_TIKKE_RAYA.png";
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };
  exportFrame.src = "twibbon_mpls.png";
});

// pertama kali load, tampilkan frame kosong
resizeCanvas();