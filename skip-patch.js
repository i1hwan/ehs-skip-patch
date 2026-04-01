/**
 * EHS Bypass - Video.js v7 + HLS
 * Free seek + arrow keys + fast complete + speed unlock
 * Load via: fetch(''https://raw.githubusercontent.com/i1hwan/ehs-skip-patch/main/skip-patch.js').then(r=>r.text()).then(eval)
 */
(function () {
  'use strict';

  if (window.__ehsBypassActive) return;
  window.__ehsBypassActive = true;

  var SKIP_SEC = 5;
  var TAG = 'EHS Bypass';

  function log(msg) {
    console.log('%c[' + TAG + ']%c ' + msg, 'color:#555;font-weight:bold', 'color:inherit');
  }

  function waitForPlayer(cb, maxRetries) {
    maxRetries = maxRetries || 50;
    var attempts = 0;
    var check = setInterval(function () {
      attempts++;
      var p;
      if (typeof videojs !== 'undefined') {
        p = (videojs.getPlayers && videojs.getPlayers().player);
        if (!p) { try { p = videojs('player'); } catch (e) {} }
        if (p && p.readyState && p.readyState() >= 0) {
          clearInterval(check);
          cb(p);
          return;
        }
      }
      if (attempts >= maxRetries) {
        clearInterval(check);
        log('Player not found.');
      }
    }, 200);
  }

  function formatTime(sec) {
    sec = Math.floor(sec);
    var h = Math.floor(sec / 3600);
    sec -= h * 3600;
    var m = Math.floor(sec / 60);
    var s = sec - m * 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function showNotification() {
    var div = document.createElement('div');
    div.style.cssText = [
      'position:fixed', 'top:20px', 'right:20px', 'z-index:999999',
      'background:#fff', 'color:#333', 'padding:16px 24px', 'border-radius:8px',
      'font-size:13px', 'font-family:-apple-system,sans-serif', 'line-height:1.6',
      'box-shadow:0 2px 12px rgba(0,0,0,0.15)', 'border:1px solid #e0e0e0',
      'transition:opacity 0.5s', 'opacity:1'
    ].join(';');
    div.innerHTML =
      '<div style="font-weight:700;font-size:14px;margin-bottom:6px">' + TAG + '</div>' +
      '<div style="color:#555">' +
      'Free seek .......... OK<br>' +
      'Arrow keys ........ OK<br>' +
      'Fast complete ..... OK<br>' +
      'Speed unlock ...... OK' +
      '</div>';
    document.body.appendChild(div);
    setTimeout(function () {
      div.style.opacity = '0';
      setTimeout(function () { div.remove(); }, 600);
    }, 4000);
  }

  function sendCompletion(player) {
    var dur = Math.floor(player.duration()) || window.basic_time || 960;
    var basicTime = window.basic_time || dur;
    var prevStudy = window.course_study_time || 0;
    var needed = Math.max(basicTime - prevStudy, 0);

    window.todayStudyTime = needed + 10;
    window.studyTime = dur;
    window.lecture_complete_yn = 'Y';
    window.study_check = false;
    window.review = 'N';
    window.duration = dur;

    log('Variables set for server call:');
    log('  todayStudyTime=' + window.todayStudyTime +
        ', review=' + window.review +
        ', lecture_complete_yn=' + window.lecture_complete_yn +
        ', course_attend_log_no=' + window.course_attend_log_no +
        ', duration=' + dur);

    if (typeof window.fncTimeCheck === 'function') {
      window.fncTimeCheck();
      log('fncTimeCheck() called.');
    }
  }

  function unlockPlaybackRates(player) {
    var rates = [0.5, 1, 1.25, 1.5, 2, 3];

    if (typeof player.playbackRates === 'function') {
      player.playbackRates(rates);
      log('Rates set via playbackRates()');
      return;
    }

    if (player.options_ && player.options_.playbackRates) {
      player.options_.playbackRates = rates;
    }

    var rateButton = player.controlBar && player.controlBar.playbackRateMenuButton;
    if (rateButton) {
      rateButton.dispose();
    }

    var PlaybackRateMenuButton = videojs.getComponent('PlaybackRateMenuButton');
    if (PlaybackRateMenuButton) {
      player.options_.playbackRates = rates;
      var newBtn = new PlaybackRateMenuButton(player, { playbackRates: rates });
      player.controlBar.addChild(newBtn);
      log('Rates rebuilt via component: ' + rates.join(', '));
    } else {
      log('PlaybackRateMenuButton component not found, skipping rate unlock.');
    }
  }

  function bindArrowKeys(player) {
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      var handled = false;

      if (e.keyCode === 37) {
        player.currentTime(Math.max(player.currentTime() - SKIP_SEC, 0));
        handled = true;
      } else if (e.keyCode === 39) {
        player.currentTime(Math.min(player.currentTime() + SKIP_SEC, player.duration()));
        handled = true;
      } else if (e.keyCode === 32) {
        if (player.paused()) { player.play(); } else { player.pause(); }
        handled = true;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }, true);

    log('Arrow keys bound (left/right: ' + SKIP_SEC + 's skip, space: play/pause)');
  }

  function neutralizeUnfairCheck() {
    var overlapDiv = document.getElementById('overlap_div');
    if (overlapDiv) {
      Object.defineProperty(overlapDiv.style, 'display', {
        set: function () {},
        get: function () { return 'none'; }
      });
    }
  }

  function applyBypass(player) {
    log('Player found. Applying bypass...');

    window.study_check = false;
    window.studyTime = 999999;

    player.off('seeking');
    player.off('timeupdate');

    neutralizeUnfairCheck();

    var seekWarn = document.querySelector('.seekwarn');
    if (seekWarn) seekWarn.style.display = 'none';

    var continueDiv = document.getElementById('continue_div');
    if (continueDiv) continueDiv.style.display = 'none';

    if (player.duration() > 0) {
      sendCompletion(player);
    } else {
      player.on('loadedmetadata', function () { sendCompletion(player); });
      setTimeout(function () { sendCompletion(player); }, 3000);
    }

    unlockPlaybackRates(player);
    bindArrowKeys(player);

    player.on('timeupdate', function () {
      var el = document.getElementById('current_time');
      if (el) el.textContent = formatTime(Math.round(player.currentTime()));
    });

    try { player.play(); } catch (e) {}

    showNotification();
    log('All bypasses applied.');
  }

  waitForPlayer(applyBypass);
})();
