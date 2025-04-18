// ===== Zone/HTML5Player & <video> 10초 스킵 패치 v4 =====
(function applySkipPatch(sec = 10) {
  /* 0) 예전 패치 clean‑up (중복 방지) */
  if (window.__zoneSkipPatch && typeof window.__zoneSkipPatch.cleanup === 'function') {
    window.__zoneSkipPatch.cleanup();
  }

  /* 1) mediaplayer_config 기본값 수정(있을 때만) */
  if (window.mediaplayer_config) {
    mediaplayer_config.skipInterval = sec;
    if (mediaplayer_config.controllers) Object.assign(
      mediaplayer_config.controllers,
      { backwardButton: true, forwardButton: true, currentSkip: true }
    );
  }

  /* 2) 스킵 대상(Zone Player + 순수 <video>) 수집 */
  const targets = [];

  // Zone HTML5Player 인스턴스 탐색
  Object.values(window).forEach(obj => {
    if (obj && typeof obj.currentTime === 'function' && typeof obj.play === 'function') {
      targets.push({ ctl: obj, media: obj.media || null });
    }
  });

  // 페이지 상의 모든 <video> 태그
  document.querySelectorAll('video').forEach(v => {
    targets.push({ ctl: null, media: v });
  });

  /* 3) 각 대상에 스킵 메서드 주입 */
  targets.forEach(t => {
    const getTime = () =>
      t.ctl ? t.ctl.currentTime() : t.media.currentTime;

    const setTime = val =>
      t.ctl ? t.ctl.currentTime(val) : (t.media.currentTime = val);

    const getDur = () => {
      const d =
        Number.isFinite(t.ctl?.duration)            ? t.ctl.duration :
        Number.isFinite(t.media?.duration)          ? t.media.duration :
        Number.isFinite(t.ctl?.media?.duration)     ? t.ctl.media.duration :
        Infinity;   // 정보 없으면 무한대로
      return d;
    };

    t.skipBack = () => setTime(Math.max(0, getTime() - sec));
    t.skipFwd  = () => setTime(Math.min(getDur(), getTime() + sec));

    // Zone 플레이어라면 내부 skipInterval 값도 싱크
    if (t.ctl && 'skipInterval' in t.ctl) t.ctl.skipInterval = sec;
  });

  /* 4) 키보드 단축키(←/→) – 한 번만 등록 */
  const keyListener = e => {
    if (e.target.closest('input, textarea, [contenteditable]')) return;
    if (e.key === 'ArrowLeft')  { targets.forEach(t => t.skipBack()); e.preventDefault(); }
    if (e.key === 'ArrowRight') { targets.forEach(t => t.skipFwd());  e.preventDefault(); }
  };
  document.addEventListener('keydown', keyListener, true);

  /* 5) clean‑up 함수를 전역으로 */
  window.__zoneSkipPatch = {
    cleanup: () => document.removeEventListener('keydown', keyListener, true)
  };

  console.log(`✅  Arrow ←/→ 로 ${sec}초 스킵이 완전히 동작합니다!
     다른 간격을 원하면 applySkipPatch(초) 를 다시 호출하세요.`);
})();
