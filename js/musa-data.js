/**
 * Shared persistence for the public site + client portal.
 * Uses localStorage until you replace this with your API.
 */
(function (global) {
  var MESSAGES = "musa_contact_messages";
  var BOOKINGS = "musa_event_bookings";

  function getMessages() {
    try {
      var raw = localStorage.getItem(MESSAGES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveMessage(entry) {
    var list = getMessages();
    entry.id = entry.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    entry.submittedAt = entry.submittedAt || new Date().toISOString();
    list.unshift(entry);
    localStorage.setItem(MESSAGES, JSON.stringify(list));
    return entry;
  }

  function getBookings() {
    try {
      var raw = localStorage.getItem(BOOKINGS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveBooking(entry) {
    var list = getBookings();
    entry.id = entry.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    entry.createdAt = entry.createdAt || new Date().toISOString();
    list.push(entry);
    list.sort(function (a, b) {
      var da = a.dateISO || "";
      var db = b.dateISO || "";
      if (da !== db) return da.localeCompare(db);
      return (a.time || "").localeCompare(b.time || "");
    });
    localStorage.setItem(BOOKINGS, JSON.stringify(list));
    return entry;
  }

  function deleteBooking(id) {
    var list = getBookings().filter(function (b) {
      return b.id !== id;
    });
    localStorage.setItem(BOOKINGS, JSON.stringify(list));
  }

  global.MusaData = {
    getMessages: getMessages,
    saveMessage: saveMessage,
    getBookings: getBookings,
    saveBooking: saveBooking,
    deleteBooking: deleteBooking,
  };
})(typeof window !== "undefined" ? window : this);
