"use strict";

var ctx;
var canvas;

var width, height, size, n, board;
var tileWidth, tileHeight;
var solved;

function renderTile(x, y, value) {
    ctx.roundRect(x * tileWidth + 5, y * tileHeight + 5, tileWidth - 10, tileHeight - 10, 10);
    ctx.fillText("" + value, x * tileWidth + (tileWidth / 2.0), y * tileHeight + (tileHeight / 2.0));
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for (var i = 0; i < size; i++) {
        if (board[i] != 0) {
            renderTile(i % width, Math.floor(i / width), board[i]);
        }
    }
    if (solved) {
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = "#031113";
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - 150, canvas.height / 2 - 40, 300, 80, 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#c0d0cc";
        
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - 130, canvas.height / 2 - 40, 260, 80, 10);
        ctx.fillText("Solved!", canvas.width / 2, canvas.height / 2);
    }
    ctx.closePath();
    ctx.stroke();
}

function checkWin() {
    for (var i = 0; i < n; i++) {
        if (board[i] != i + 1) {
            return false;
        }
    }

    console.log("WIN!");
    solved = true;
    return true;
}

function findEmptyPosition() {
    for (var i = 0; i < size; i++) {
        if (board[i] == 0) {
            return i;
        }
    }
    return null;
}
    
function swap(index) {
    if (index < 0 || index >= size) {
        console.log("Index out of bounds");
        return;
    }

    let emptyPosition = findEmptyPosition();

    //  check if the selected tile is adjacent to the empty position
    let offset = Math.abs(emptyPosition - index);
    if (offset != 1 && offset != width) {
        console.log("Invalid position");
        return;
    }

    //  swap
    board[emptyPosition] = board[index];
    board[index] = 0;

    solved = false;
    checkWin();

    requestAnimationFrame(render);
}

function solve() {
    for (var i = 0; i < size - 1; i++) {
        board[i] = i + 1;
    }
    board[n] = 0;

    requestAnimationFrame(render);
}

function sleep(ms) {
    const DEF_DELAY = 1000;

    return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}

function countMisplaceTiles() {
    var misplaced = 0;

    for (var i = 0; i < size - 1; i++) {
        if (board[i] != i + 1) {
            misplaced++;
        }
    }

    return misplaced;
}

async function munge() {
    solved = false;

    let dir;
    let last = -1;

    let emptyPosition = findEmptyPosition();

    let count = 0;
    while (count < 100 || countMisplaceTiles() == 0) {
        do
            dir = Math.floor(Math.random() * 4);
        while (Math.abs(dir - last) == 2);

        let index;
        switch (dir) {
            case 0: index = emptyPosition - width; break;
            case 1: index = emptyPosition + 1; break;
            case 2: index = emptyPosition + width; break;
            case 3: index = emptyPosition - 1; break;
            default: break;
        }

        if (index >= 0 && index < size) {
            let okay = true;

            if (dir == 1 || dir == 3) {
                if (Math.floor(index / width) != Math.floor(emptyPosition / width)) {
                    okay = false;
                }
            }

            if (okay) {
                swap(index);
                emptyPosition = index;
                last = dir;
                count++;
                requestAnimationFrame(render);
                await sleep(25);
            }
        }
    }
}

function setSize(boardSize) {
    switch (boardSize) {
        case "3x3": width = 3; height = 3; break;
        case "4x4": width = 4; height = 4; break;
        case "5x5": width = 5; height = 5; break;
        default: break;
    }

    size = width * height;
    n = size - 1;
    board = [size];

    tileWidth = canvas.width / width;
    tileHeight = canvas.height / height;

    for (var i = 0; i < size - 1; i++) {
        board[i] = i + 1;
    }
    board[n] = 0;
    solved = false;

    requestAnimationFrame(render);
    document.getElementById("canvas").focus();

    document.getElementById("size").value = boardSize;
}

function handleSizeChange() {
    setSize(document.getElementById("size").value);
}

function handleKeyPress(event) {
    let emptyPosition = findEmptyPosition();
    
    switch (event.key) {
        case "ArrowUp":
            swap(emptyPosition + width);
            break;
        case "ArrowDown":
            swap(emptyPosition - width);
            break;
        case "ArrowLeft":
            if (emptyPosition % width < width - 1) {
                swap(emptyPosition + 1);
            }
            break;
        case "ArrowRight":
            if (emptyPosition % width != 0) {
                swap(emptyPosition - 1);
            }
            break;
        case "m":
        case "M":
            munge();
            break;
        case "s":
        case "S":
            solve();
            break;
        default:
            return;
    }
}

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#c0d0cc";
    ctx.strokeStyle = "#c0d0cc";

    addEventListener("click", (event) => {
        if (solved) {
            munge();
        } else {
            let canvasRect = canvas.getBoundingClientRect();
            let tileX = Math.floor((event.clientX - canvasRect.left) / tileWidth);
            let tileY = Math.floor((event.clientY - canvasRect.top) / tileHeight);

            if (tileX >= 0 && tileX < width && tileY >= 0 && tileY < height) {
                swap(tileY * width + tileX);
            }
        }
    });

    document.addEventListener("keydown", handleKeyPress);

    window.addEventListener("unload", function(e){
        localStorage.setItem("board", JSON.stringify(board));
    });

    var serialized = localStorage.getItem("board");
    if (serialized) {
        var deserialized = JSON.parse(serialized);
        var boardSize = Math.floor(Math.sqrt(deserialized.length));
        setSize(boardSize + "x" + boardSize);
        board = deserialized;
    } else {
        setSize("4x4");
    }

    solved = false;
}

