window.overload = function(){
    var video = document.getElementById("urvid");
    var btn = document.getElementById("pause_button");

    btn.onclick = function(){
        if(video.paused){
            video.onplay();
            btn.innerHTML ="pause";
        }else{
            video.pause();
            btn.innerHTML = "Play";
        }
    }
}