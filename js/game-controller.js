
// words[]; has words in it
//

elm = document.getElementById("test")
jsHangman.init(elm, 9, 'MY NEW WORD'); // Do your thing

window.addEventListener('keydown', function(event) {

    var letter = String.fromCharCode(event.keyCode)
    letter = letter.toUpperCase();
    if ((letter.charCodeAt(0) > 64) && (letter.charCodeAt(0) < 91)){
        jsHangman.guessLetter(letter);
    }

}, false);
