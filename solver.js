// https://codereview.stackexchange.com/questions/108582/my-15-puzzle-solver-is-too-slow

//  2024.03.06/aStar1A.js

function heuristic(board) {
    return 0;
}

class Node {
    constructor(board, parent) {
        this.board = board;
        this.parent = parent;
        
        this.g = 0;  //  cost from start
        this.h = heuristic(board);
        this.f = this.g + this.h; //  total estimated cost
    }
}

function findPath(board) {
    var size = board.length;
    var dim = Math.floor(Math.sqrt(size));

    var endNode = [size];
    for (var i = 0; i < size - 1; i++) {
        endNode[i] = i + 1;
    }
    endNode[size - 1] = 0;
    
    const openSet = [];     //  nodes yet to be evaluated
    const closedSet = [];   //  already evaluated nodes

    //  push start node
    openSet.push(new Node(board, null));

    while (openSet.length > 0) {
        //  get the node with the lowest f cost
        let currentNode = openSet.reduce((min, node) =>
            node.f < min.f ? node : min
        );
        const currentIndex = openSet.indexOf(currentNode);
        openSet.splice(currentIndex, 1);
        closedSet.push(currentNode);

        //  check if goal reached
        if (currentNode.board.every((value, index) => value === endNode[index])) {
            return reconstructPath(currentNode);
        }

        //  check neighbors
        
        //  var neighbors = node.getNeighbors();
        //  for every neighbor...
/*
                // Skip if already evaluated
                if (closedSet.some((node) => node.x === neighborX && node.y === neighborY)) {
                    continue; 
                }

                const tentativeG = currentNode.g + 1; // Cost to reach neighbor is 1

                let neighbor = openSet.find(
                    (node) => node.x === neighborX && node.y === neighborY
                );
                if (!neighbor || tentativeG < neighbor.g) {
                    neighbor = new Node(neighborX, neighborY, currentNode);
                    neighbor.g = tentativeG;
                    neighbor.f = neighbor.g + heuristic(neighborX, neighborY);
                    openSet.push(neighbor);
                }
*/
        
    }

    return null;    //  no path found
}

// Helper to reconstruct the path
function reconstructPath(node) {
    const path = [];
    while (node) {
        path.push({ board: node.board });
        node = node.parent;
    }
    return path.reverse();
} 


