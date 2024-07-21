const errorAudio = new Audio('./sound/error.mp3')
const clickAudio = new Audio('./sound/click.mp3')

clickAudio.preload = 'auto'
errorAudio.preload = 'auto'

export function playClick() {
  clickAudio.currentTime = 0;
  clickAudio.play()
}

export function playStatus() {
  errorAudio.currentTime = 0;
  errorAudio.play()
}

// Word TTS
let audio = new Audio();
audio.volume = 0.5;
audio.addEventListener('canplaythrough', () => {
  audio.play()
});
export function speech(str) {
  audio.pause();
  audio.src = `http://dict.youdao.com/dictvoice?type=0&audio=${encodeURIComponent(str)}`;
}