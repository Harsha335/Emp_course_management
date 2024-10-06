// globals.d.ts
interface HTMLElement {
    webkitRequestFullscreen?(): Promise<void>; // Safari
    mozRequestFullScreen?(): Promise<void>; // Firefox
    msRequestFullscreen?(): Promise<void>; // IE/Edge
}