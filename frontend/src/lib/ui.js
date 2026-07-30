export function formatCount(value) {
  const number = Number(value) || 0;

  if (number >= 100000) {
    return "100k";
  }

  if (number >= 10000) {
    return "10k";
  }

  if (number >= 1000) {
    return "1k";
  }

  return String(number);
}

export function formatDate(value, includeSeconds = true) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  if (!includeSeconds) {
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  const second = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export function getProfileImageCandidate(value) {
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:image")) {
    return value;
  }

  return "";
}

export function getImageCandidate(value) {
  return getProfileImageCandidate(value);
}

export function convertImageToOptimizedDataUrl(file, maxSize = 720, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function handleLoad(event) {
      const image = new Image();

      image.onload = function handleImageLoad() {
        const canvas = document.createElement("canvas");
        let { width, height } = image;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      image.onerror = reject;
      image.src = event.target?.result || "";
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getUserLabel(value) {
  return (value || "T").trim().slice(0, 1).toUpperCase();
}
