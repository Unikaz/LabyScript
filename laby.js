const controls = document.getElementById("controls");
const pad = document.getElementsByClassName("pad")[0];
const moves = document.getElementsByClassName("moves")[0];
const app = document.getElementById("app");

app.parentNode.removeChild(app);
document.body.appendChild(app);
controls.parentNode.removeChild(controls);
document.body.appendChild(controls);

document.body.style.backgroundColor = "#312f2c"
app.style.backgroundColor = "#312f2c"
controls.style.backgroundColor = "#312f2c"

controls.style.position = "fixed";
controls.style.bottom = "0"
controls.style.margin = "10px"
controls.style.width = "calc(100% - 20px)"
controls.style.border = "0"
controls.className = ""

pad.style.position = "absolute";
pad.style.transform = "scale(0.5) translate(50%,50%)"
pad.style.bottom = "0";
pad.style.right = "0";
pad.style.backgroundColor = "rgba(0,0,0,0.5)";
pad.style.borderRadius = "50%";
// pad.style.margin="10px";


moves.style.position = "absolute";
moves.style.left = "0";
moves.style.bottom = "0";
moves.style.backgroundColor = "argb(0.5, 0,0,0)"


app.style.position = "absolute";
app.style.left = "50%"
app.style.top = "50%"
app.style.transform = "translate(-50%, -50%)"


function checkMoves() {
    if (moves.innerHTML === "") {
        setTimeout(checkMoves, 0)
    } else if (moves.innerHTML === "Aucun déplacement restant2") {
        controls.style.display = "none"
    }
}

checkMoves();
// Zoom
let zoom = 1;
document.body.addEventListener("wheel", function (event) {
    let force = event.deltaY;
    if (event.deltaMode === 0)
        force *= 1 / 20
    zoom += (-0.1 * force) * zoom;
    if (zoom <= 0.01)
        zoom = 0.01
    app.style.transform = "translate(-50%, -50%) scale(" + zoom + ")";
})

// move
let isDown = false;
let offset;
document.addEventListener('mousedown', function (e) {
    isDown = true;
    offset = [
        app.offsetLeft - e.clientX,
        app.offsetTop - e.clientY
    ];
}, true);

document.addEventListener('mouseup', function () {
    isDown = false;
}, true);

document.addEventListener('mousemove', function (event) {
    event.preventDefault();
    if (isDown) {
        let mousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        app.style.left = (mousePosition.x + offset[0]) + 'px';
        app.style.top = (mousePosition.y + offset[1]) + 'px';
    }
}, true);

//======================================================================================================================
// multiple users
//======================================================================================================================

function multipleUsers() {
    let users = document.getElementsByClassName("user");
    let posMap = {}
    for (let i = 0; i < users.length; i++) {
        if (posMap[users[i].style.gridArea] === undefined)
            posMap[users[i].style.gridArea] = []
        posMap[users[i].style.gridArea].push(users[i])
    }
    for (let k in posMap) {
        if (posMap[k].length > 1) {
            let width = Math.ceil(Math.sqrt(posMap[k].length));
            let scale = 1 / width;
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < width && i * width + j < posMap[k].length; j++) {
                    posMap[k][i * width + j].style.transform = "scale(" + scale + ") translate(" +
                        (((j / width) * 200 - 100) + 100 / width) * 1.2 + "%, " +
                        (((i / width) * 200 - 100) + 100 / width) * 1.2 + "%)"
                    posMap[k][i * width + j].children[0].style.margin = "0"
                }
            }
        }
    }
}

setTimeout(multipleUsers, 1000)

//================================================================================================================================================
//   Pathfinder
//================================================================================================================================================
const Moves = {
    UP: "UP",
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT",
}
const tilesMoves = {
    0: [],
    1: [Moves.UP, Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    2: [Moves.UP, Moves.LEFT, Moves.RIGHT],
    3: [Moves.UP, Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    4: [Moves.DOWN, Moves.RIGHT],
    5: [Moves.UP, Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    6: [Moves.DOWN, Moves.LEFT],
    7: [Moves.UP, Moves.DOWN, Moves.LEFT],
    8: [Moves.LEFT],
    9: [Moves.UP, Moves.DOWN, Moves.RIGHT],
    10: [Moves.UP, Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    11: [Moves.UP, Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    12: [Moves.UP, Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    13: [Moves.UP, Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    14: [Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    15: [Moves.UP, Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    16: [Moves.UP, Moves.RIGHT],
    17: [Moves.UP, Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    18: [Moves.UP, Moves.LEFT],
    19: [Moves.DOWN, Moves.RIGHT],
    20: [Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    21: [Moves.DOWN, Moves.LEFT],
    22: [Moves.DOWN],
    23: [Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    24: [Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    25: [Moves.UP, Moves.DOWN, Moves.RIGHT],
    26: [Moves.UP, Moves.DOWN, Moves.LEFT, Moves.RIGHT],
    27: [Moves.UP, Moves.DOWN, Moves.LEFT],
    28: [Moves.UP, Moves.DOWN],
    29: [Moves.UP, Moves.LEFT, Moves.RIGHT],
    30: [Moves.UP, Moves.LEFT, Moves.RIGHT],
    31: [Moves.UP, Moves.RIGHT],
    32: [Moves.UP, Moves.LEFT, Moves.RIGHT],
    33: [Moves.UP, Moves.LEFT],
    34: [Moves.UP],
    35: [Moves.RIGHT],
    36: [Moves.LEFT, Moves.RIGHT]
}

let selStart = "";
let selEnd = "";

// function addPathfinderButton(){
//     let div = document.createElement("div");
//     div.style.borderRadius = "50%"
//     div.style.width = "30px"
//     div.style.height = "30px"
//     div.style.position = "absolute"
//     div.style.top = "10px"
//     div.style.right = "10px"
//     div.addEventListener("click", pathfinder)
//     document.appendChild(div);
// }

let cells = [...app.children].filter(c => !c.classList.contains("user"))
cells.forEach(c => c.classList.add("cell"))
for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener("mouseenter", cellHover)
}
const maxValue = 99999999999999999999999999999;
function pathfinder() {
    try {
        document.getElementsByClassName("sel-start")[0].classList.remove("sel-start");
        document.getElementsByClassName("sel-end")[0].classList.remove("sel-end");
    } catch (e) {
    }
    cells.forEach(c => {
        c.classList.remove("path");
        c.classList.remove("search-path");
        c.dataset.value = maxValue+"";
    })
    selStart = null;
    selEnd = "";
}

function addCss(entry) {
    let head = document.getElementsByTagName("style")[0];
    head.innerText += entry;
}

addCss(".sel-start{box-shadow: inset 0 0 10px lime;}");
addCss(".sel-end{box-shadow: inset 0 0 10px red; }");
addCss(".path{box-shadow: inset 0 0 10px yellow;}");
addCss(".search-path{box-shadow: inset 0 0 10px white; transition-duration: 500ms}");
addCss(".user{pointer-events: none;}");
addCss(".cell:not(.sel-start), .cell:not(.sel-end){ transition-duration: 1000ms;}");
addCss(".no-duration{ transition-duration: 0ms !important;}");

let target = null;

// document.addEventListener("mousemove", function(event){


function cellHover(event) {
    // console.log("hover")
    if (event.target.classList.contains("user"))
        return;
    if (selStart != null && selEnd != null)
        return;
    let style = selStart === null ? "sel-start" : "sel-end";
    if (target !== null) {
        target.classList.remove(style);
        target.classList.remove("no-duration");
    }
    target = event.target;
    if (target.parentNode.id !== "app") {
        target = null;
        return;
    }
    target.classList.add(style);
    target.classList.add("no-duration");
}

setTimeout(setClickOnCells, 1000);

function setClickOnCells() {
    console.log("set " + app.children.length)
    for (let i = 0; i < app.children.length; i++) {
        app.children[i].addEventListener("click", function (event) {
            if (event.currentTarget.classList.contains("sel-start")) {
                console.log("sel")
                selStart = event.currentTarget;
                target = null;
                selEnd = null;
            } else if (event.currentTarget.classList.contains("sel-end")) {
                selEnd = event.currentTarget;
                processPath();
            }
        })
    }
}

function processPath() {
    let endCoords = getCoords(selEnd);
    let startCoords = getCoords(selStart)
    selStart.dataset.value = "0";
    let queue = [selStart]
    // caculate cells
    while (queue.length > 0) {
        let currentCell = queue.pop();
        currentCell.classList.add("search-path")
        let currentValue = parseInt(currentCell.dataset.value);
        let coords = getCoords(currentCell);
        let moves;
        for (let i = 0; i < currentCell.classList.length; i++) {
            if (tilesMoves.hasOwnProperty(currentCell.classList[i])) {
                moves = tilesMoves[currentCell.classList[i]];
            }
        }
        for (let i = 0; i < moves.length; i++) {
            // on récup la case
            let neighbour = getNeighbour(coords.x, coords.y, moves[i]);
            let neighbourValue = neighbour.dataset.value
            if (neighbourValue === undefined || parseInt(neighbourValue) > currentValue) {
                if (neighbour.classList.contains("0")) {
                    neighbour.dataset.value = 99999999;
                } else {
                    neighbour.dataset.value = (currentValue + 1);
                    queue.push(neighbour)
                }
            }
        }
    }
    // back path
    let currentCoords = endCoords;
    let currentCell = selEnd;
    let j = 0;
    while (!equalCoords(startCoords, currentCoords) && j < 20000) {
        j++;
        let moves;
        for (let i = 0; i < currentCell.classList.length; i++) {
            if (tilesMoves.hasOwnProperty(currentCell.classList[i])) {
                moves = tilesMoves[currentCell.classList[i]];
            }
        }
        let minValue = 1000000;
        let bestCell;
        for (let i = 0; i < moves.length; i++) {
            let cell = getNeighbour(currentCoords.x, currentCoords.y, moves[i]);
            let cellValue = cell.dataset.value;
            if (cellValue !== undefined && parseInt(cellValue) < minValue) {
                minValue = parseInt(cellValue);
                bestCell = cell;
            }
        }
        bestCell.classList.add("path");
        currentCoords = getCoords(bestCell);
        currentCell = bestCell;
    }
    console.log("Total moves needed: " + j);
    selStart.classList.remove("path")
    setTimeout(function () {
        cells.forEach(c => c.classList.remove("search-path"));
    }, 500)

}

let width = mapData.width;

function equalCoords(coords1, coords2) {
    return coords1.x === coords2.x && coords1.y === coords2.y;
}

function getCoords(cell) {
    let index = $(cell).index();
    let y = index % width;
    let x = Math.floor(index / width);
    return {x: x, y: y};
}

function getNeighbour(x, y, direction) {
    switch (direction) {
        case Moves.UP:
            if (x <= 0)
                return undefined;
            return getCellAt(x - 1, y);
        case Moves.DOWN:
            if (x >= mapData.height)
                return undefined;
            return getCellAt(x + 1, y);
        case Moves.LEFT:
            if (y <= 0)
                return undefined;
            return getCellAt(x, y - 1);
        case Moves.RIGHT:
            if (y >= width)
                return undefined;
            return getCellAt(x, y + 1);
    }
}

function getCellAt(x, y) {
    let index = x * width + y;
    return app.children[index]
}


pathfinder()