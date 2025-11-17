/**
 * Image validation utilities using Canvas API
 * Checks for image quality, blur, and validity
 */

export interface ValidationResult {
  isValid: boolean;
  isSharp: boolean;
  isFlat: boolean;
  score: number;
  errorKeys: string[]; // i18n keys instead of hardcoded messages
}

/**
 * Get grayscale value from RGBA data
 */
function getGray(data: Uint8ClampedArray, idx: number): number {
  return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
}

/**
 * Calculate Laplacian variance to detect blur
 * Higher variance = sharper image
 */
function calculateBlurScore(imageData: ImageData): number {
  const { width, height, data } = imageData;
  const laplacians: number[] = [];

  // Sample pixels (every 2nd pixel for performance)
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const idx = (y * width + x) * 4;
      const gray = getGray(data, idx);
      const prevGray = getGray(data, ((y - 1) * width + x) * 4);
      const nextGray = getGray(data, ((y + 1) * width + x) * 4);
      const leftGray = getGray(data, (y * width + (x - 1)) * 4);
      const rightGray = getGray(data, (y * width + (x + 1)) * 4);

      laplacians.push(Math.abs(4 * gray - prevGray - nextGray - leftGray - rightGray));
    }
  }

  if (laplacians.length === 0) return 0;

  const mean = laplacians.reduce((a, b) => a + b, 0) / laplacians.length;
  const variance = laplacians.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / laplacians.length;

  return variance;
}

/**
 * Check if image is flat (not tilted/perspective distortion)
 */
function checkFlatness(imageData: ImageData): boolean {
  const { width, height, data } = imageData;
  const edgeDiffs: number[] = [];

  // Sample top and bottom edges
  for (let x = 0; x < width; x += 10) {
    const topGray = getGray(data, x * 4);
    const bottomGray = getGray(data, ((height - 1) * width + x) * 4);
    edgeDiffs.push(Math.abs(topGray - bottomGray));
  }

  const mean = edgeDiffs.reduce((a, b) => a + b, 0) / edgeDiffs.length;
  const variance = edgeDiffs.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / edgeDiffs.length;

  return variance < 1000; // Low variance = flat image
}

/**
 * Validate image file
 */
export async function validateImage(file: File): Promise<ValidationResult> {
  const errorKeys: string[] = [];
  const SHARP_THRESHOLD = 100;
  const MAX_SIZE = 800;

  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve({
        isValid: false,
        isSharp: false,
        isFlat: false,
        score: 0,
        errorKeys: ['inbody.validation.canvasError'],
      });
      return;
    }

    img.onload = (): void => {
      try {
        // Check aspect ratio
        // const aspectRatio = img.width / img.height;
        // if (aspectRatio < 0.5 || aspectRatio > 2) {
        //   errorKeys.push('inbody.validation.extremeAspectRatio');
        // }

        // Resize for processing
        const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Check blur
        const blurScore = calculateBlurScore(imageData);
        const isSharp = blurScore > SHARP_THRESHOLD;
        // if (!isSharp) {
        //   errorKeys.push('inbody.validation.blurry');
        // }

        // Check flatness
        const isFlat = checkFlatness(imageData);
        // if (!isFlat) {
        //   errorKeys.push('inbody.validation.tilted');
        // }

        const score = Math.min(100, (blurScore / 1000) * 50 + (isFlat ? 50 : 0));

        resolve({
          isValid: true,
          // isValid: errorKeys.length === 0 && isSharp,
          isSharp,
          isFlat,
          score,
          errorKeys,
        });
      } catch (error) {
        resolve({
          isValid: false,
          isSharp: false,
          isFlat: false,
          score: 0,
          errorKeys: ['inbody.validation.unknownError'],
        });
      }
    };

    img.onerror = (): void => {
      resolve({
        isValid: false,
        isSharp: false,
        isFlat: false,
        score: 0,
        errorKeys: ['inbody.validation.invalidFile'],
      });
    };

    img.src = URL.createObjectURL(file);
  });
}

