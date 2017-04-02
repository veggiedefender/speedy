//This closure makes the minifier happy
(function() {
    //caching selectors for dubious performance gains
    //and less typing
    function id(i) {
        return document.getElementById(i);
    }
    textBox = id("textbox");
    wpmSelect = id("wpm");
    left = id("left");
    middle = id("middle");
    right = id("right");
    exit = id("exit");
    progress = id("progress");
    readerView = id("readerView");
    pausePlayIcon = id("pauseIcon");
    uploadIcon = id("uploadIcon");

    textBox.focus();

    var paused;
    var wpm;
    var timeout;
    var text;
    var i;
    function displayText() {
        text = text.trim().split(/\s+/);
        var interval = 60 / wpm * 1000;
        paused = false;
        i = 0;
        function displayLoop() {
            interval = 60 / wpm * 1000;
            if (!paused) {
                setWord(text[i]);            
                setProgress(i);
                progress.style.transition = "width " + interval + "ms linear";
                i++;
            }
            if (i >= text.length) {
                i = 0;
                paused = true;
                pausePlayIcon.innerText = "replay";
            }
            timeout = setTimeout(displayLoop, interval);
        }
        displayLoop();
    }

    function setWord(text) {
        var mid = text.length / 2;
        leftChars = text.substring(0, mid);
        rightChars = text.substring(mid, text.length);
        midChars = rightChars[0];
        rightChars = rightChars.substring(1);

        left.innerText = leftChars;
        middle.innerText = midChars;
        right.innerText = rightChars;
    }

    function hide(element) {
        element.style.visibility = "hidden";
        element.style.opacity = 0;
    }
    function show(element) {
        element.style.visibility = "visible";
        element.style.opacity = 1;
    }
    function setProgress(i) {
        progress.style.width = (1.0 * i / (text.length - 1) * 100) + "%";
    }

    start.onclick = function() {
        show(readerView);
        textBox.style.filter = "blur(6px)";
        textbox.style["user-select"] = "none";
        hide(start);
        clearTimeout(timeout);
        wpm = parseInt(wpmSelect.value);
        text = textBox.value;
        displayText();
    }
    exit.onclick = function() {
        hide(readerView);
        textBox.style.filter = "";
        textbox.style["user-select"] = "auto";
        textbox.focus();
        show(start);
    }

    id("pauseplay").onclick = togglePause;
    document.body.onkeyup = function(e){
        if(e.keyCode == 32){
            togglePause();
        }
    }
    function togglePause() {
        wpm = parseInt(wpmSelect.value);
        if (paused) {
            paused = false;
            pausePlayIcon.innerText = "pause";
        } else {
            paused = true;
            pausePlayIcon.innerText = "play_arrow";
        }
    }

    wpmSelect.onchange = function() {
        wpm = parseInt(wpmSelect.value);
    }

    function listen(event, callback) {
        document.addEventListener(event, callback)
    }

    var progressTotal = id("progress-total");
    progressTotal.addEventListener("mousedown", scrubber);
    progressTotal.addEventListener("touchstart", scrubber);
    function scrubber(e) {
        scrub(e);
        listen("mouseup", unscrub);
        listen("touchend", unscrub)
        listen("mousemove", scrub);
        listen("touchmove", scrub);
    }
    function scrub(e) {
        if (e.touches) {
            posX = e.touches[0].clientX;
        } else {
            posX = e.clientX;
        }
        bound = progressTotal.getBoundingClientRect();
        i = Math.round((posX - bound.left) / (bound.width) * (text.length - 1));
        if (i < 0) {
            i = 0;
        } else if (i > text.length - 1) {
            i = text.length - 1;
        }
        paused = true;
        pausePlayIcon.innerText = "play_arrow";
        setWord(text[i]);
        setProgress(i);
        progress.style.transition = "";
    }
    function unscrub(e) {
        document.removeEventListener("mousemove", scrub);
        document.removeEventListener("touchmove", scrub);
        return false;
    }

    textBox.ondragover = function(event) {
        dt = event.dataTransfer;
        //check if dragged item is a file
        //this handy conditional copied from some stackoverflow post
        if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('Files'))) {
            event.preventDefault();
            event.stopPropagation();
            textBox.classList.add("dragging");
            uploadIcon.classList.add("dragging-upload");
      }
    };
    textBox.ondragleave = function(event) {
        event.preventDefault();  
        event.stopPropagation();
        textBox.classList.remove("dragging");
        uploadIcon.classList.remove("dragging-upload");
    };
    textBox.ondrop = function(event) {
        event.preventDefault();  
        event.stopPropagation();
        file = event.dataTransfer.files[0];

        var reader = new FileReader();
        reader.onload = function(e) {
            var contents = e.target.result;
            textBox.value = contents
            textBox.classList.remove("dragging");
            uploadIcon.classList.remove("dragging-upload");
        }
        reader.readAsText(file);    
    };
})();