var audio = document.getElementById('audio');
var isPlaying = false;

$('.btn-play-music').click(function(){
    $(this).toggleClass('pause');
    $(this).parent('.music-box').toggleClass('playing');
    $(this).find('.fa').toggleClass('fa-pause');
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play();
    }
});
audio.onplaying = function() {
  isPlaying = true;
};
audio.onpause = function() {
  isPlaying = false;
};
