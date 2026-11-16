/**
 * Threshold — app logic.
 *
 * Flow: onboarding → door (pick a reason) → breathe → moment (fact + activity)
 *       → outcome (you earn your chosen reward, or a no-shame exit) → collection.
 *
 * All state lives in localStorage under one key. No network calls, no analytics.
 */
(function () {
  const { reasons, targets, rewards } = window.ThresholdContent;
  const { bunny, reward, rewardKinds } = window.Pixels;

  const STORAGE_KEY = 'threshold:v1';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- State ----------
  const defaultState = () => ({
    name: '',
    target: 'instagram',
    reward: 'garden', // garden | sky | gems | snacks
    onboarded: false,
    log: [], // { t, reason, outcome: 'instead' | 'opened', reward?: { set, kind }, pausedMs }
    reminders: {
      on: false,
      items: [
        { time: '21:30', days: [1, 2, 3, 4, 5] },
        { time: '15:00', days: [0, 6] },
        { time: '23:30', days: [0, 1, 2, 3, 4, 5, 6] },
      ],
    },
  });

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
    } catch {
      return defaultState();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage can be unavailable (private mode); the app still works for this session */
    }
  }

  let state = load();
  const session = { reason: null, startedAt: 0, factIndex: 0, cleanup: null };

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const target = () => targets[state.target] || targets.instagram;
  const reasonById = (id) => reasons.find((r) => r.id === id);
  const rewardSet = () => rewards[state.reward] || rewards.garden;
  // Older logs stored a bare `flower`; treat those as garden rewards.
  const rewardOf = (l) => l.reward || (l.flower ? { set: 'garden', kind: l.flower } : null);
  const earned = () => state.log.map(rewardOf).filter(Boolean);
  const escapeHTML = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (el.hidden = true), 2400);
  }

  function renderBunnies() {
    $$('[data-bunnies]').forEach((el) => {
      el.innerHTML =
        `<div class="bunny bunny--left">${bunny('cream', { label: 'Cream pixel bunny' })}</div>` +
        `<div class="bunny bunny--right">${bunny('caramel', { label: 'Caramel pixel bunny' })}</div>`;
    });
  }

  // ---------- Navigation ----------
  function go(name) {
    if (session.cleanup) {
      session.cleanup();
      session.cleanup = null;
    }
    $$('.screen').forEach((s) => (s.hidden = s.id !== `screen-${name}`));
    $('#topbar').hidden = name === 'onboarding';
    $$('#topbar [data-go]').forEach((b) =>
      b.dataset.go === name ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')
    );
    const screen = $(`#screen-${name}`);
    screen.classList.remove('enter');
    void screen.offsetWidth; // restart entrance animation
    screen.classList.add('enter');
    const renderers = { onboarding: renderOnboarding, door: renderDoor, garden: renderGarden, settings: renderSettings };
    if (renderers[name]) renderers[name]();
    window.scrollTo(0, 0);
    const heading = $('h1, .breath-label', screen);
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-go]');
    if (btn) go(btn.dataset.go);
  });

  // ---------- Reward picker (onboarding + settings) ----------
  function renderRewardPicker(el, selected) {
    el.setAttribute('role', 'radiogroup');
    el.innerHTML = Object.entries(rewards)
      .map(([id, r]) => `
        <label class="reward-tile">
          <input type="radio" name="reward" value="${id}" ${id === selected ? 'checked' : ''} />
          <span class="reward-tile-inner">
            <span class="reward-check" aria-hidden="true"><svg><use href="#i-check"/></svg></span>
            <span class="reward-preview reward-preview--${id}" aria-hidden="true">
              ${rewardKinds(id).map((k) => reward(id, k)).join('')}
            </span>
            <span class="reward-name">${r.name}</span>
            <span class="reward-blurb">${r.blurb}</span>
          </span>
        </label>`)
      .join('');
  }

  // ---------- Onboarding ----------
  function renderOnboarding() {
    renderRewardPicker($('#screen-onboarding [data-reward-picker]'), state.reward);
  }

  $('#onboarding-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    state.name = (data.get('name') || '').trim();
    state.target = data.get('target');
    state.reward = data.get('reward') || 'garden';
    state.onboarded = true;
    save();
    go('door');
  });

  // ---------- Door ----------
  function renderDoor() {
    session.reason = null;
    $('#btn-wait').disabled = true;
    $('#door-title').textContent = state.name ? `You're at the door, ${state.name}` : "You're at the door";
    $('#door-sub').textContent = `What's pulling you toward ${target().label} right now?`;
    $('#reason-chips').innerHTML = reasons
      .map((r) => `<button class="chip" aria-pressed="false" data-reason="${r.id}">${r.label}</button>`)
      .join('');
    // replay the bunny hop-in
    $$('#screen-door .bunny').forEach((b) => {
      b.classList.remove('hop-in');
      void b.offsetWidth;
      b.classList.add('hop-in');
    });
  }

  $('#reason-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    session.reason = chip.dataset.reason;
    $('#btn-wait').disabled = false;
  });

  $('#btn-wait').addEventListener('click', () => {
    session.startedAt = Date.now();
    startBreath();
  });

  // ---------- Breathe ----------
  function startBreath() {
    go('breathe');
    const label = $('#breath-label');
    const steps = ['Breathe in…', 'Hold…', 'Breathe out…'];
    const durations = [4000, 2000, 4000];
    let i = 0;
    let cycles = 0;
    let timer;
    const tick = () => {
      label.textContent = steps[i];
      $('.breath-circle').dataset.phase = ['in', 'hold', 'out'][i];
      timer = setTimeout(() => {
        i = (i + 1) % steps.length;
        if (i === 0) cycles++;
        if (cycles >= 2) return startMoment();
        tick();
      }, reduceMotion ? 1500 : durations[i]);
    };
    tick();
    session.cleanup = () => clearTimeout(timer);
  }

  $('#btn-skip-breath').addEventListener('click', () => startMoment());

  // ---------- Moment: fact + activity ----------
  function startMoment() {
    go('moment');
    const r = reasonById(session.reason) || reasons[0];
    $('#moment-reason').textContent = `Because: ${r.label.toLowerCase()}`;
    session.factIndex = Math.floor(Math.random() * r.facts.length);
    $('#fact-text').textContent = r.facts[session.factIndex];
    $('#btn-open-anyway').textContent = `Still want to ${target().verb}`;
    renderActivity(r.activity);
  }

  $('#btn-another-fact').addEventListener('click', () => {
    const r = reasonById(session.reason) || reasons[0];
    session.factIndex = (session.factIndex + 1) % r.facts.length;
    $('#fact-text').textContent = r.facts[session.factIndex];
  });

  /** A small countdown used by several activities. */
  function countdown(seconds, onTick, onDone) {
    let left = seconds;
    onTick(left);
    const id = setInterval(() => {
      left -= 1;
      onTick(left);
      if (left <= 0) {
        clearInterval(id);
        onDone();
      }
    }, 1000);
    return () => clearInterval(id);
  }

  const activities = {
    reaction(el) {
      el.innerHTML = `
        <p class="eyebrow">Quick game · 10 seconds</p>
        <h2 class="activity-title">Tap the moment it turns blue</h2>
        <button class="reaction-pad" data-state="idle" aria-live="polite">Tap to start</button>`;
      const pad = $('.reaction-pad', el);
      let t0 = 0;
      let wait;
      pad.addEventListener('click', () => {
        const s = pad.dataset.state;
        if (s === 'idle' || s === 'done') {
          pad.dataset.state = 'waiting';
          pad.textContent = 'Wait for it…';
          wait = setTimeout(() => {
            pad.dataset.state = 'go';
            pad.textContent = 'Tap!';
            t0 = performance.now();
          }, 1200 + Math.random() * 2500);
        } else if (s === 'waiting') {
          clearTimeout(wait);
          pad.dataset.state = 'done';
          pad.textContent = 'Too soon! Tap to try again';
        } else if (s === 'go') {
          const ms = Math.round(performance.now() - t0);
          pad.dataset.state = 'done';
          pad.textContent = `${ms} ms. Tap to go again`;
        }
      });
      return () => clearTimeout(wait);
    },

    reachOut(el) {
      el.innerHTML = `
        <p class="eyebrow">Tiny reach-out</p>
        <h2 class="activity-title">Who could you send two lines to right now?</h2>
        <label class="field">
          <span class="visually-hidden">Draft a message</span>
          <textarea rows="3" placeholder="“Hey, saw something that reminded me of you…”"></textarea>
        </label>
        <p class="fine-print">Nothing here is saved or sent. Copy it into a real chat if you like.</p>`;
    },

    nameIt(el) {
      el.innerHTML = `
        <p class="eyebrow">10 seconds</p>
        <h2 class="activity-title">Say the task out loud. Then say its very first step.</h2>
        <button class="btn btn--soft timer-btn">Start 10 seconds</button>`;
      const btn = $('.timer-btn', el);
      let stop = () => {};
      btn.addEventListener('click', () => {
        btn.disabled = true;
        stop = countdown(10, (s) => (btn.textContent = `${s}…`), () => {
          btn.textContent = 'Named it. That’s the hardest part.';
        });
      });
      return () => stop();
    },

    didWell(el) {
      el.innerHTML = `
        <p class="eyebrow">Your own highlight reel</p>
        <h2 class="activity-title">Write one thing you did well today</h2>
        <form class="inline-form">
          <label class="visually-hidden" for="did-well">One thing you did well</label>
          <input id="did-well" type="text" maxlength="120" placeholder="Even something small counts" />
          <button class="btn btn--soft" type="submit">Keep it</button>
        </form>
        <p class="reflect" aria-live="polite"></p>`;
      $('form', el).addEventListener('submit', (e) => {
        e.preventDefault();
        const v = $('input', el).value.trim();
        if (!v) return;
        $('.reflect', el).innerHTML = `“${escapeHTML(v)}”. That’s yours, and nobody had to like it for it to count.`;
      });
    },

    stretch(el) {
      el.innerHTML = `
        <p class="eyebrow">10-second reset</p>
        <h2 class="activity-title">Stand up, roll your shoulders back, reach both arms up</h2>
        <button class="btn btn--soft timer-btn">Start stretch</button>`;
      const btn = $('.timer-btn', el);
      let stop = () => {};
      btn.addEventListener('click', () => {
        btn.disabled = true;
        stop = countdown(10, (s) => (btn.textContent = `Hold… ${s}`), () => {
          btn.textContent = 'Done. Notice how your neck feels.';
        });
      });
      return () => stop();
    },
  };

  function renderActivity(kind) {
    const el = $('#activity');
    const cleanup = activities[kind](el);
    session.cleanup = cleanup || null;
  }

  // ---------- Outcome ----------
  function record(outcome) {
    const entry = {
      t: Date.now(),
      reason: session.reason,
      outcome,
      pausedMs: Date.now() - (session.startedAt || Date.now()),
    };
    if (outcome === 'instead') {
      const set = state.reward in rewards ? state.reward : 'garden';
      const kinds = rewardKinds(set);
      const already = earned().filter((r) => r.set === set).length;
      entry.reward = { set, kind: kinds[already % kinds.length] };
    }
    state.log.push(entry);
    save();
    return entry;
  }

  $('#btn-instead').addEventListener('click', () => {
    const entry = record('instead');
    go('outcome');
    const { set, kind } = entry.reward;
    const r = rewards[set];
    $('#outcome-art').innerHTML = `
      <div class="reward-stage reward-stage--${set}">
        <div class="grow reward-art--${set}">${reward(set, kind, { label: `A new ${kind}` })}</div>
      </div>`;
    $('#outcome-title').textContent = r.line(kind);
    const count = earned().filter((x) => x.set === set).length;
    $('#outcome-body').textContent =
      count === 1 ? r.first : `That's ${count} ${r.noun} in ${r.collection.replace(/^Your /, 'your ').replace(/^The /, 'the ')}. Each one is a moment you chose something else.`;
    $('#outcome-secondary').textContent = `See ${r.collection.replace(/^Your /, 'my ').replace(/^The /, 'the ')}`;
    const primary = $('#outcome-primary');
    primary.textContent = 'Back to the door';
    primary.href = '#';
    primary.onclick = (e) => {
      e.preventDefault();
      go('door');
    };
  });

  $('#btn-open-anyway').addEventListener('click', () => {
    const entry = record('opened');
    go('outcome');
    const secs = Math.max(1, Math.round(entry.pausedMs / 1000));
    $('#outcome-art').innerHTML = `<div class="hero-well hero-well--round"><div class="bunnies bunnies--small">${$('[data-bunnies]').innerHTML}</div></div>`;
    $('#outcome-secondary').textContent = 'See my collection';
    $('#outcome-title').textContent = 'That’s okay';
    $('#outcome-body').textContent = `You paused for ${secs} seconds and decided on purpose. That still counts. Go enjoy it.`;
    const primary = $('#outcome-primary');
    const t = target();
    if (t.openUrl) {
      primary.textContent = `Open ${t.label}`;
      primary.href = t.openUrl;
      primary.target = '_blank';
      primary.rel = 'noopener';
      primary.onclick = null;
    } else {
      primary.textContent = 'Back to the door';
      primary.href = '#';
      primary.onclick = (e) => {
        e.preventDefault();
        go('door');
      };
    }
  });

  // ---------- Garden ----------
  function streakDays() {
    const days = new Set(state.log.filter((l) => l.outcome === 'instead').map((l) => new Date(l.t).toDateString()));
    let streak = 0;
    const d = new Date();
    if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1); // today not counted yet is fine
    while (days.has(d.toDateString())) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function topReason() {
    const counts = {};
    state.log.forEach((l) => (counts[l.reason] = (counts[l.reason] || 0) + 1));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? reasonById(top[0])?.label : '—';
  }

  function renderGarden() {
    const all = earned();
    const current = rewardSet();
    $('#collection-title').textContent = current.collection;
    $('#garden-stats').innerHTML = `
      <div class="stat"><span class="stat-num">${all.length}</span><span class="stat-label">collected</span></div>
      <div class="stat"><span class="stat-num">${state.log.length}</span><span class="stat-label">pauses</span></div>
      <div class="stat"><span class="stat-num">${streakDays()}</span><span class="stat-label">day streak</span></div>
      <div class="stat stat--wide"><span class="stat-label">Most common pull</span><span class="stat-word">${topReason() || '—'}</span></div>`;

    // One themed bed per reward you've earned, with your current choice first.
    const dates = state.log.filter(rewardOf).map((l) => new Date(l.t).toLocaleDateString());
    const order = [state.reward, ...Object.keys(rewards).filter((k) => k !== state.reward)];
    $('#collections').innerHTML = order
      .map((set) => {
        const items = all.map((r, i) => ({ ...r, date: dates[i] })).filter((r) => r.set === set);
        if (!items.length) return '';
        const showHeading = set !== state.reward || all.some((r) => r.set !== state.reward);
        return `
          <section class="bed-wrap">
            ${showHeading ? `<h2 class="bed-title">${rewards[set].name} <span>${items.length}</span></h2>` : ''}
            <div class="bed bed--${set}" aria-label="${rewards[set].name}">
              ${items.map((r) => `<div class="plot" title="${r.date}">${reward(set, r.kind)}</div>`).join('')}
            </div>
          </section>`;
      })
      .join('');
    const empty = !all.some((r) => r.set === state.reward);
    $('#garden-empty').textContent = current.empty;
    $('#garden-empty').hidden = !empty;
  }

  // ---------- Settings + reminders ----------
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function renderSettings() {
    const f = $('#settings-form');
    f.name.value = state.name;
    $$('input[name="target"]', f).forEach((r) => (r.checked = r.value === state.target));
    f.remindersOn.checked = state.reminders.on;
    renderRewardPicker($('[data-reward-picker]', f), state.reward);
    renderReminderList();
  }

  function renderReminderList() {
    $('#reminder-list').innerHTML = state.reminders.items
      .map(
        (r, i) => `
        <div class="reminder" data-i="${i}">
          <input type="time" value="${r.time}" aria-label="Reminder time" />
          <div class="days">
            ${DAY_LABELS.map(
              (d, di) => `<button type="button" class="day" aria-pressed="${r.days.includes(di)}" data-day="${di}" aria-label="${DAY_NAMES[di]}">${d}</button>`
            ).join('')}
          </div>
          <button type="button" class="icon-btn icon-btn--small" data-remove aria-label="Remove reminder"><svg><use href="#i-close"/></svg></button>
        </div>`
      )
      .join('');
  }

  $('#reminder-list').addEventListener('click', (e) => {
    const row = e.target.closest('.reminder');
    if (!row) return;
    const item = state.reminders.items[row.dataset.i];
    if (e.target.matches('.day')) {
      const d = Number(e.target.dataset.day);
      item.days = item.days.includes(d) ? item.days.filter((x) => x !== d) : [...item.days, d].sort();
      e.target.setAttribute('aria-pressed', String(item.days.includes(d)));
    } else if (e.target.closest('[data-remove]')) {
      state.reminders.items.splice(Number(row.dataset.i), 1);
      renderReminderList();
    }
  });

  $('#reminder-list').addEventListener('change', (e) => {
    const row = e.target.closest('.reminder');
    if (row && e.target.type === 'time') state.reminders.items[row.dataset.i].time = e.target.value;
  });

  $('#btn-add-reminder').addEventListener('click', () => {
    state.reminders.items.push({ time: '20:00', days: [0, 1, 2, 3, 4, 5, 6] });
    renderReminderList();
  });

  $('#settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    state.name = f.name.value.trim();
    state.target = $('input[name="target"]:checked', f).value;
    state.reward = $('input[name="reward"]:checked', f)?.value || state.reward;
    state.reminders.on = f.remindersOn.checked;
    if (state.reminders.on && 'Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        /* older Safari uses a callback API; ignore */
      }
    }
    save();
    scheduleNextReminder();
    toast('Saved');
  });

  // Two-tap reset: no browser dialogs (they're blocked in many embeds and feel harsh anyway).
  let resetArmed = null;
  $('#btn-reset').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (!resetArmed) {
      btn.textContent = 'Tap again to erase everything';
      resetArmed = setTimeout(() => {
        btn.textContent = 'Reset everything';
        resetArmed = null;
      }, 4000);
      return;
    }
    clearTimeout(resetArmed);
    resetArmed = null;
    btn.textContent = 'Reset everything';
    state = defaultState();
    save();
    go('onboarding');
  });

  /**
   * Best-effort reminders. A web page can't wake itself up on iOS, so this only
   * fires while Threshold is open (or kept alive in the background briefly).
   */
  let reminderTimer;
  function scheduleNextReminder() {
    clearTimeout(reminderTimer);
    if (!state.reminders.on || !('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date();
    let next = null;
    for (let add = 0; add < 8 && !next; add++) {
      const day = new Date(now);
      day.setDate(now.getDate() + add);
      const candidates = state.reminders.items
        .filter((r) => r.days.includes(day.getDay()))
        .map((r) => {
          const [h, m] = r.time.split(':').map(Number);
          const d = new Date(day);
          d.setHours(h, m, 0, 0);
          return d;
        })
        .filter((d) => d > now)
        .sort((a, b) => a - b);
      next = candidates[0] || null;
    }
    if (!next) return;
    const delay = next - now;
    if (delay > 2 ** 31 - 1) return;
    reminderTimer = setTimeout(async () => {
      const name = state.name ? `, ${state.name}` : '';
      const opts = { body: 'Quick check-in before you scroll?', icon: 'assets/icons/icon-192.png', tag: 'threshold-reminder' };
      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        if (reg) reg.showNotification(`Hey${name} 🐰`, opts);
        else new Notification(`Hey${name} 🐰`, opts);
      } catch {
        /* notifications blocked */
      }
      scheduleNextReminder();
    }, delay);
  }

  // ---------- Boot ----------
  renderBunnies();
  go(state.onboarded ? 'door' : 'onboarding');
  scheduleNextReminder();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
