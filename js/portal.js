(function () {
  var messagesView = document.getElementById("view-messages");
  var calendarView = document.getElementById("view-calendar");
  var listEl = document.getElementById("message-list");
  var navBtns = document.querySelectorAll(".portal__nav-btn");
  var yearSelect = document.getElementById("cal-year");
  var monthSelect = document.getElementById("cal-month");
  var gridEl = document.getElementById("cal-grid");
  var selectedLabel = document.getElementById("cal-selected-label");
  var timeInput = document.getElementById("booking-time");
  var titleInput = document.getElementById("booking-title");
  var bookBtn = document.getElementById("booking-save");
  var bookingsListEl = document.getElementById("bookings-list-body");

  var selectedY = null;
  var selectedM = null; /* 1–12 */
  var selectedD = null;

  function showView(name) {
    var isMsg = name === "messages";
    if (messagesView) messagesView.hidden = !isMsg;
    if (calendarView) calendarView.hidden = isMsg;
    navBtns.forEach(function (btn) {
      var active = btn.getAttribute("data-view") === name;
      btn.classList.toggle("portal__nav-btn--active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (name === "messages") renderMessages();
    if (name === "calendar") {
      renderCalendarGrid();
      renderBookingsList();
    }
  }

  function renderMessages() {
    if (!listEl || !window.MusaData) return;
    var items = MusaData.getMessages();
    if (!items.length) {
      listEl.innerHTML =
        '<p class="portal__empty">No messages yet. When someone uses <strong>Contact Us</strong> on the site and sends a message, it will show up here.</p>';
      return;
    }
    listEl.innerHTML = items
      .map(function (m) {
        var when = new Date(m.submittedAt);
        var dateStr = isNaN(when.getTime())
          ? m.submittedAt
          : when.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            });
        var phone = m.phone ? escapeHtml(m.phone) : "—";
        return (
          '<article class="message-card">' +
          '<div class="message-card__meta">' +
          escapeHtml(dateStr) +
          "</div>" +
          '<div class="message-card__name">' +
          escapeHtml((m.firstName || "") + " " + (m.lastName || "")) +
          "</div>" +
          '<div class="message-card__row"><a href="mailto:' +
          escapeHtml(m.email) +
          '">' +
          escapeHtml(m.email) +
          "</a></div>" +
          '<div class="message-card__row">Phone: ' +
          phone +
          "</div>" +
          '<div class="message-card__body">' +
          escapeHtml(m.message || "") +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function escapeHtml(s) {
    if (s == null) return "";
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function initCalendarSelectors() {
    if (!yearSelect || !monthSelect) return;
    var y = new Date().getFullYear();
    yearSelect.innerHTML = "";
    for (var i = y - 1; i <= y + 5; i++) {
      var opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = String(i);
      if (i === y) opt.selected = true;
      yearSelect.appendChild(opt);
    }
    monthSelect.innerHTML = "";
    for (var m = 1; m <= 12; m++) {
      var o = document.createElement("option");
      o.value = String(m);
      o.textContent = new Date(2000, m - 1, 1).toLocaleString(undefined, {
        month: "long",
      });
      if (m === new Date().getMonth() + 1) o.selected = true;
      monthSelect.appendChild(o);
    }
    selectedY = parseInt(yearSelect.value, 10);
    selectedM = parseInt(monthSelect.value, 10);
    selectedD = new Date().getDate();
    yearSelect.addEventListener("change", function () {
      selectedY = parseInt(yearSelect.value, 10);
      renderCalendarGrid();
    });
    monthSelect.addEventListener("change", function () {
      selectedM = parseInt(monthSelect.value, 10);
      renderCalendarGrid();
    });
  }

  function daysInMonth(year, month1) {
    return new Date(year, month1, 0).getDate();
  }

  function clampSelectedDay() {
    if (selectedY == null || selectedM == null || selectedD == null) return;
    var dim = daysInMonth(selectedY, selectedM);
    if (selectedD > dim) selectedD = dim;
    if (selectedD < 1) selectedD = 1;
  }

  function renderCalendarGrid() {
    if (!gridEl) return;
    selectedY = parseInt(yearSelect.value, 10);
    selectedM = parseInt(monthSelect.value, 10);
    clampSelectedDay();
    var firstDow = new Date(selectedY, selectedM - 1, 1).getDay();
    var dim = daysInMonth(selectedY, selectedM);
    var dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var html = dows
      .map(function (d) {
        return '<div class="calendar-grid__dow">' + d + "</div>";
      })
      .join("");
    for (var i = 0; i < firstDow; i++) {
      html += '<div class="calendar-grid__dow"></div>';
    }
    for (var day = 1; day <= dim; day++) {
      var sel =
        selectedD === day &&
        parseInt(monthSelect.value, 10) === selectedM &&
        parseInt(yearSelect.value, 10) === selectedY;
      html +=
        '<button type="button" class="calendar-grid__cell' +
        (sel ? " calendar-grid__cell--selected" : "") +
        '" data-day="' +
        day +
        '">' +
        day +
        "</button>";
    }
    gridEl.innerHTML = html;
    gridEl.querySelectorAll(".calendar-grid__cell").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectedD = parseInt(btn.getAttribute("data-day"), 10);
        selectedY = parseInt(yearSelect.value, 10);
        selectedM = parseInt(monthSelect.value, 10);
        updateSelectedLabel();
        renderCalendarGrid();
      });
    });
    updateSelectedLabel();
  }

  function updateSelectedLabel() {
    if (!selectedLabel) return;
    if (selectedY == null || selectedM == null || selectedD == null) {
      selectedLabel.textContent = "Pick a day on the calendar.";
      return;
    }
    var iso =
      selectedY +
      "-" +
      pad(selectedM) +
      "-" +
      pad(selectedD);
    var pretty = new Date(
      selectedY,
      selectedM - 1,
      selectedD
    ).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    selectedLabel.textContent = pretty + " (" + iso + ")";
  }

  function renderBookingsList() {
    if (!bookingsListEl || !window.MusaData) return;
    var items = MusaData.getBookings();
    if (!items.length) {
      bookingsListEl.innerHTML =
        '<p class="portal__empty" style="padding:1rem">No event bookings yet.</p>';
      return;
    }
    bookingsListEl.innerHTML = items
      .map(function (b) {
        var line =
          '<strong>' +
          escapeHtml(b.dateLabel || b.dateISO) +
          "</strong>" +
          (b.time ? " · " + escapeHtml(b.time) : "") +
          (b.title ? " — " + escapeHtml(b.title) : "");
        return (
          '<div class="booking-chip" data-id="' +
          escapeHtml(b.id) +
          '"><span>' +
          line +
          '</span><button type="button" class="booking-chip__remove" data-remove="' +
          escapeHtml(b.id) +
          '">Remove</button></div>'
        );
      })
      .join("");
    bookingsListEl.querySelectorAll("[data-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        MusaData.deleteBooking(btn.getAttribute("data-remove"));
        renderBookingsList();
      });
    });
  }

  if (bookBtn && window.MusaData) {
    bookBtn.addEventListener("click", function () {
      if (selectedY == null || selectedM == null || selectedD == null) {
        alert("Choose a date on the calendar first.");
        return;
      }
      var time = (timeInput && timeInput.value) || "";
      if (!time) {
        alert("Choose a time for the event.");
        return;
      }
      var iso =
        selectedY +
        "-" +
        pad(selectedM) +
        "-" +
        pad(selectedD);
      var label = new Date(
        selectedY,
        selectedM - 1,
        selectedD
      ).toLocaleDateString(undefined, {
        dateStyle: "medium",
      });
      MusaData.saveBooking({
        dateISO: iso,
        dateLabel: label,
        year: selectedY,
        month: selectedM,
        day: selectedD,
        time: time,
        title: (titleInput && titleInput.value.trim()) || "",
      });
      if (titleInput) titleInput.value = "";
      renderBookingsList();
    });
  }

  navBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var v = btn.getAttribute("data-view");
      if (v) showView(v);
    });
  });

  initCalendarSelectors();
  renderCalendarGrid();

  var hash = (location.hash || "").replace("#", "");
  if (hash === "calendar") showView("calendar");
  else showView("messages");
})();
