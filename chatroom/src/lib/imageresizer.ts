const resizeImage = (file: File, maxWidth: number, maxHeight: number) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > maxWidth) {
            height = Math.round(maxWidth / aspectRatio);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round(maxHeight * aspectRatio);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas image."));
          }
        }, file.type);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};
