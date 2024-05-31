"use strict";

const playBtn = document.querySelector(".visually-hidden");
const label = document.querySelector(".label");
const audio = document.querySelector(".audio");
const video = document.querySelector(".video");

playBtn.addEventListener("click", function (e) {
	if (e.target.checked) {
		video.play();
		label.innerHTML = "pause";
		label.classList.remove("move");
		label.classList.add("back");
	} else {
		video.pause();
		label.innerHTML = "play";
		label.classList.add("move");
		label.classList.remove("back");
	}
});
