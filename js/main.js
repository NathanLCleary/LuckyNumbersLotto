$ = function(id) {
    return document.getElementById(id)
}


Totalwinnings = 0;
jackpot = 0;
var options = new Array;
var matches = 0;

function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

startGame = function() {
    $("result").innerHTML = "<div id='ball1'></div><div id='ball2'></div><div id='ball3'></div><div id='ball4'></div>" +
        "<div id='ball5'></div><div id='ball6'></div><div id='ball7'></div>"
    $("result").style.paddingTop = "0px"
    $("winnings").style.color = "red";
    jackpot = ((Math.random() * 100000000) + 10000);
    jackpot = jackpot.toFixed(0);
    var jackpotString = addCommas(jackpot);
    $("jackpot").innerHTML = jackpotString;
    for (i = 1; i <= 7; i++) {
        var n = "ball" + i;
        var option = (Math.random() * 38 + 1).toFixed(0);
        if (options.length != 0) {
            for (j = 0; j <= 6; j++) {
                if (options[j] == option) {
                    option = (Math.random() * 38 + 1).toFixed(0);
                } else if (j >= 6) {
                    options.push(option);
                    $(n).innerHTML = option;
                }
            }
        } else {
            options.push(option);
            $(n).innerHTML = option;
        }
    }
    console.log("bot: " + options)
    playerBalls = new Array;
    playerBalls.push(parseInt($("pBall1").value));
    playerBalls.push(parseInt($("pBall2").value));
    playerBalls.push(parseInt($("pBall3").value));
    playerBalls.push(parseInt($("pBall4").value));
    playerBalls.push(parseInt($("pBall5").value));
    playerBalls.push(parseInt($("pBall6").value));
    console.log("player: " + playerBalls)
    for (o = 0; o < 5; o++) {
        if (playerBalls[o] <= 0 || playerBalls[o] >= 40) {
            alert("Youre ticket was invalid in the draw as one or more entered values was not a valid numerical value between 1 and 39");
        }
        if (isNaN(playerBalls[o])) {
            alert("Your tickets must contain numbers");
            options = [];
            return;
        }
    }
    for (k = 0; k <= 5; k++) {
        for (l = 0; l <= 6; l++) {
            if (playerBalls[k] == options[l]) {
                matches++;
            }
        }
    }
    playerBalls = [];
    options = [];
    console.log("Matches: " + matches);
    winGame();
}
winGame = function() {
    console.log("jackpot: " + jackpot);
    if (matches == 1) {
        winnings = jackpot / 10;
    } else if (matches == 2) {
        winnings = jackpot / 30;
    } else if (matches == 3) {
        winnings = jackpot / 50;
    } else if (matches == 4) {
        winnings = jackpot / 70;
    } else if (matches == 5) {
        winnings = jackpot / 90;
    } else if (matches == 6) {
        winnings = jackpot;
    } else {
        winning = 0;
    }
    if (winnings > 5000000) {
        winnings = winnings - 2500000;
    }
    if (winnings == 0) {
        winnings = -2500000;
    }
    console.log("round Winnings: " + winnings);
    Totalwinnings = parseInt(Totalwinnings + winnings);
    var TotalwinningsString = addCommas(Totalwinnings);
    console.log("Total: " + Totalwinnings);
    $("winnings").innerHTML = TotalwinningsString;
    if (matches > 0) {
        $("winnings").style.color = "green";
    }
    $("match").innerHTML = matches;
    matches = 0;
    winnings = 0;
}