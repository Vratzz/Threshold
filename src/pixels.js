/**
 * Pixel art for Threshold — bunnies and garden flowers.
 *
 * Each sprite is a grid of characters. Every character maps to a colour in
 * its palette ('.' is transparent). Sprites render as crisp SVG <rect>s, so
 * they scale to any size without blurring and need no image files.
 *
 * To edit a sprite, change the characters: it's pixel art in plain text.
 */
(function () {
  const BUNNY = [
    '...oo....oo...',
    '..owpo..opwo..',
    '..owpo..opwo..',
    '..owpo..opwo..',
    '..owwo..owwo..',
    '.oowwoooowwoo.',
    '.owwwwwwwwwwo.',
    'owwwwwwwwwwwwo',
    'owweewwwweewwo',
    'owweewwwweewwo',
    'owcwwwnnwwwcwo',
    '.owwwwwwwwwwo.',
    '.owwwwwwwwwwo.',
    'owwwwwwwwwwwwo',
    'owwwwwwwwwwwwo',
    '.oooooooooooo.',
  ];

  const BUNNY_PALETTES = {
    cream: { o: '#2D1B33', w: '#F5EDE4', p: '#D88C9A', e: '#2D1B33', n: '#D88C9A', c: '#EFC3CB' },
    caramel: { o: '#2D1B33', w: '#E8A854', p: '#F5EDE4', e: '#2D1B33', n: '#D88C9A', c: '#F2C98A' },
  };

  const FLOWERS = {
    tulip: {
      grid: [
        '..p.p.p..',
        '..ppppp..',
        '..ppHpp..',
        '..ppppp..',
        '...ppp...',
        '....g....',
        '.l..g....',
        '.ll.g....',
        '..llg..l.',
        '....g.ll.',
        '....gll..',
        '....g....',
      ],
      palette: { p: '#B79CD1', H: '#E2D3EF', g: '#5E6B54', l: '#8A9A7E' },
    },
    daisy: {
      grid: [
        '...w.w...',
        '.w.www.w.',
        '..wyyyw..',
        'wwwyYywww',
        '..wyyyw..',
        '.w.www.w.',
        '...w.w...',
        '....g....',
        '.l..g....',
        '.ll.g.l..',
        '..llgll..',
        '....g....',
      ],
      palette: { w: '#F5EDE4', y: '#E8A854', Y: '#F6D49A', g: '#5E6B54', l: '#8A9A7E' },
    },
    rose: {
      grid: [
        '...rrr...',
        '..rrHrr..',
        '.rHrrHrr.',
        '.rrHHrrr.',
        '..rrrrr..',
        '...rrr...',
        '....g....',
        '..l.g....',
        '.lllg....',
        '....g.l..',
        '....glll.',
        '....g....',
      ],
      palette: { r: '#D88C9A', H: '#F0BAC4', g: '#5E6B54', l: '#8A9A7E' },
    },
  };

  // Rewards beyond the garden. Each set holds a few sprites that rotate as you collect.
  const GEM = [
    '..aaaaa..',
    '.aAAaaaa.',
    'aAAaaaaad',
    'ddddddddd',
    '.daAaaad.',
    '..daAad..',
    '...dad...',
    '....d....',
  ];

  const SKY = {
    star: {
      grid: [
        '....y....',
        '...yyy...',
        '...yYy...',
        'yyyyYyyyy',
        '.yyYWYyy.',
        '..yyYyy..',
        '..yy.yy..',
        '.yy...yy.',
        '.y.....y.',
      ],
      palette: { y: '#E8A854', Y: '#F6D49A', W: '#FFF6E6' },
    },
    moon: {
      grid: [
        '...mmmm..',
        '..mmM....',
        '.mmM.....',
        '.mmM.....',
        '.mmM.....',
        '.mmmM....',
        '..mmmmmm.',
        '...mmmm..',
      ],
      palette: { m: '#F5EDE4', M: '#CBBFB6' },
    },
    sparkle: {
      grid: [
        '....s....',
        '....s....',
        '...sSs...',
        'ssSSWSSss',
        '...sSs...',
        '....s....',
        '....s....',
      ],
      palette: { s: '#B79CD1', S: '#E2D3EF', W: '#FFFFFF' },
    },
  };

  const GEMS = {
    amethyst: { grid: GEM, palette: { a: '#B79CD1', A: '#E8DDF3', d: '#8A6FA8' } },
    emerald: { grid: GEM, palette: { a: '#8FC1A3', A: '#D3EDDD', d: '#5E8C72' } },
    topaz: { grid: GEM, palette: { a: '#E8A854', A: '#F8DDB0', d: '#B97F35' } },
  };

  const SNACKS = {
    carrot: {
      grid: [
        '..l.l.l..',
        '...lll...',
        '....l....',
        '..ooooo..',
        '..oOooo..',
        '..ooooo..',
        '...ooo...',
        '...oOo...',
        '...ooo...',
        '....o....',
      ],
      palette: { l: '#8A9A7E', o: '#E8904A', O: '#F6C08E' },
    },
    strawberry: {
      grid: [
        '...lll...',
        '..lllll..',
        '.rrrlrrr.',
        '.rrwrrwr.',
        '.rrrrrrr.',
        '..rwrrr..',
        '..rrrwr..',
        '...rrr...',
        '....r....',
      ],
      palette: { l: '#8A9A7E', r: '#D9656F', w: '#F6D49A' },
    },
    clover: {
      grid: [
        '..cc.cc..',
        '.cCcccCc.',
        '.ccc.ccc.',
        '..ccgcc..',
        '.ccc.ccc.',
        '.cCcccCc.',
        '..cc.cc..',
        '....g....',
        '.....g...',
        '......g..',
      ],
      palette: { c: '#8FC1A3', C: '#CDEBD9', g: '#5E6B54' },
    },
  };

  const REWARD_SPRITES = { garden: FLOWERS, sky: SKY, gems: GEMS, snacks: SNACKS };

  /** Turn a character grid into an SVG string. */
  function toSVG(grid, palette, { className = '', label = '' } = {}) {
    const h = grid.length;
    const w = grid[0].length;
    let rects = '';
    grid.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const fill = palette[ch];
        if (fill) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fill}"/>`;
      });
    });
    const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
    return `<svg class="${className}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" ${a11y} xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
  }

  function bunny(paletteName, opts) {
    return toSVG(BUNNY, BUNNY_PALETTES[paletteName], opts);
  }

  function flower(kind, opts) {
    const f = FLOWERS[kind];
    return toSVG(f.grid, f.palette, opts);
  }

  /** Render one reward sprite, e.g. reward('sky', 'moon'). */
  function reward(set, kind, opts) {
    const s = (REWARD_SPRITES[set] || FLOWERS)[kind];
    return s ? toSVG(s.grid, s.palette, opts) : '';
  }

  const rewardKinds = (set) => Object.keys(REWARD_SPRITES[set] || FLOWERS);

  window.Pixels = { bunny, flower, reward, rewardKinds, FLOWER_KINDS: Object.keys(FLOWERS), BUNNY, BUNNY_PALETTES, FLOWERS, REWARD_SPRITES };
})();
