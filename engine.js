/* TennisMath engine - tennis scoring probability math, no DOM.
   Model: A wins each point on own serve w.p. pa, B wins each point on own serve w.p. pb.
   Games to 4 (deuce solved analytically), tiebreaks to 7 with the real serve pattern,
   sets to 6 with tiebreak at 6-6, matches best of 3 or 5. */
(function (root) {
  'use strict';

  function deuce(p) {
    return (p * p) / (p * p + (1 - p) * (1 - p));
  }

  // Probability the server wins a game, winning each point w.p. p.
  function gameWinProb(p) {
    var memo = {};
    function f(a, b) {
      if (a >= 4 && a - b >= 2) return 1;
      if (b >= 4 && b - a >= 2) return 0;
      if (a === 3 && b === 3) return deuce(p);
      var k = a + ',' + b;
      if (memo[k] !== undefined) return memo[k];
      var v = p * f(a + 1, b) + (1 - p) * f(a, b + 1);
      memo[k] = v;
      return v;
    }
    return f(0, 0);
  }

  // Probability A wins a tiebreak at 6-6 onward (A serves the first point of the tiebreak).
  // Tied states repeat with period 2 past 6-6; solved as a 2x2 linear system.
  function tiebreakFromSixAll(pa, pb) {
    var a11 = pa * pb + (1 - pa) * (1 - pb);
    var c1 = pa * (1 - pb);
    var a22 = (1 - pb) * (1 - pa) + pb * pa;
    var c2 = (1 - pb) * pa;
    return (c1 + a11 * c2) / (1 - a11 * a22);
  }

  // Probability A wins a tiebreak from 0-0 (A serves first).
  function tiebreakWinProb(pa, pb) {
    var d = tiebreakFromSixAll(pa, pb);
    var memo = {};
    function f(a, b) {
      if (a >= 7 && a - b >= 2) return 1;
      if (b >= 7 && b - a >= 2) return 0;
      if (a === 6 && b === 6) return d;
      var k = a + ',' + b;
      if (memo[k] !== undefined) return memo[k];
      var i = a + b;
      var sA = i === 0 ? true : (Math.floor((i - 1) / 2) % 2 === 1);
      var p = sA ? pa : (1 - pb);
      var v = p * f(a + 1, b) + (1 - p) * f(a, b + 1);
      memo[k] = v;
      return v;
    }
    return f(0, 0);
  }

  // Probability A wins a set (A serves the first game).
  function setWinProb(pa, pb) {
    var holdA = gameWinProb(pa);
    var breakA = 1 - gameWinProb(pb);
    var tb = tiebreakWinProb(pa, pb);
    var memo = {};
    function f(a, b) {
      if ((a === 6 && b <= 4) || a === 7) return 1;
      if ((b === 6 && a <= 4) || b === 7) return 0;
      if (a === 6 && b === 6) return tb;
      var k = a + ',' + b;
      if (memo[k] !== undefined) return memo[k];
      var g = a + b;
      var p = (g % 2 === 0) ? holdA : breakA;
      var v = p * f(a + 1, b) + (1 - p) * f(a, b + 1);
      memo[k] = v;
      return v;
    }
    return f(0, 0);
  }

  // Probability A wins a match, best of 3 or 5, given per-set win probability.
  function matchWinProb(setProb, bestOf) {
    var need = bestOf === 5 ? 3 : 2;
    var memo = {};
    function f(a, b) {
      if (a === need) return 1;
      if (b === need) return 0;
      var k = a + ',' + b;
      if (memo[k] !== undefined) return memo[k];
      var v = setProb * f(a + 1, b) + (1 - setProb) * f(a, b + 1);
      memo[k] = v;
      return v;
    }
    return f(0, 0);
  }

  function holdPct(p) { return Math.round(gameWinProb(p) * 1000) / 10; }
  function pct(x) { return Math.round(x * 1000) / 10; }

  // The compounding table: A wins (50+edge)% of ALL points (pa = 50+e, pb = 50-e).
  function edgeRow(edgePct) {
    var e = edgePct / 100;
    var pa = 0.5 + e, pb = 0.5 - e;
    var sw = setWinProb(pa, pb);
    return {
      points: pct(0.5 + e),
      hold: pct(gameWinProb(pa)),
      set: pct(sw),
      bo3: pct(matchWinProb(sw, 3)),
      bo5: pct(matchWinProb(sw, 5))
    };
  }

  var api = {
    gameWinProb: gameWinProb,
    tiebreakWinProb: tiebreakWinProb,
    setWinProb: setWinProb,
    matchWinProb: matchWinProb,
    holdPct: holdPct,
    breakPct: function (p) { return pct(1 - gameWinProb(p)); },
    edgeRow: edgeRow,
    pct: pct
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.TennisMath = api;
})(typeof window !== 'undefined' ? window : globalThis);
