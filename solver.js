function heuristic(board, n) {
    let distance = 0;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === 0) {
            //  skip empty space
            continue;
        }
        const targetRow = Math.floor((board[i] - 1) / n);
        const targetCol = (board[i] - 1) % n;
        const currentRow = Math.floor(i / n);
        const currentCol = i % n;
        distance += Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol);
    }
    return distance;
}

function findPath(board) {
    const n = Math.sqrt(board.length);
    const goal = Array.from({ length: n * n }, (_, i) => (i + 1) % (n * n));
    
    function isSolved(board) {
        return board.every((value, index) => value === goal[index]);
    }

    function neighbors(board) {
        const zeroIndex = board.indexOf(0);
        const row = Math.floor(zeroIndex / n);
        const col = zeroIndex % n;
        const moves = [];

        const directions = [
            [-1, 0],    //  up
            [1, 0],     //  down
            [0, -1],    //  left
            [0, 1],     //  right
        ];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < n && newCol >= 0 && newCol < n) {
                const newIndex = newRow * n + newCol;
                const newBoard = board.slice();
                [newBoard[zeroIndex], newBoard[newIndex]] = [newBoard[newIndex], newBoard[zeroIndex]];
                moves.push({ board: newBoard, move: newIndex });
            }
        }

        return moves;
    }

    function search(path, g, threshold) {
        const node = path[path.length - 1];
        const f = g + heuristic(node.board, n);

        if (f > threshold) {
            return f;
        }
        if (isSolved(node.board)) {
            return true;
        }

        let min = Infinity;
        for (const neighbor of neighbors(node.board)) {
            //  avoid cycles
            if (path.some(prev => prev.board.toString() === neighbor.board.toString())) {
                continue;
            }
            path.push(neighbor);
            const result = search(path, g + 1, threshold);
            if (result === true) {
                return true;
            }
            if (result < min) {
                min = result;
            }
            path.pop();
        }
        return min;
    }

    let threshold = heuristic(board, n);
    const path = [{ board, move: null }];   //  root has no move

    while (true) {
        const result = search(path, 0, threshold);
        if (result === true) {
            //  extract move sequence
            return path.slice(1).map(node => node.move);    //  exclude initial state
        }
        if (result === Infinity) {
            //  no solution
            return null;
        }
        threshold = result;
    }
}

