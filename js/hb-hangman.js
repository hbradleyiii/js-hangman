/**
 * jsHangman JavaScript game
 *
 * Copyright (c) 2011, Harold Bradley III
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *     - Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     - Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *     - Neither the name of Harold Bradley III nor the names of its contributors may
 *       be used to endorse or promote products derived from this software without
 *       specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @package     jsHangman
 * @author      Harold Bradley III <harold@bradleystudio.net>
 * @copyright   2010  Harold Bradley III
 * @license     http://www.opensource.org/licenses/bsd-license.php BSD License
 * @version 0.1
 */

// CONSTANTS

    // FLAGS:
var INPLAY =                       0;
var INCORRECT =                    0;
var LOSE =                         0;
var CORRECT =                      1;
var WIN =                          2;
var GAMEREADY =                    4;
var GAMEOVER =                     8;

var ALREADY_GUESSED_INCORRECTLY =  64;
var ALREADY_GUESSED_CORRECTLY =    128;
var BAD_ARGUMENT =                 256;

///////////

/**
 * jsHangman
 *
 * Hangman game object.
 */
var jsHangman = {

    // NOTES
    //
    // change to an object return function see crockford
    //
    // change jsHangman back to THIS

    // jsHangman attributes and object variables

        // HTML elements
        // TODO clean names
    "elGameDIV":        document, // stores the root position of the Game div
    "elGallows":        document, // stores the element containing the gallows
    "elMissedLetters":  document, // store the element containing the missed letters
    "elStatus":         document, // stores the element containing the status
    "elLetters":        document, // stores the element containing the letters

        // Game Variables
    "word": "", // stores the word or phrase

    "correctLetterBuffer":   [" "], // stores the letters that have been revealed, and blanks for those that haven't
    "incorrectLetterBuffer": [" ", " ", " ",
                              " ", " ", " ",
                              " ", " ", " "], // stores the letters that have been guessed (used)

    "correctGuesses":      0, // stores the number of correct guesses that have been made
    "incorrectGuesses":    0, // stores the number of guesses that have been made; (pointer for the above buffer stack)
    "neededGuesses":       0, // stores the number of correct guesses needed to win
    "maxIncorrectGuesses": 9, // stores the maximum number of guesses; how long it takes to "hang the man"
                              // CANNOT exeed 9
    "gamePoints":          0, // accumalated game points

    "gameState": INPLAY, // contains the game's state

    /////////////////////////////////////////////

    /**
     * jsHangman(elGameDIV, maxIncorrectGuesses, word)   [Constructor]
     *
     * Initializes necessary variables, then starts a new game.
     *
     * elGameDIV             element that contains the root div of the game
     * maxIncorrectGuesses   integer 1-9 contains the number of guesses allowed
     * word                  string contains the word or phrase to begin the game
     */
    init: function(elGameDIV, maxIncorrectGuesses, word) {

        // set the game root html 'div'
        this.elGameDIV = elGameDIV;

        // Error checking for maxIncorrectGuesses
            if(maxIncorrectGuesses < 0){
                alert("INIT ERROR: maxIncorrectGuesses must be greater than zero.");
                // TODO: figure this return value out!!
                return false;
            } else if(maxIncorrectGuesses > 9){
                alert("INIT ERROR: maxIncorrectGuesses must be less than 10.");
                return false;
            }

        // set game maxIncorrectGuesses
        this.maxIncorrectGuesses = maxIncorrectGuesses;

        // set gamePoints
        this.gamePoints = 0;

        // start a new game
        this.newGame(word);

    },

    /**
     * newGame(word)
     *
     * Starts a new game: initializes variables and buffers, and sets up
     * the HTML elements
     *
     * word     string word or phrase used for the game
     */
    newGame: function(word) {

        var el; // temp element variable

        // Error checking for the word
        if (false){ // TODO: word error checking
            alert("newGame() ERROR: Word/Phrase is not valid for this game.");
            return false;
        }

        // Store the word
        this.word = word;

        // reset neededGuesses
        this.neededGuesses = 0;

        // fill correctLetterBuffer with blanks
        for (var i = 0, ii = word.length; i < ii; i++){
            this.correctLetterBuffer[i] = " ";
            if(this.word.charAt(i) != " "){this.neededGuesses++;} // letter is not a space
        }

        // reset incorrectLetterBufFer
        this.incorrectLetterBuffer = [" ", " ", " ",
                                           " ", " ", " ",
                                           " ", " ", " "];
        // reset incorrectGuesses
        this.incorrectGuesses = 0;

        // reset correctGuesses
        this.correctGuesses = 0;

        // Create the board:

        // 1. Clear the board of possible old contents
        this.removeChildren(this.elGameDIV);

        // 2. Create the gallows div
        this.elGallows = document.createElement("div");
        this.elGallows.className = "gallows";
        this.elGameDIV.appendChild(this.elGallows);

        // 3. Create the missed letters list
        this.elMissedLetters = document.createElement("ul");
        this.elMissedLetters.className = "missedLetters";
        this.elGameDIV.appendChild(this.elMissedLetters);
        for(i=0, ii=9; i<ii; i++){ // create 9 list elements
            el = document.createElement("li");
            this.elMissedLetters.appendChild(el);
        }

        // 4. Create the status box div
        this.elStatus = document.createElement("div");
        this.elStatus.className = "status";
        this.elGameDIV.appendChild(this.elStatus);
        this.showPoints(); // Start off showing points in status box

        // 5. Create the blanks list (account for spaces)
        this.elLetters = document.createElement("ul");
        this.elLetters.className = "letters";
        this.elGameDIV.appendChild(this.elLetters);
        for (var i = 0, ii = this.word.length; i < ii; i++){ // for the length of the word/phrase
            el = document.createElement("li");
            if(this.word.charAt(i) == " "){ // letter is a space
                el.className = "space";
            }
            this.elLetters.appendChild(el);
        }
        ////////////////

        return true;
    },

    /**
     * guessLetter(letter)
     *
     * Returns true if the guess is right, otherwise false.
     * Note that it is possbile to return false and not be
     * a wrong guess.
     *
     * letter   single character string to guess
     */
    guessLetter: function(letter) {

        // Test if the game is still going
        if(this.gameState & GAMEOVER){return false;} // Game has ended. No more guessing.

        // Test letter for proper contents
        if(false){ // TODO variable testing
            alert("guessLetter() ERROR: letter is incorrect format!");
            this.gameState |= BAD_ARGUMENT;
            return this.gameState;
        }

        this.gameState = INPLAY;

        // Test if the letter has already been guessed incorrectly
        if (this.isLetterAlreadyIncorrectlyGuessed(letter)){
            this.showStatusMsg('Letter has already been Guessed');
            this.gameState |= ALREADY_GUESSED_INCORRECTLY;
            return this.gameState;
        }

        // Test if the letter has already been guessed correctly
        if(this.isLetterAlreadyCorrectlyGuessed(letter)){
            this.showStatusMsg('Letter has already been Revealed');
            this.gameState |= ALREADY_GUESSED_CORRECTLY;
            return this.gameState;
        }

        // Test if letter is found in word and write it on the blank
        for (var i = 0, ii = this.word.length; i < ii; i++){
            if(this.word.charAt(i) == letter){ // letter is found here
                this.correctGuesses++; // Increment correct guesses counter; this will happen for every occurence of this letter
                this.correctLetterBuffer[i] = letter; // place in buffer
                this.elLetters.childNodes[i].appendChild(document.createTextNode(letter)); // write on board
                this.gameState = CORRECT; // set correct flag
            }
        }

        if(this.gameState & CORRECT){
            if(this.correctGuesses == this.neededGuesses){
                this.gamePoints++;
                this.gameState |= WIN;
                this.showStatusMsg('Win!!');
            }
        } else { // Incorrect guess
            this.incorrectGuesses++; // Increment incorrect guesses counter
            this.incorrectLetterBuffer[this.incorrectGuesses] = letter;
            //TODO: this sometimes gives wrong results ADD error checking here
            this.elMissedLetters.childNodes[this.incorrectGuesses].appendChild(document.createTextNode(letter));
            if(this.incorrectGuesses + 1 >= this.maxIncorrectGuesses){this.gameOver = true;}
            this.elGallows.className = "gallows" + this.incorrectGuesses;
        }

        return this.gameState; // Returns guess flag
    },

    /**
     * guessWord(word)
     *
     * Checks a guess for the word and changes the board
     * accordingly. Returns gameState.
     *
     * word     a string used to represent a guess for the word
     */
    guessWord: function(word) {
        // Test gameState
        if(this.gameState & GAMEOVER){return this.gameState;} // Game has ended. No more guessing.

        // Game is now over; phrase/word guess has been made
        this.gameState = GAMEOVER;

        // Test word
        if (word == this.word){ // word is correct
            // change the board
            this.gameState |= WIN;
        } else { // word is incorrect
            // change the board
            // reveal word
            this.showStatusMsg(("Sorry, " + word + " is not correct!")); // change statu
            this.elGallows.className = "gallows9"; // hang player
        }

        return this.gameState;
    },


    /**
     * showStatusMsg
     *
     * Changes the status to Msg then changes back to score after a time
     */
    showStatusMsg: function(msg) {
        this.removeChildren(this.elStatus); // clear previous entries
        this.elStatus.appendChild(document.createTextNode(msg));
        // TODO: Fix this:::
        setTimeout(jsHangman.showPoints, 2000);
    },

    /**
     * showBoard
     *
     * Shows or refreshes the board
     */
    showBoard: function() {
        //
    },

    /**
     * showHangman
     *
     * Shows another section of the hangman
     */
    showHangman: function() {

        //
    },

    /**
     * showEndGame
     *
     * Shows (animates) the end of the game
     */
    showEndGame: function(isWinner) {
        if(isWinner){ // Won Game
            //
        } else { // Lost Game
            //
        }
    },


    /**
     * showPoints()
     *
     * Shows the points on the status box
     */
    showPoints: function() {
        jsHangman.removeChildren(jsHangman.elStatus); // clear previous entries
        var el = document.createElement("div"); // create new div
        el.className = "score";
        jsHangman.elStatus.appendChild(el);
        el.appendChild(document.createTextNode(jsHangman.gamePoints));
    },

    /**
     * removeChildren(el)
     *
     * Removes all children elements for el
     *
     * el   the element with which to recursively remove child element
     */
    removeChildren: function(el) {
        for(i=0, ii=el.childNodes.length; i < ii; i++){
            el.removeChild(el.childNodes[0]); // removes the bottom of the stack, stack pushes downward
        }
    },

    /**
     * isLetterAlreadyIncorrectlyGuessed(letter)
     *
     * Returns true if letter has already been
     * incorrectly guessed, otherwise false.
     *
     * letter   string containing one character to test
     */
    isLetterAlreadyIncorrectlyGuessed: function(letter) {
        for (var i = 0, ii = this.incorrectGuesses; i < ii; i++) {
            if (letter == this.incorrectLetterBuffer[i]){return true;} // letter has been guessed incorrectly already
        }
        return false; // letter has not yet been guessed incorrectly
    },

    /**
     * isLetterAlreadyCorrectlyGuessed(letter)
     *
     * Returns true if letter has already been guessed
     * correctly, otherwise false.
     *
     * letter   string containing one character to test
     */
    isLetterAlreadyCorrectlyGuessed: function(letter) {
        for (var i = 0, ii = this.correctLetterBuffer.length; i < ii; i++) {
            if (letter == this.correctLetterBuffer[i]){return true;} // letter has been revealed already
        }
        return false; // letter has not yet been revealed
    }

};
