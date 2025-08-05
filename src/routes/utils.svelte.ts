import { env } from '$env/dynamic/public';
import { derived, writable } from 'svelte/store';

/**
 * Options for dynamically transforming images via the WSRV (images.weserv.nl) proxy.
 */
export interface WSRVOptions {
	/**
	 * Set the target width of the image in pixels.
	 * If only `width` is specified, height is automatically calculated to maintain aspect ratio.
	 * @example 300
	 */
	width?: number;

	/**
	 * Set the target height of the image in pixels.
	 * If only `height` is specified, width is automatically calculated to maintain aspect ratio.
	 * @example 200
	 */
	height?: number;

	/**
	 * Set the image quality (only applicable for JPEG, WebP, AVIF).
	 * Value should be between 0–100. Defaults to 80.
	 * Lower values reduce file size but may introduce visible compression artifacts.
	 * @example 75
	 */
	quality?: number;

	/**
	 * Specifies how the image should fit within the given dimensions.
	 * - `cover`: Crops to fill, may cut parts.
	 * - `contain`: Fits within without cropping, may leave blank space.
	 * - `fill`: Stretches to fit exactly, may distort.
	 * - `inside`: Shrinks to fit within dimensions.
	 * - `outside`: Grows to fill dimensions, may crop.
	 * @default undefined (automatic)
	 */
	fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

	/**
	 * Applies a blur filter to the image. Values range from 1 (slight blur) to 1000 (extremely blurred).
	 * @example 10
	 */
	blur?: number;

	/**
	 * Device Pixel Ratio (DPR) scaling.
	 * Useful for retina or high-DPI displays. For example, DPR=2 will double the resolution.
	 * @example 2
	 */
	dpr?: number;

	/**
	 * If true, forces image output to WebP format (if supported by browser).
	 * This can help reduce file size while preserving quality.
	 */
	webp?: boolean;

	/**
	 * If true, forces image output to AVIF format (if supported by browser).
	 * AVIF usually has better compression than WebP.
	 */
	avif?: boolean;

	/**
	 * Forces the output format of the image regardless of original format.
	 * Supported values: `jpg`, `png`, `webp`, `avif`.
	 */
	output?: 'jpg' | 'png' | 'webp' | 'avif';

	/**
	 * Background color to use when padding transparent images or when using `fit=contain`.
	 * Should be a valid hex code (without #), e.g., `ffffff` for white.
	 * @example "000000"
	 */
	bg?: string;

	/**
	 * Enables interlacing for JPEGs (aka progressive JPEG).
	 * This allows the image to load gradually in multiple passes.
	 */
	interlace?: boolean;

	/**
	 * If true, strips all metadata (EXIF, GPS, etc.) from the image.
	 * Useful for privacy and reducing size.
	 */
	stripMetadata?: boolean;

	/**
	 * By default, small images are enlarged to meet the requested dimensions.
	 * Set to false to prevent upscaling.
	 */
	enlarge?: boolean;
}

const WSRVBaseUrl = env.PUBLIC_WSRV_URL ?? 'https://panth.whiteloves.in/wsrv'; // 'https://wsrv.nl/';
const hostname = env.PUBLIC_HOSTNAME ?? 'panth.whiteloves.in';

export function getAssetsPath(filename: string) {
	return `https://${hostname}/assets/${filename}`;
	// return `https://firebasestorage.googleapis.com/v0/b/panth-personal.firebasestorage.app/o/portfolio%2F${filename}?alt=media`;
}
export function generatePreviewUrl(url: string, options: WSRVOptions) {
	const query = new URLSearchParams();
	query.set('url', url);
	if (options.width) query.set('w', `${options.width}`);
	if (options.height) query.set('h', `${options.height}`);
	if (options.quality) query.set('q', `${options.quality}`);
	if (options.fit) query.set('fit', options.fit);
	if (options.blur) query.set('blur', `${options.blur}`);
	if (options.dpr) query.set('dpr', `${options.dpr}`);
	if (options.webp) query.set('webp', '1');
	if (options.avif) query.set('avif', '1');
	if (options.output) query.set('output', options.output);
	if (options.bg) query.set('bg', options.bg);
	if (options.interlace) query.set('il', '1');
	if (options.stripMetadata) query.set('n', '1');
	if (options.enlarge === false) query.set('we', '0'); // default is enlarge=true
	return `${WSRVBaseUrl}?${query}`;
}
export const frame = writable(0);
const mapping: Record<number, string> = new Array(6)
	.fill(null)
	.map((x, i) => Array(i).fill('.').join(''));
export const dots = derived(frame, (frame) => mapping[Math.abs(4 - (frame % 9)) + 1] ?? '.');
setInterval(() => {
	frame.update((x) => (x + 1) % 1000);
}, 500);
