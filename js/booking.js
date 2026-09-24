(function () {
  const config = window.SAIBOT_SITE?.booking;
  if (!config) return;

  let selectedDate = "";
  let selectedTime = "";
  let viewMonth = startOfMonth(new Date());

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function toIso(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function addMonths(d, n) {
    return new Date(d.getFullYear(), d.getMonth() + n, 1);
  }

  function buildSlotMap() {
    const map = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    config.manualSlots.forEach((entry) => {
      if (!entry?.date || !Array.isArray(entry.times)) return;
      map.set(entry.date, [...entry.times]);
    });

    const end = new Date(today);
    end.setDate(end.getDate() + config.weeksAhead * 7);
    for (let d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) {
      if (!config.weekdays.includes(d.getDay())) continue;
      const iso = toIso(d);
      if (config.blockedDates.includes(iso)) continue;
      if (!map.has(iso)) {
        map.set(iso, [...config.times]);
      }
    }

    return map;
  }

  function getNextFreeLabel(slotMap) {
    const sorted = [...slotMap.keys()].sort();
    const todayIso = toIso(new Date());
    for (let i = 0; i < sorted.length; i += 1) {
      const iso = sorted[i];
      if (iso < todayIso) continue;
      const times = slotMap.get(iso) || [];
      if (times.length) {
        const [y, m, d] = iso.split("-");
        return `${d}.${m}.${y} · ${times[0]} Uhr`;
      }
    }
    return "demnächst — Slots in site-config.js pflegen";
  }

  function renderCalendar(root, slotMap) {
    const calEl = root.querySelector("[data-booking-cal]");
    const timesEl = root.querySelector("[data-booking-times]");
    const nextEl = root.querySelector("[data-booking-next]");
    const selectedEl = root.querySelector("[data-booking-selected]");
    const hiddenInput = document.getElementById("contact-appointment");

    if (!calEl || !timesEl) return;

    if (nextEl) {
      nextEl.textContent = getNextFreeLabel(slotMap);
    }

    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const monthName = viewMonth.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayIso = toIso(new Date());

    let daysHtml = "";
    for (let i = 0; i < offset; i += 1) {
      daysHtml += '<span class="booking-cal__day booking-cal__day--empty"></span>';
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const iso = `${year}-${pad(month + 1)}-${pad(day)}`;
      const hasSlots = (slotMap.get(iso) || []).length > 0 && iso >= todayIso;
      const isSelected = iso === selectedDate;
      daysHtml += `<button type="button" class="booking-cal__day${hasSlots ? " is-free" : ""}${
        isSelected ? " is-selected" : ""
      }" data-date="${iso}" ${hasSlots ? "" : "disabled"}>${day}</button>`;
    }

    calEl.innerHTML = `
      <div class="booking-cal__head">
        <button type="button" class="booking-cal__nav" data-cal-prev aria-label="Vorheriger Monat">‹</button>
        <span class="booking-cal__title">${monthName}</span>
        <button type="button" class="booking-cal__nav" data-cal-next aria-label="Nächster Monat">›</button>
      </div>
      <div class="booking-cal__weekdays"><span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span></div>
      <div class="booking-cal__grid">${daysHtml}</div>
    `;

    calEl.querySelector("[data-cal-prev]")?.addEventListener("click", () => {
      viewMonth = addMonths(viewMonth, -1);
      renderCalendar(root, slotMap);
    });
    calEl.querySelector("[data-cal-next]")?.addEventListener("click", () => {
      viewMonth = addMonths(viewMonth, 1);
      renderCalendar(root, slotMap);
    });

    calEl.querySelectorAll("[data-date]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedDate = btn.getAttribute("data-date") || "";
        selectedTime = "";
        renderCalendar(root, slotMap);
        renderTimes(timesEl, slotMap, selectedEl, hiddenInput);
      });
    });

    renderTimes(timesEl, slotMap, selectedEl, hiddenInput);
  }

  function renderTimes(timesEl, slotMap, selectedEl, hiddenInput) {
    if (!selectedDate) {
      timesEl.innerHTML = `<p class="booking-times__hint">Bitte einen markierten Tag wählen.</p>`;
      updateSelection(selectedEl, hiddenInput);
      return;
    }

    const times = slotMap.get(selectedDate) || [];
    timesEl.innerHTML = times
      .map(
        (t) =>
          `<button type="button" class="booking-time${t === selectedTime ? " is-selected" : ""}" data-time="${t}">${t} Uhr</button>`
      )
      .join("");

    timesEl.querySelectorAll("[data-time]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedTime = btn.getAttribute("data-time") || "";
        renderTimes(timesEl, slotMap, selectedEl, hiddenInput);
      });
    });

    updateSelection(selectedEl, hiddenInput);
  }

  function updateSelection(selectedEl, hiddenInput) {
    if (!hiddenInput) return;
    if (selectedDate && selectedTime) {
      const value = `${selectedDate} ${selectedTime} (${config.timezoneLabel})`;
      hiddenInput.value = value;
      if (selectedEl) {
        selectedEl.hidden = false;
        selectedEl.textContent = `Gewählt: ${value.replace(` (${config.timezoneLabel})`, "")} Uhr`;
      }
    } else {
      hiddenInput.value = "";
      if (selectedEl) selectedEl.hidden = true;
    }
  }

  function initBooking() {
    const root = document.getElementById("booking-block");
    if (!root) return;
    const slotMap = buildSlotMap();
    renderCalendar(root, slotMap);
  }

  window.saibotInitBooking = initBooking;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBooking);
  } else {
    initBooking();
  }
})();
