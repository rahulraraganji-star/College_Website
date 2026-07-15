export const getImageDimensions = (file) => {

  return new Promise((resolve) => {

    const image = new Image();

    image.onload = () => {

      resolve({
        width: image.width,
        height: image.height,
      });

    };

    image.src = URL.createObjectURL(file);

  });

};

export const createImagePreview = (file) => {

  return URL.createObjectURL(file);

};

export const revokeImagePreview = (url) => {

  if (url) {

    URL.revokeObjectURL(url);

  }

};