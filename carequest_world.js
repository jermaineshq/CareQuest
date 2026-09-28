const CQWorld = function () {

  // The map stays at 20 by 11 tiles. CSS scales up the small canvas.
  const TILE_SIZE = 16;
  const MAP_COLUMNS = 20;
  const MAP_ROWS = 11;
  const PLAYER_STEP_MS = 170;

  // Most of the room art is just small coloured rectangles.
  function fillRectangle(drawingContext, x, y, w, h, colour) {
    drawingContext.fillStyle = colour;
    drawingContext.fillRect(x, y, w, h);
  }

  // The body depends on direction; the last three rows come from the leg frames.
  const BODY_FRAMES = {
    down: [
      '................',
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '...khsssssshk...',
      '...kssessessk...',
      '...kssssssssk...',
      '....kssmmssk....',
      '...kkcccccckk...',
      '..ksccccccccsk..',
      '..ksccccccccsk..',
      '...kcccccccck...',
      '...kppppppppk...'
    ],
    up: [
      '................',
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '...khhhhhhhhk...',
      '...khhhhhhhhk...',
      '...khhhhhhhhk...',
      '....khhhhhhk....',
      '...kkcccccckk...',
      '..ksccccccccsk..',
      '..ksccccccccsk..',
      '...kcccccccck...',
      '...kppppppppk...'
    ],
    left: [
      '................',
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '...khssssshhk...',
      '...ksesssshhk...',
      '...ksssssshhk...',
      '....ksmssssk....',
      '...kkcccccckk...',
      '...kcccccccck...',
      '...kcccccccck...',
      '...kcccccccck...',
      '...kppppppppk...'
    ]
  };
  const LEG_FRAMES = {
    stand: [
      '...kpppkkpppk...',
      '...kppk..kppk...',
      '...kkkk..kkkk...'
    ],
    stepA: [
      '...kpppkkpppk...',
      '....kpk..kppk...',
      '....kkk..kkkk...'
    ],
    stepB: [
      '...kpppkkpppk...',
      '...kppk..kpk....',
      '...kkkk..kkk....'
    ]
  };

  // Extra pixels add things like glasses and ear defenders.
  const CHARACTER_PALETTES = {
    player: {
      k: '#222222',
      h: '#6b3f1d',
      s: '#f2c28e',
      e: '#222222',
      m: '#b5534a',
      c: '#3a9d5d',
      p: '#2c3e75'
    },
    mei: {
      k: '#222222',
      h: '#1f1f1f',
      s: '#e8b98f',
      e: '#222222',
      m: '#b5534a',
      c: '#16a085',
      p: '#0e6655',
      extras: {
        all: [[7, 0, 'h'], [8, 0, 'h']]
      }
    },
    lim: {
      k: '#222222',
      h: '#d6d6d6',
      s: '#f1c27d',
      e: '#222222',
      m: '#a0522d',
      c: '#8b5a2b',
      p: '#4a4a4a'
    },
    auntie: {
      k: '#222222',
      h: '#3b2a20',
      s: '#e0ac69',
      e: '#222222',
      m: '#b5534a',
      c: '#7d5ba6',
      p: '#4b3a6b',
      g: '#555555',
      extras: {
        down: [[5, 5, 'g'], [7, 5, 'g'], [8, 5, 'g'], [10, 5, 'g']]
      }
    },
    theo: {
      k: '#222222',
      h: '#c68642',
      s: '#ffdbac',
      e: '#222222',
      m: '#a0522d',
      c: '#3498db',
      p: '#2c3e50',
      r: '#e74c3c',
      extras: {
        all: [[3, 4, 'r'], [3, 5, 'r'], [12, 4, 'r'], [12, 5, 'r']]
      }
    }
  };
  const cachedFrames = {};
  function reversePixelRow(row) {
    return row.split('').reverse().join('');
  }
  function registerCharacter(id, palette) {
    CHARACTER_PALETTES[id] = palette;
  }

  // Cache each direction and walking frame instead of drawing a new canvas every time.
  function getCharacterFrame(id, direction, walkFrame) {
    const key = id + direction + walkFrame;
    if (cachedFrames[key]) {
      return cachedFrames[key];
    }
    const pal = CHARACTER_PALETTES[id];
    const bodyRows = direction === 'right' ? BODY_FRAMES.left.map(reversePixelRow) : BODY_FRAMES[direction];
    const rows = bodyRows.concat(LEG_FRAMES[walkFrame]).map(r => r.split(''));
    const detailPixels = pal.extras ? (pal.extras.all || []).concat(pal.extras[direction] || []) : [];
    detailPixels.forEach(([x, y, pixelCode]) => {
      rows[y][x] = pixelCode;
    });
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const drawingContext = c.getContext('2d');
    rows.forEach((row, y) => row.forEach((pixelCode, x) => {
      if (pal[pixelCode]) {
        fillRectangle(drawingContext, x, y, 1, 1, pal[pixelCode]);
      }
    }));
    cachedFrames[key] = c;
    return c;
  }

  // Tile letters decide which bit of the hallway to paint.
  function paintHallwayTile(drawingContext, pixelCode, column, row) {
    const x = column * TILE_SIZE;
    const y = row * TILE_SIZE;
    switch (pixelCode) {
      case 'c':
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, '#f4f4ee');
        fillRectangle(drawingContext, x, y + 12, TILE_SIZE, 4, '#c9c9bd');
        fillRectangle(drawingContext, x, y + 15, TILE_SIZE, 1, '#9a9a8e');
        break;
      case 'w':
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, '#d9d6a6');
        fillRectangle(drawingContext, x, y, TILE_SIZE, 1, '#e8e5bb');
        break;
      case 'b':
        fillRectangle(drawingContext, x, y, TILE_SIZE, 6, '#d9d6a6');
        fillRectangle(drawingContext, x, y + 6, TILE_SIZE, 9, '#b8962e');
        for (let i = 0; i < TILE_SIZE; i += 3) {
          fillRectangle(drawingContext, x + i, y + 6, 1, 9, '#94781f');
        }
        fillRectangle(drawingContext, x, y + 6, TILE_SIZE, 1, '#7a6418');
        fillRectangle(drawingContext, x, y + 15, TILE_SIZE, 1, '#5e4d12');
        break;
      case 'D':
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, '#d9d6a6');
        fillRectangle(drawingContext, x + 1, y + 2, 14, 14, '#9c9c9c');
        fillRectangle(drawingContext, x + 3, y + 4, 10, 12, '#4b4b5e');
        break;
      case 'E':
        fillRectangle(drawingContext, x + 1, y, 14, TILE_SIZE, '#9c9c9c');
        fillRectangle(drawingContext, x + 3, y, 10, TILE_SIZE, '#4b4b5e');
        fillRectangle(drawingContext, x + 3, y + 12, 10, 4, '#5d5d72');
        break;
      case 'f':
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, '#e6e6ee');
        fillRectangle(drawingContext, x, y + 7, TILE_SIZE, 1, '#d6d6e2');
        fillRectangle(drawingContext, x + 7, y, 1, TILE_SIZE, '#d6d6e2');
        fillRectangle(drawingContext, x, y + 15, TILE_SIZE, 1, '#c4c4d2');
        fillRectangle(drawingContext, x + 15, y, 1, TILE_SIZE, '#c4c4d2');
        if (row === 3) {
          fillRectangle(drawingContext, x, y, TILE_SIZE, 2, '#cfcfd9');
        }
        break;
      default:
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, '#141414');
    }
  }
  const ROOM_PALETTES = {
    motor: {
      wall: '#e9dcc0',
      light: '#f3ead6',
      trim: '#c9b48f'
    },
    macular: {
      wall: '#dcd3ea',
      light: '#e9e3f3',
      trim: '#b5a6cf'
    },
    sensory: {
      wall: '#cfe3ee',
      light: '#e1eef5',
      trim: '#9fc3d6'
    }
  };

  // Rooms share the floor pattern but use different wall colours.
  function paintRoomTile(drawingContext, pixelCode, column, row, theme) {
    const x = column * TILE_SIZE;
    const y = row * TILE_SIZE;
    const roomPalette = ROOM_PALETTES[theme];
    switch (pixelCode) {
      case 'c':
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, roomPalette.trim);
        fillRectangle(drawingContext, x, y + 14, TILE_SIZE, 2, '#7d6a4e');
        break;
      case 'w':
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, roomPalette.wall);
        fillRectangle(drawingContext, x, y, TILE_SIZE, 1, roomPalette.light);
        break;
      case 'b':
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, roomPalette.wall);
        fillRectangle(drawingContext, x, y + 12, TILE_SIZE, 4, '#a67c52');
        fillRectangle(drawingContext, x, y + 12, TILE_SIZE, 1, '#8a6440');
        break;
      case 'o':
        {
          fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, '#c08552');
          for (let k = 0; k < 4; k++) {
            fillRectangle(drawingContext, x, y + k * 4 + 3, TILE_SIZE, 1, '#a86f42');
            const seam = (column * 16 + row * 7 + k * 9) % 16;
            fillRectangle(drawingContext, x + seam, y + k * 4, 1, 3, '#a86f42');
          }
          if (row === 3) {
            fillRectangle(drawingContext, x, y, TILE_SIZE, 2, '#a36e41');
          }
          break;
        }
      default:
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, '#141414');
    }
  }

  // These draw functions use the top-left tile position of each object.
  const FURNITURE_DRAWERS = {
    plant(drawingContext, x, y) {
      fillRectangle(drawingContext, x + 3, y + 9, 10, 2, '#7f8c8d');
      fillRectangle(drawingContext, x + 4, y + 11, 8, 5, '#95a5a6');
      fillRectangle(drawingContext, x + 6, y + 1, 4, 9, '#2e8b57');
      fillRectangle(drawingContext, x + 2, y + 4, 5, 4, '#3cb371');
      fillRectangle(drawingContext, x + 9, y + 4, 5, 4, '#3cb371');
      fillRectangle(drawingContext, x + 4, y, 3, 4, '#3cb371');
      fillRectangle(drawingContext, x + 9, y, 3, 4, '#2e8b57');
    },
    plaque(drawingContext, x, y, t, done) {
      fillRectangle(drawingContext, x + 2, y + 4, 12, 7, '#8c7a20');
      fillRectangle(drawingContext, x + 3, y + 5, 10, 5, '#f1e27a');
      if (done) {
        fillRectangle(drawingContext, x + 5, y + 7, 1, 1, '#1e7e45');
        fillRectangle(drawingContext, x + 6, y + 8, 1, 1, '#1e7e45');
        fillRectangle(drawingContext, x + 7, y + 7, 1, 1, '#1e7e45');
        fillRectangle(drawingContext, x + 8, y + 6, 1, 1, '#1e7e45');
        fillRectangle(drawingContext, x + 9, y + 5, 1, 1, '#1e7e45');
      } else {
        fillRectangle(drawingContext, x + 5, y + 7, 2, 1, '#8c7a20');
        fillRectangle(drawingContext, x + 9, y + 7, 2, 1, '#8c7a20');
      }
    },
    window2(drawingContext, x, y) {
      fillRectangle(drawingContext, x + 2, y + 2, 28, 12, '#ffffff');
      fillRectangle(drawingContext, x + 3, y + 3, 26, 10, '#9fd3f0');
      fillRectangle(drawingContext, x + 15, y + 3, 2, 10, '#ffffff');
      fillRectangle(drawingContext, x + 3, y + 7, 26, 1, '#ffffff');
    },
    picture(drawingContext, x, y) {
      fillRectangle(drawingContext, x + 3, y + 3, 10, 9, '#8b5a2b');
      fillRectangle(drawingContext, x + 4, y + 4, 8, 7, '#f5d76e');
      fillRectangle(drawingContext, x + 6, y + 6, 3, 3, '#e74c3c');
    },
    rug(drawingContext, x, y) {
      fillRectangle(drawingContext, x, y + 2, 64, 44, '#b9702a');
      fillRectangle(drawingContext, x + 2, y + 4, 60, 40, '#e39a3b');
      fillRectangle(drawingContext, x + 6, y + 8, 52, 1, '#b9702a');
      fillRectangle(drawingContext, x + 6, y + 39, 52, 1, '#b9702a');
    },
    bed(drawingContext, x, y) {
      fillRectangle(drawingContext, x, y - 4, 32, 36, '#7a4a24');
      fillRectangle(drawingContext, x + 2, y - 2, 28, 32, '#f7f7f7');
      fillRectangle(drawingContext, x + 5, y, 22, 7, '#cfd6de');
      fillRectangle(drawingContext, x + 6, y + 1, 20, 5, '#ffffff');
      fillRectangle(drawingContext, x + 2, y + 10, 28, 20, '#dfe6ee');
      fillRectangle(drawingContext, x + 2, y + 10, 28, 2, '#c5ced8');
    },
    bedside(drawingContext, x, y, t, withTray) {
      fillRectangle(drawingContext, x + 2, y + 2, 12, 13, '#7a4f2c');
      fillRectangle(drawingContext, x + 2, y + 2, 12, 4, '#a0703f');
      if (withTray) {
        fillRectangle(drawingContext, x + 3, y + 1, 10, 4, '#bdc3c7');
        fillRectangle(drawingContext, x + 4, y + 2, 8, 2, '#ffffff');
      }
    },
    kitchen(drawingContext, x, y) {
      fillRectangle(drawingContext, x, y - 8, 16, 24, '#34495e');
      fillRectangle(drawingContext, x, y + 1, 16, 1, '#22313f');
      fillRectangle(drawingContext, x + 12, y - 5, 1, 4, '#bdc3c7');
      fillRectangle(drawingContext, x + 12, y + 4, 1, 5, '#bdc3c7');
      for (let i = 1; i < 6; i++) {
        const cx = x + i * 16;
        fillRectangle(drawingContext, cx, y - 2, 16, 18, '#d9c9a3');
        fillRectangle(drawingContext, cx, y - 2, 16, 4, '#f2f2f2');
        fillRectangle(drawingContext, cx + 7, y + 4, 1, 10, '#b8a67e');
      }
      fillRectangle(drawingContext, x + 34, y - 1, 5, 2, '#2d2d2d');
      fillRectangle(drawingContext, x + 41, y - 1, 5, 2, '#2d2d2d');
      fillRectangle(drawingContext, x + 67, y - 1, 10, 3, '#9fb3c8');
      fillRectangle(drawingContext, x + 71, y - 4, 2, 3, '#7f8c8d');
    },
    sofa(drawingContext, x, y) {
      fillRectangle(drawingContext, x, y, 48, 15, '#e0a93a');
      fillRectangle(drawingContext, x, y, 48, 5, '#c98f24');
      fillRectangle(drawingContext, x, y, 3, 15, '#c98f24');
      fillRectangle(drawingContext, x + 45, y, 3, 15, '#c98f24');
      fillRectangle(drawingContext, x + 16, y + 5, 1, 10, '#c98f24');
      fillRectangle(drawingContext, x + 32, y + 5, 1, 10, '#c98f24');
    },
    armchair(drawingContext, x, y) {
      fillRectangle(drawingContext, x + 1, y + 1, 14, 14, '#e0a93a');
      fillRectangle(drawingContext, x + 1, y + 1, 14, 4, '#c98f24');
      fillRectangle(drawingContext, x + 1, y + 1, 3, 14, '#c98f24');
      fillRectangle(drawingContext, x + 12, y + 1, 3, 14, '#c98f24');
    },
    coffeeTable(drawingContext, x, y) {
      fillRectangle(drawingContext, x + 2, y + 2, 44, 12, '#ffffff');
      fillRectangle(drawingContext, x + 4, y + 4, 40, 8, '#cfe8f0');
      fillRectangle(drawingContext, x + 6, y + 5, 10, 1, '#ffffff');
    },
    roundTable(drawingContext, x, y, t, withCup) {
      [[1, 1], [25, 1], [1, 25], [25, 25]].forEach(([sx, sy]) => {
        fillRectangle(drawingContext, x + sx, y + sy, 6, 6, '#c0621f');
        fillRectangle(drawingContext, x + sx + 1, y + sy + 1, 4, 4, '#e67e22');
      });
      fillRectangle(drawingContext, x + 9, y + 6, 14, 20, '#7a4f2c');
      fillRectangle(drawingContext, x + 6, y + 9, 20, 14, '#7a4f2c');
      fillRectangle(drawingContext, x + 10, y + 7, 12, 18, '#a0703f');
      fillRectangle(drawingContext, x + 7, y + 10, 18, 12, '#a0703f');
      if (withCup) {
        fillRectangle(drawingContext, x + 13, y + 11, 6, 7, '#555555');
        fillRectangle(drawingContext, x + 14, y + 12, 4, 5, '#ffffff');
        fillRectangle(drawingContext, x + 14, y + 12, 4, 2, '#3498db');
      }
    },
    medicineShelf(drawingContext, x, y) {
      fillRectangle(drawingContext, x, y - 12, 48, 28, '#6b4423');
      fillRectangle(drawingContext, x + 2, y - 10, 44, 24, '#4e3019');
      fillRectangle(drawingContext, x + 2, y - 1, 44, 2, '#8b5a2b');
      fillRectangle(drawingContext, x + 2, y + 8, 44, 2, '#8b5a2b');
      const colours = [
        '#d68c3a',
        '#c0785a',
        '#8e9aab',
        '#5c8a72',
        '#b06a9e',
        '#4f7cac',
        '#c9a227',
        '#95a5a6'
      ];
      for (let i = 0; i < 8; i++) {
        const bx = x + 4 + i * 5;
        fillRectangle(drawingContext, bx, y - 6, 3, 5, colours[i]);
        fillRectangle(drawingContext, bx, y - 7, 3, 1, '#ffffff');
        fillRectangle(drawingContext, bx, y + 3, 3, 5, colours[7 - i]);
        fillRectangle(drawingContext, bx, y + 2, 3, 1, '#ffffff');
      }
    },
    ipad(drawingContext, x, y, t) {
      const screens = [
        '#ff6b6b',
        '#2ecc71',
        '#5dade2',
        '#f4d03f'
      ];
      fillRectangle(drawingContext, x + 18, y + 4, 12, 8, '#222222');
      fillRectangle(drawingContext, x + 19, y + 5, 10, 6, screens[Math.floor(t / 700) % screens.length]);
    },
    tv(drawingContext, x, y, t) {
      fillRectangle(drawingContext, x + 3, y + 2, 26, 13, '#222222');
      fillRectangle(drawingContext, x + 5, y + 4, 22, 9, Math.floor(t / 900) % 2 ? '#6c7a89' : '#85929e');
    },
    mat(drawingContext, x, y) {
      fillRectangle(drawingContext, x + 2, y + 4, 28, 10, '#922b21');
      fillRectangle(drawingContext, x + 4, y + 6, 24, 6, '#e74c3c');
    }
  };

  // This runs movement, collisions, conversations and drawing for each map.
  function createWorldEngine(configuration) {
    const canvas = configuration.canvas;
    const drawingContext = canvas.getContext('2d');
    drawingContext.imageSmoothingEnabled = false;
    const player = {
      c: configuration.player.c,
      r: configuration.player.r,
      dir: configuration.player.dir || 'down',
      moving: false,
      fromC: 0,
      fromR: 0,
      start: 0,
      step: 0
    };
    let isPaused = false;
    let isDialogueOpen = false;
    let isEngineRunning = true;
    let previousPrompt = null;

    // Mark every tile covered by solid furniture, not just its first tile.
    const blockedTiles = new Set();
    configuration.props.forEach(p => {
      if (!p.solid) {
        return;
      }
      for (let columnOffset = 0; columnOffset < (p.w || 1); columnOffset++) {
        for (let rowOffset = 0; rowOffset < (p.h || 1); rowOffset++) {
          blockedTiles.add(p.c + columnOffset + ',' + (p.r + rowOffset));
        }
      }
    });
    function findCharacterAt(c, r) {
      return configuration.npcs.find(n => n.c === c && n.r === r);
    }
    function isBlockedByScenery(c, r) {
      if (c < 0 || r < 0 || c >= MAP_COLUMNS || r >= MAP_ROWS) {
        return true;
      }
      if (!configuration.walkable.includes(configuration.map[r][c])) {
        return true;
      }
      return blockedTiles.has(c + ',' + r);
    }
    function isTileBlocked(c, r) {
      return isBlockedByScenery(c, r) || !!findCharacterAt(c, r);
    }
    const SHOPPER_STEP_MS = 260;
    configuration.npcs.forEach(n => {
      n.moving = false;
      n.step = 0;
      n.nextMove = performance.now() + 500 + Math.random() * 1500;
    });

    // Shoppers choose a direction but cannot step onto another person or blocked tile.
    function advanceShoppers(now) {
      configuration.npcs.forEach(n => {
        if (!n.wander) {
          return;
        }
        if (n.moving && now - n.start >= SHOPPER_STEP_MS) {
          n.moving = false;
          n.step++;
        }
        if (n.moving || now < n.nextMove) {
          return;
        }
        n.nextMove = now + 300 + Math.random() * 1200;
        const candidateDirections = Math.random() < 0.6 ? [n.dir, 'up', 'down', 'left', 'right'] : [
          'up',
          'down',
          'left',
          'right'
        ];
        const direction = candidateDirections[Math.floor(Math.random() * candidateDirections.length)];
        const [columnOffset, rowOffset] = DIRECTION_OFFSETS[direction];
        const nextColumn = n.c + columnOffset;
        const nextRow = n.r + rowOffset;
        n.dir = direction;
        if (isBlockedByScenery(nextColumn, nextRow) || findCharacterAt(nextColumn, nextRow)) {
          return;
        }
        if (player.c === nextColumn && player.r === nextRow) {
          return;
        }
        n.fromC = n.c;
        n.fromR = n.r;
        n.c = nextColumn;
        n.r = nextRow;
        n.moving = true;
        n.start = now;
      });
    }

    // Arrow keys and WASD feed into the same movement code.
    const KEY_DIRECTIONS = {
      w: 'up',
      W: 'up',
      ArrowUp: 'up',
      s: 'down',
      S: 'down',
      ArrowDown: 'down',
      a: 'left',
      A: 'left',
      ArrowLeft: 'left',
      d: 'right',
      D: 'right',
      ArrowRight: 'right'
    };
    const DIRECTION_OFFSETS = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0]
    };
    const held = [];
    function releaseDirections() {
      held.length = 0;
    }
    document.addEventListener('keydown', event => {
      if (!isEngineRunning || isPaused || isDialogueOpen) {
        return;
      }
      const tag = event.target && event.target.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT') {
        return;
      }
      if (KEY_DIRECTIONS[event.key]) {
        event.preventDefault();
        const d = KEY_DIRECTIONS[event.key];
        if (!held.includes(d)) {
          held.push(d);
        }
      } else if (event.key === 'Enter') {
        if (tag === 'BUTTON' || tag === 'A') {
          return;
        }
        event.preventDefault();
        if (event.repeat) {
          return;
        }
        handleInteraction();
      }
    });
    document.addEventListener('keyup', event => {
      const d = KEY_DIRECTIONS[event.key];
      if (d) {
        const i = held.indexOf(d);
        if (i >= 0) {
          held.splice(i, 1);
        }
      }
    });
    window.addEventListener('blur', releaseDirections);

    // Check the tile trigger first, then the person ahead, then anyone beside you.
    function findInteractionTarget() {
      if (player.moving) {
        return null;
      }
      const tileTrigger = configuration.triggers.find(t => t.c === player.c && t.r === player.r);
      if (tileTrigger) {
        return {
          kind: 'trigger',
          t: tileTrigger
        };
      }
      const [facingColumnOffset, facingRowOffset] = DIRECTION_OFFSETS[player.dir];
      const characterAhead = findCharacterAt(player.c + facingColumnOffset, player.r + facingRowOffset);
      if (characterAhead) {
        return {
          kind: 'npc',
          n: characterAhead
        };
      }
      const adjacentCharacter = configuration.npcs.find(n => Math.abs(n.c - player.c) + Math.abs(n.r - player.r) === 1);
      if (adjacentCharacter) {
        return {
          kind: 'npc',
          n: adjacentCharacter
        };
      }
      return null;
    }

    // Some shoppers have a check action instead of a normal conversation.
    function handleInteraction() {
      const target = findInteractionTarget();
      if (!target) {
        return;
      }
      if (target.kind === 'trigger') {
        target.t.action();
      } else {
        const n = target.n;
        if (n.onInteract) {
          n.onInteract(n);
          return;
        }
        if (n.c < player.c) {
          n.dir = 'right';
        } else if (n.c > player.c) {
          n.dir = 'left';
        } else if (n.r < player.r) {
          n.dir = 'down';
        } else {
          n.dir = 'up';
        }
        player.dir = {
          right: 'left',
          left: 'right',
          down: 'up',
          up: 'down'
        }[n.dir];
        openWorldDialogue(n.id, n.lines(), () => {
          n.dir = n.homeDir || 'down';
          if (n.onDone) {
            n.onDone();
          }
        });
      }
    }

    // Pause walking during the conversation and ignore repeated Enter presses.
    function openWorldDialogue(id, lines, onDone) {
      isDialogueOpen = true;
      releaseDirections();
      const box = configuration.overlay;
      box.hidden = false;
      box.onkeydown = event => {
        if (event.key === 'Enter' && event.repeat) {
          event.preventDefault();
        }
      };
      const d = CQ.dialogue(box, id, lines, {
        doneLabel: 'Close',
        scale: 4,
        onDone: () => {
          box.hidden = true;
          box.innerHTML = '';
          isDialogueOpen = false;
          releaseDirections();
          canvas.focus({
            preventScroll: true
          });
          if (onDone) {
            onDone();
          }
        }
      });
      d.focus();
    }

    // Finish the current step before trying the next held direction.
    function advanceWorldState(now) {
      if (player.moving) {
        if (now - player.start >= PLAYER_STEP_MS) {
          player.moving = false;
          player.step++;
        }
      }
      if (!player.moving && !isPaused && !isDialogueOpen && held.length) {
        const direction = held[held.length - 1];
        player.dir = direction;
        const [columnOffset, rowOffset] = DIRECTION_OFFSETS[direction];
        const bumped = findCharacterAt(player.c + columnOffset, player.r + rowOffset);
        if (!isTileBlocked(player.c + columnOffset, player.r + rowOffset)) {
          player.fromC = player.c;
          player.fromR = player.r;
          player.c += columnOffset;
          player.r += rowOffset;
          player.moving = true;
          player.start = now;
        } else if (bumped && configuration.onBump) {
          configuration.onBump(bumped);
        }
      }
      if (!isPaused && !isDialogueOpen) {
        advanceShoppers(now);
      }
    }

    // The little arrow shows which person or door can be used.
    function paintInteractionMarker(x, y, now) {
      const hc = document.body.classList.contains('high-contrast');
      const b = Math.floor(now / 250) % 2;
      const column = hc ? '#ffff00' : '#ffffff';
      fillRectangle(drawingContext, x - 4, y - 1 + b, 9, 5, '#222222');
      fillRectangle(drawingContext, x - 3, y + b, 7, 1, column);
      fillRectangle(drawingContext, x - 2, y + 1 + b, 5, 1, column);
      fillRectangle(drawingContext, x - 1, y + 2 + b, 3, 1, column);
      fillRectangle(drawingContext, x, y + 3 + b, 1, 1, column);
    }

    // Paint floor objects first, then sort everything else by its bottom edge.
    function renderWorld(now) {
      for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLUMNS; c++) {
          configuration.drawTile(drawingContext, configuration.map[r][c], c, r);
        }
      }
      configuration.props.filter(p => p.floor).forEach(p => p.draw(drawingContext, p.c * TILE_SIZE, p.r * TILE_SIZE, now));
      const renderQueue = [];
      configuration.props.filter(p => !p.floor).forEach(p => renderQueue.push({
        y: (p.r + (p.h || 1)) * TILE_SIZE,
        fn: () => p.draw(drawingContext, p.c * TILE_SIZE, p.r * TILE_SIZE, now)
      }));
      configuration.npcs.forEach(n => {
        let characterX = n.c * TILE_SIZE;
        let characterY = n.r * TILE_SIZE;
        let characterFrame = 'stand';
        if (n.moving) {
          const k = Math.min(1, (now - n.start) / SHOPPER_STEP_MS);
          characterX = Math.round((n.fromC + (n.c - n.fromC) * k) * TILE_SIZE);
          characterY = Math.round((n.fromR + (n.r - n.fromR) * k) * TILE_SIZE);
          characterFrame = n.step % 2 ? 'stepA' : 'stepB';
        }
        renderQueue.push({
          y: characterY + TILE_SIZE,
          fn: () => drawingContext.drawImage(getCharacterFrame(n.id, n.dir, characterFrame), characterX, characterY)
        });
      });
      let playerX = player.c * TILE_SIZE;
      let playerY = player.r * TILE_SIZE;
      let walkFrame = 'stand';
      if (player.moving) {
        const k = Math.min(1, (now - player.start) / PLAYER_STEP_MS);
        playerX = Math.round((player.fromC + (player.c - player.fromC) * k) * TILE_SIZE);
        playerY = Math.round((player.fromR + (player.r - player.fromR) * k) * TILE_SIZE);
        walkFrame = player.step % 2 ? 'stepA' : 'stepB';
      }
      const playerId = configuration.playerId || 'player';
      renderQueue.push({
        y: playerY + TILE_SIZE + 0.5,
        fn: () => drawingContext.drawImage(getCharacterFrame(playerId, player.dir, walkFrame), playerX, playerY)
      });
      renderQueue.sort((a, b) => a.y - b.y).forEach(d => d.fn());
      const target = isDialogueOpen || isPaused ? null : findInteractionTarget();
      if (target && target.kind === 'npc') {
        paintInteractionMarker(target.n.c * TILE_SIZE + 8, target.n.r * TILE_SIZE - 7, now);
      }
      if (target && target.kind === 'trigger' && target.t.marker) {
        paintInteractionMarker(target.t.marker[0], target.t.marker[1], now);
      }
      let text = isDialogueOpen || isPaused ? '' : target ? target.kind === 'npc' ? target.n.prompt || 'Press Enter to talk to ' + CQ.SPRITES[target.n.id].name + '.' : target.t.prompt() : configuration.idlePrompt;
      if (text !== previousPrompt) {
        configuration.prompt.textContent = text;
        previousPrompt = text;
      }
    }
    function runWorldFrame(now) {
      if (!isEngineRunning) {
        return;
      }
      advanceWorldState(now);
      renderWorld(now);
      requestAnimationFrame(runWorldFrame);
    }
    requestAnimationFrame(runWorldFrame);
    canvas.focus({
      preventScroll: true
    });
    return {
      stop() {
        isEngineRunning = false;
        releaseDirections();
      },
      setPaused(p) {
        isPaused = p;
        releaseDirections();
      },
      openDialogue: openWorldDialogue
    };
  }

  // Saved progress controls the door ticks and where the player returns.
  function createHallway(sceneOptions) {
    const map = [
      'cccccccccccccccccccc',
      'wwwDwwwwwDwwwwwDwwww',
      'bbbEbbbbbEbbbbbEbbbb',
      'ffffffffffffffffffff',
      'ffffffffffffffffffff',
      'ffffffffffffffffffff',
      'ffffffffffffffffffff',
      'ffffffffffffffffffff',
      'ffffffffffffffffffff',
      'ffffffffffffffffffff',
      'xxxxxxxxxxxxxxxxxxxx'
    ];
    const hasCompletedRoom = key => CQ.load('carequest_' + key + '_done') === 'true';
    const props = [];
    [1, 6, 12, 17].forEach(c => props.push({
      c,
      r: 9,
      solid: true,
      draw: FURNITURE_DRAWERS.plant
    }));
    sceneOptions.doors.forEach(d => props.push({
      c: d.c + 1,
      r: 1,
      floor: true,
      draw: (drawingContext, x, y, t) => FURNITURE_DRAWERS.plaque(drawingContext, x, y, t, hasCompletedRoom(d.key))
    }));
    const previousRoom = CQ.load('carequest_last_room');
    const previousDoor = sceneOptions.doors.find(d => d.key === previousRoom);
    const start = previousDoor ? {
      c: previousDoor.c,
      r: 3,
      dir: 'down'
    } : {
      c: 1,
      r: 6,
      dir: 'right'
    };
    return createWorldEngine({
      canvas: sceneOptions.canvas,
      overlay: sceneOptions.overlay,
      prompt: sceneOptions.prompt,
      map,
      walkable: 'f',
      drawTile: paintHallwayTile,
      props,
      npcs: [{
        id: 'mei',
        c: 18,
        r: 5,
        dir: 'left',
        homeDir: 'left',
        lines: sceneOptions.guideLines
      }],
      triggers: sceneOptions.doors.map(d => ({
        c: d.c,
        r: 3,
        marker: [d.c * TILE_SIZE + 8, 3],
        prompt: () => d.name + "'s room" + (hasCompletedRoom(d.key) ? ' (completed)' : '') + '. Press Enter to go in.',
        action: () => {
          CQ.save('carequest_last_room', d.key);
          window.location.href = d.href;
        }
      })),
      player: start,
      idlePrompt: 'Walk with WASD or the arrow keys. Mei, the care guide, is at the end of the hallway.'
    });
  }

  // Talking to the family member opens their activity and the mat leads back out.
  function createFamilyRoom(sceneOptions) {
    CQ.save('carequest_last_room', sceneOptions.key);
    const floorRow = 'x' + 'o'.repeat(18) + 'x';
    const map = ['x' + 'c'.repeat(18) + 'x', 'x' + 'w'.repeat(18) + 'x', 'x' + 'b'.repeat(18) + 'x', floorRow, floorRow, floorRow, floorRow, floorRow, floorRow, floorRow, 'x'.repeat(20)];
    const props = [{
      c: 3,
      r: 1,
      floor: true,
      draw: FURNITURE_DRAWERS.window2
    }, {
      c: 13,
      r: 1,
      floor: true,
      draw: FURNITURE_DRAWERS.picture
    }, {
      c: 16,
      r: 1,
      floor: true,
      draw: FURNITURE_DRAWERS.picture
    }, {
      c: 8,
      r: 3,
      floor: true,
      draw: FURNITURE_DRAWERS.rug
    }, {
      c: 9,
      r: 9,
      floor: true,
      draw: FURNITURE_DRAWERS.mat
    }, {
      c: 9,
      r: 3,
      w: 2,
      h: 2,
      solid: true,
      draw: FURNITURE_DRAWERS.bed
    }, {
      c: 11,
      r: 3,
      solid: true,
      draw: (drawingContext, x, y, t) => FURNITURE_DRAWERS.bedside(drawingContext, x, y, t, sceneOptions.theme === 'motor')
    }, {
      c: 13,
      r: 3,
      w: 6,
      solid: true,
      draw: FURNITURE_DRAWERS.kitchen
    }, {
      c: 2,
      r: 6,
      w: 3,
      solid: true,
      draw: FURNITURE_DRAWERS.sofa
    }, {
      c: 1,
      r: 7,
      solid: true,
      draw: FURNITURE_DRAWERS.armchair
    }, {
      c: 5,
      r: 7,
      solid: true,
      draw: FURNITURE_DRAWERS.armchair
    }, {
      c: 2,
      r: 7,
      w: 3,
      solid: true,
      draw: (drawingContext, x, y, t) => {
        FURNITURE_DRAWERS.coffeeTable(drawingContext, x, y);
        if (sceneOptions.theme === 'sensory') {
          FURNITURE_DRAWERS.ipad(drawingContext, x, y, t);
        }
      }
    }, {
      c: 15,
      r: 7,
      w: 2,
      h: 2,
      solid: true,
      draw: (drawingContext, x, y, t) => FURNITURE_DRAWERS.roundTable(drawingContext, x, y, t, sceneOptions.theme === 'motor')
    }, {
      c: 1,
      r: 3,
      solid: true,
      draw: FURNITURE_DRAWERS.plant
    }, {
      c: 7,
      r: 9,
      solid: true,
      draw: FURNITURE_DRAWERS.plant
    }, {
      c: 12,
      r: 9,
      solid: true,
      draw: FURNITURE_DRAWERS.plant
    }, {
      c: 18,
      r: 6,
      solid: true,
      draw: FURNITURE_DRAWERS.plant
    }];
    if (sceneOptions.theme === 'macular') {
      props.push({
        c: 2,
        r: 3,
        w: 3,
        solid: true,
        draw: FURNITURE_DRAWERS.medicineShelf
      });
    }
    if (sceneOptions.theme === 'sensory') {
      props.push({
        c: 7,
        r: 1,
        w: 2,
        floor: true,
        draw: FURNITURE_DRAWERS.tv
      });
    }
    const characterPosition = {
      motor: {
        c: 14,
        r: 7
      },
      macular: {
        c: 5,
        r: 4
      },
      sensory: {
        c: 6,
        r: 7
      }
    }[sceneOptions.theme];
    let roomEngine = null;

    // Stop the room engine before showing the task controls.
    function showRoomActivity() {
      roomEngine.stop();
      sceneOptions.world.hidden = true;
      sceneOptions.activity.hidden = false;
      window.scrollTo(0, 0);
      const h = sceneOptions.activity.querySelector('h1');
      if (h) {
        h.setAttribute('tabindex', '-1');
        h.focus({
          preventScroll: true
        });
      }
      if (sceneOptions.onStart) {
        sceneOptions.onStart();
      }
    }
    roomEngine = createWorldEngine({
      canvas: sceneOptions.canvas,
      overlay: sceneOptions.overlay,
      prompt: sceneOptions.prompt,
      map,
      walkable: 'o',
      drawTile: (drawingContext, pixelCode, c, r) => paintRoomTile(drawingContext, pixelCode, c, r, sceneOptions.theme),
      props,
      npcs: [{
        id: sceneOptions.npc,
        c: characterPosition.c,
        r: characterPosition.r,
        dir: 'down',
        homeDir: 'down',
        lines: () => sceneOptions.intro,
        onDone: showRoomActivity
      }],
      triggers: [9, 10].map(c => ({
        c,
        r: 9,
        prompt: () => 'Press Enter to go back to the hallway.',
        action: () => {
          window.location.href = 'hallway.html';
        }
      })),
      player: {
        c: 9,
        r: 8,
        dir: 'up'
      },
      idlePrompt: 'Walk over to ' + CQ.SPRITES[sceneOptions.npc].name + ' and press Enter to talk. The red mat by the door takes you back to the hallway.'
    });
    return roomEngine;
  }

  // Only mum has both this top colour and the red bag.
  const MUM_TOP_COLOUR = '#7d5ba6';
  const MUM_BAG_COLOUR = '#e74c3c';
  function paintShopTile(drawingContext, pixelCode, column, row) {
    const x = column * TILE_SIZE;
    const y = row * TILE_SIZE;
    switch (pixelCode) {
      case 'c':
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, '#1e8449');
        fillRectangle(drawingContext, x, y + 5, TILE_SIZE, 3, '#f4d03f');
        fillRectangle(drawingContext, x, y + 14, TILE_SIZE, 2, '#145a32');
        break;
      case 'w':
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, '#f4f1e8');
        break;
      case 'b':
        {
          fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, '#bdc3c7');
          fillRectangle(drawingContext, x + 1, y + 1, 14, 11, '#d6eaf8');
          const tints = [
            '#f5b7b1',
            '#abebc6',
            '#f9e79f',
            '#aed6f1'
          ];
          fillRectangle(drawingContext, x + 3, y + 4, 4, 6, tints[column % 4]);
          fillRectangle(drawingContext, x + 9, y + 4, 4, 6, tints[(column + 2) % 4]);
          fillRectangle(drawingContext, x, y + 13, TILE_SIZE, 3, '#7f8c8d');
          break;
        }
      case 'f':
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, '#f7f4ec');
        fillRectangle(drawingContext, x, y + 15, TILE_SIZE, 1, '#e3ddcc');
        fillRectangle(drawingContext, x + 15, y, 1, TILE_SIZE, '#e3ddcc');
        if (row === 3) {
          fillRectangle(drawingContext, x, y, TILE_SIZE, 2, '#e3ddcc');
        }
        break;
      default:
        fillRectangle(drawingContext, x, y, TILE_SIZE, TILE_SIZE, '#141414');
    }
  }

  // Shelves and signs use the same rectangle drawing helper as the rooms.
  const SHOP_DRAWERS = {
    shelf(drawingContext, x, y) {
      fillRectangle(drawingContext, x, y - 4, 32, 68, '#7f8c8d');
      fillRectangle(drawingContext, x + 2, y - 2, 28, 64, '#ecf0f1');
      const products = [
        '#e74c3c',
        '#f39c12',
        '#27ae60',
        '#2980b9',
        '#8e44ad',
        '#f1c40f',
        '#16a085',
        '#d35400'
      ];
      for (let r = 0; r < 8; r++) {
        fillRectangle(drawingContext, x + 2, y + r * 8 + 4, 28, 1, '#95a5a6');
        for (let i = 0; i < 6; i++) {
          fillRectangle(drawingContext, x + 3 + i * 4 + r % 2, y + r * 8 - 1, 3, 5, products[(r * 3 + i + (x >> 4)) % products.length]);
        }
      }
    },
    poster(drawingContext, x, y) {
      fillRectangle(drawingContext, x + 1, y + 2, 14, 12, '#c0392b');
      fillRectangle(drawingContext, x + 3, y + 4, 10, 3, '#f4d03f');
      fillRectangle(drawingContext, x + 3, y + 9, 10, 2, '#ffffff');
    },
    mat(drawingContext, x, y) {
      fillRectangle(drawingContext, x + 1, y + 2, 14, 12, '#566573');
      fillRectangle(drawingContext, x + 3, y + 4, 10, 8, '#808b96');
    }
  };
  function chooseRandomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // Pick the other colours randomly, while keeping the chosen top and bag.
  function createShopperPalette(top, bag, glasses) {
    const pal = {
      k: '#222222',
      e: '#222222',
      m: '#a0522d',
      g: '#555555',
      h: chooseRandomItem([
        '#1f1f1f',
        '#3b2a20',
        '#c68642',
        '#d6d6d6',
        '#7b3f00',
        '#a93226'
      ]),
      s: chooseRandomItem([
        '#f2c28e',
        '#e0ac69',
        '#ffdbac',
        '#c68642',
        '#8d5524'
      ]),
      c: top,
      p: chooseRandomItem([
        '#2c3e50',
        '#4a4a4a',
        '#5d6d7e',
        '#6e2c00',
        '#1b4f72'
      ]),
      extras: {
        all: [],
        down: []
      }
    };
    if (bag) {
      pal.r = bag;
      pal.extras.all.push([13, 9, 'k'], [14, 9, 'k'], [13, 10, 'r'], [14, 10, 'r'], [15, 10, 'r'], [13, 11, 'r'], [14, 11, 'r'], [15, 11, 'r'], [13, 12, 'r'], [14, 12, 'r'], [15, 12, 'r']);
    }
    if (glasses) {
      pal.extras.down.push([5, 5, 'g'], [7, 5, 'g'], [8, 5, 'g'], [10, 5, 'g']);
    }
    return pal;
  }

  // Reserve a free tile for each shopper so nobody starts inside a shelf.
  function createSupermarket(sceneOptions) {
    const floorRow = 'f'.repeat(20);
    const map = ['c'.repeat(20), 'w'.repeat(20), 'b'.repeat(20), floorRow, floorRow, floorRow, floorRow, floorRow, floorRow, floorRow, 'x'.repeat(20)];
    const shelfColumns = [3, 7, 11, 15];
    const props = [{
      c: 2,
      r: 1,
      floor: true,
      draw: SHOP_DRAWERS.poster
    }, {
      c: 9,
      r: 1,
      floor: true,
      draw: SHOP_DRAWERS.poster
    }, {
      c: 17,
      r: 1,
      floor: true,
      draw: SHOP_DRAWERS.poster
    }, {
      c: 1,
      r: 9,
      floor: true,
      draw: SHOP_DRAWERS.mat
    }];
    shelfColumns.forEach(c => props.push({
      c,
      r: 4,
      w: 2,
      h: 4,
      solid: true,
      draw: SHOP_DRAWERS.shelf
    }));
    const isShelfTile = (c, r) => shelfColumns.some(sc => c >= sc && c <= sc + 1) && r >= 4 && r <= 7;
    const availableTiles = [];
    for (let r = 3; r <= 9; r++) {
      for (let c = 0; c < 20; c++) {
        if (!isShelfTile(c, r) && Math.abs(c - 1) + Math.abs(r - 9) > 4) {
          availableTiles.push([c, r]);
        }
      }
    }
    const reserveTile = filter => {
      const options = availableTiles.filter(filter || (() => true));
      const spot = options[Math.floor(Math.random() * options.length)];
      availableTiles.splice(availableTiles.indexOf(spot), 1);
      return spot;
    };
    const alternativeTops = [
      '#3498db',
      '#27ae60',
      '#f39c12',
      '#1abc9c',
      '#34495e',
      '#e67e22',
      '#95a5a6',
      '#2ecc71',
      '#c0392b'
    ];
    const alternativeBags = ['#2e86c1', '#f4d03f', null];
    const shopperDescriptions = [{
      top: MUM_TOP_COLOUR,
      bag: MUM_BAG_COLOUR,
      glasses: true,
      mum: true
    }];
    for (let i = 0; i < 3; i++) {
      shopperDescriptions.push({
        top: MUM_TOP_COLOUR,
        bag: chooseRandomItem(alternativeBags),
        glasses: Math.random() < 0.5
      });
    }
    for (let i = 0; i < 3; i++) {
      shopperDescriptions.push({
        top: chooseRandomItem(alternativeTops),
        bag: MUM_BAG_COLOUR,
        glasses: Math.random() < 0.5
      });
    }
    for (let i = 0; i < 6; i++) {
      shopperDescriptions.push({
        top: chooseRandomItem(alternativeTops),
        bag: chooseRandomItem(alternativeBags),
        glasses: Math.random() < 0.3
      });
    }
    const npcs = shopperDescriptions.map((s, i) => {
      const id = 'shopper' + i;
      registerCharacter(id, s.mum ? Object.assign({}, CHARACTER_PALETTES.auntie, createShopperPalette(MUM_TOP_COLOUR, MUM_BAG_COLOUR, true), {
        h: CHARACTER_PALETTES.auntie.h,
        s: CHARACTER_PALETTES.auntie.s,
        p: CHARACTER_PALETTES.auntie.p
      }) : createShopperPalette(s.top, s.bag, s.glasses));
      const [c, r] = reserveTile(s.mum ? ([c]) => c >= 10 : null);
      return {
        id,
        c,
        r,
        dir: chooseRandomItem([
          'up',
          'down',
          'left',
          'right'
        ]),
        wander: true,
        isMum: !!s.mum,
        prompt: 'Press Enter to check if this is Mum.',
        onInteract: n => sceneOptions.onCheck(n.isMum, n)
      };
    });
    Object.keys(cachedFrames).forEach(k => {
      if (k.startsWith('shopper')) {
        delete cachedFrames[k];
      }
    });
    return createWorldEngine({
      canvas: sceneOptions.canvas,
      overlay: sceneOptions.overlay,
      prompt: sceneOptions.prompt,
      map,
      walkable: 'f',
      drawTile: paintShopTile,
      props,
      npcs,
      triggers: [],
      playerId: 'theo',
      onBump: sceneOptions.onBump,
      player: {
        c: 1,
        r: 9,
        dir: 'right'
      },
      idlePrompt: 'Find Mum: purple top AND red bag. Walk next to someone and press Enter to check.'
    });
  }
  return {
    hallway: createHallway,
    room: createFamilyRoom,
    shop: createSupermarket,
    addPerson: registerCharacter
  };
}();
