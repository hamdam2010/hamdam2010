const board = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

const chessBoard = document.getElementById('chessBoard');
let selected = null;
let selPos = null;
let whiteTurn = true;
let moveHints = [];

const pieceImages = {
  'P': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Chess_plt60.png',
  'R': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Chess_rlt60.png',
  'N': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Chess_nlt60.png',
  'B': 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Chess_blt60.png',
  'Q': 'https://upload.wikimedia.org/wikipedia/commons/4/49/Chess_qlt60.png',
  'K': 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Chess_klt60.png',
  'p': 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Chess_pdt60.png',
  'r': 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Chess_rdt60.png',
  'n': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Chess_ndt60.png',
  'b': 'https://upload.wikimedia.org/wikipedia/commons/8/81/Chess_bdt60.png',
  'q': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Chess_qdt60.png',
  'k': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Chess_kdt60.png'
};

function createBoard() {
  chessBoard.innerHTML = '';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      sq.className = 'square ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
      const piece = board[r][c];

      if (piece) {
        const img = document.createElement('div');
        img.className = 'piece';
        if (pieceImages[piece]) {
          img.style.backgroundImage = `url(${pieceImages[piece]})`;
        } else {
          img.textContent = piece;
        }
        sq.appendChild(img);
      }

      if (moveHints.some(pos => pos.r === r && pos.c === c)) {
        const hint = document.createElement('div');
        hint.className = 'hint';
        sq.appendChild(hint);
      }

      sq.addEventListener('click', () => onClick(r, c, sq));
      chessBoard.appendChild(sq);
    }
  }
}

function onClick(r, c, sq) {
  const piece = board[r][c];

  if (selected) {
    if (moveHints.some(pos => pos.r === r && pos.c === c)) {
      board[r][c] = selected;
      board[selPos.r][selPos.c] = '';
      whiteTurn = !whiteTurn;
    }
    selected = null;
    selPos = null;
    moveHints = [];
    createBoard();
    return;
  }

  if (piece && ((whiteTurn && isUpperCase(piece)) || (!whiteTurn && isLowerCase(piece)))) {
    selected = piece;
    selPos = { r, c };
    moveHints = getMoves(r, c, piece);
    createBoard();
    const index = r * 8 + c;
    chessBoard.children[index].classList.add('selected');
  }
}

function getMoves(r, c, piece) {
  const lower = piece.toLowerCase();
  switch(lower) {
    case 'p': return getPawnMoves(r, c, piece);
    case 'r': return getRookMoves(r, c, piece);
    case 'n': return getKnightMoves(r, c, piece);
    case 'b': return getBishopMoves(r, c, piece);
    case 'q': return getQueenMoves(r, c, piece);
    case 'k': return getKingMoves(r, c, piece);
  }
  return [];
}

function getPawnMoves(r, c, piece) {
  const dir = piece === 'P' ? -1 : 1;
  const moves = [];

  // Oldinga 1 qadam
  if (inBounds(r + dir, c) && board[r + dir][c] === '') {
    moves.push({r: r + dir, c});
    // Boshlanish pozitsiyasidan 2 qadam
    if ((piece === 'P' && r === 6) || (piece === 'p' && r === 1)) {
      if (board[r + 2 * dir][c] === '') {
        moves.push({r: r + 2 * dir, c});
      }
    }
  }

  // Diagonal urish
  for (let dc of [-1, 1]) {
    const nr = r + dir, nc = c + dc;
    if (inBounds(nr, nc) && board[nr][nc] !== '' && isOpponentPiece(board[nr][nc], piece)) {
      moves.push({r: nr, c: nc});
    }
  }

  return moves;
}

function getRookMoves(r, c, piece) {
  return getLineMoves(r, c, piece, [[1,0],[-1,0],[0,1],[0,-1]]);
}

function getBishopMoves(r, c, piece) {
  return getLineMoves(r, c, piece, [[1,1],[1,-1],[-1,1],[-1,-1]]);
}

function getQueenMoves(r, c, piece) {
  return getLineMoves(r, c, piece, [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);
}

function getKingMoves(r, c, piece) {
  const moves = [];
  const deltas = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  for (let [dr, dc] of deltas) {
    let nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc)) {
      if (board[nr][nc] === '' || isOpponentPiece(board[nr][nc], piece)) {
        moves.push({r: nr, c: nc});
      }
    }
  }
  return moves;
}

function getKnightMoves(r, c, piece) {
  const moves = [];
  const deltas = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
  for (let [dr, dc] of deltas) {
    let nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc)) {
      if (board[nr][nc] === '' || isOpponentPiece(board[nr][nc], piece)) {
        moves.push({r: nr, c: nc});
      }
    }
  }
  return moves;
}

function getLineMoves(r, c, piece, directions) {
  const moves = [];
  for (const [dr, dc] of directions) {
    let nr = r + dr;
    let nc = c + dc;
    while(inBounds(nr, nc)) {
      if (board[nr][nc] === '') {
        moves.push({r: nr, c: nc});
      } else {
        if (isOpponentPiece(board[nr][nc], piece)) {
          moves.push({r: nr, c: nc});
        }
        break;
      }
      nr += dr;
      nc += dc;
    }
  }
  return moves;
}

function isOpponentPiece(target, current) {
  if (target === '') return false;
  return (isUpperCase(current) !== isUpperCase(target));
}

function isUpperCase(ch) {
  return ch === ch.toUpperCase();
}

function isLowerCase(ch) {
  return ch === ch.toLowerCase();
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

createBoard();
