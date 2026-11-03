const partyData = [
  {
    id: "balcony",
    name: "Balcony",
    floor: 2,
    sorted: false,
    guests: [
      { name: "Aigerim", color: "green", time: "20:45", aitu: true, things: ["cup", "crumbs"] },
      { name: "Aliya", color: "black", time: "21:15", aitu: false, things: ["phone", "cup"] },
      { name: "Madina", color: "green", time: "22:10", aitu: false, things: ["phone", "bag", "crumbs"] },
      { name: "Ivan", color: "black", time: "20:10", aitu: true, things: ["cup"] }
    ]
  },
  {
    id: "hall",
    name: "Hall",
    floor: 2,
    sorted: false,
    guests: [
      { name: "Arman", color: "yellow", time: "20:35", aitu: false, things: ["bag", "glasses"] },
      { name: "Sophia", color: "purple", time: "21:20", aitu: true, things: ["phone"] },
      { name: "Dias", color: "green", time: "19:45", aitu: true, things: [] },
      { name: "Bekzat", color: "purple", time: "20:55", aitu: false, things: ["bag", "cup", "crumbs"] },
      { name: "Aruzhan", color: "blue", time: "21:50", aitu: true, things: ["phone"] },
      { name: "Saule", color: "green", time: "21:25", aitu: false, things: ["glasses"] }
    ]
  },
  {
    id: "kitchen",
    name: "Kitchen",
    floor: 1,
    sorted: false,
    guests: [
      { name: "Nurlan", color: "red", time: "19:40", aitu: true, things: ["phone", "cup"] },
      { name: "Emma", color: "black", time: "20:15", aitu: false, things: ["bag"] },
      { name: "Timur", color: "green", time: "21:05", aitu: true, things: ["phone", "bag", "crumbs"] },
      { name: "Sergey", color: "yellow", time: "20:50", aitu: false, things: [] },
      { name: "Yerlan", color: "red", time: "21:40", aitu: true, things: ["glasses", "phone"] },
      { name: "Kamila", color: "green", time: "20:05", aitu: false, things: ["cup"] }
    ]
  },
  {
    id: "living-room",
    name: "Living room",
    floor: 1,
    sorted: false,
    guests: [
      { name: "Daniel", color: "blue", time: "19:55", aitu: true, things: ["glasses"] },
      { name: "Zarina", color: "green", time: "21:10", aitu: false, things: ["bag", "phone", "crumbs"] },
      { name: "Natasha", color: "yellow", time: "20:30", aitu: true, things: [] },
      { name: "Askar", color: "black", time: "21:00", aitu: true, things: ["phone"] },
      { name: "Inkar", color: "purple", time: "20:20", aitu: false, things: ["bag"] }
    ]
  }
];

const thingIcons = {
  phone: "📱",
  glasses: "👓",
  bag: "👜",
  cup: "☕",
  crumbs: "🍰"
};

const thingWords = {
  phone: "a phone",
  glasses: "glasses",
  bag: "a bag",
  cup: "a cup",
  crumbs: "cake crumbs"
};

let $openPopup = null;
let $openGuestCard = null;
let isMoving = false;

function formatThingsInWords(things) {
  if (!things || things.length === 0) return "Came with nothing";
  const words = $.map(things, function(t) { return thingWords[t]; });
  if (words.length === 1) return "Has " + words[0];
  if (words.length === 2) return "Has " + words[0] + " and " + words[1];
  return "Has " + words.slice(0, -1).join(", ") + " and " + words[words.length - 1];
}

function createGuestCard(guest, origIdx) {
  const $card = $("<div></div>")
    .addClass("guest-card color-" + guest.color + (guest.aitu ? " aitu" : ""))
    .attr({
      "data-name": guest.name,
      "data-color": guest.color,
      "data-time": guest.time,
      "data-aitu": guest.aitu,
      "data-orig": origIdx !== undefined ? origIdx : 99
    });

  const $avatarWrap = $('<div class="avatar-wrap"></div>');
  $('<img class="avatar-img" alt="">')
    .attr("src", "https://api.dicebear.com/9.x/open-peeps/svg?seed=" + guest.name)
    .appendTo($avatarWrap);

  if (guest.aitu) {
    $('<span class="aitu-badge" title="AITU student">🎓</span>').appendTo($avatarWrap);
  }

  const $things = $('<div class="things"></div>');
  $.each(guest.things, function(_, item) {
    $("<span></span>")
      .addClass("thing " + item)
      .attr("data-thing", item)
      .text(thingIcons[item])
      .appendTo($things);
  });

  $card.append(
    $avatarWrap,
    $('<div class="guest-name"></div>').text(guest.name),
    $('<div class="guest-time"></div>').text("🕒 " + guest.time),
    $things
  );

  return $card;
}

function buildParty() {
  const $house = $("#house").empty();

  $.each([2, 1], function(_, floorNum) {
    const $floor = $("<div></div>")
      .addClass("floor")
      .attr({ id: "floor-" + floorNum, "data-floor": floorNum });

    $('<div class="floor-label"></div>').text("FLOOR " + floorNum).appendTo($floor);
    const $roomsRow = $('<div class="rooms-row"></div>').appendTo($floor);

    $.each(partyData, function(_, room) {
      if (room.floor === floorNum) {
        room.sorted = false;
        const $room = $("<div></div>")
          .addClass("room")
          .attr({ id: room.id, "data-name": room.name, "data-floor": room.floor });

        const $header = $('<div class="room-header"></div>').appendTo($room);
        $('<div class="room-title"></div>').text(room.name).appendTo($header);
        $('<button class="sort-btn">Sort by time</button>')
          .attr("data-room", room.id)
          .appendTo($header);

        const $guestsList = $('<div class="guests-list"></div>').appendTo($room);
        $.each(room.guests, function(idx, guest) {
          createGuestCard(guest, idx).appendTo($guestsList);
        });

        $roomsRow.append($room);
      }
    });

    $house.append($floor);
  });
}

function closeGuestPopup(callback) {
  if (!$openPopup || !$openGuestCard) {
    if (callback) callback();
    return;
  }
  const $popupToClose = $openPopup;
  const $ownerCard = $openGuestCard;
  $openPopup = null;
  $openGuestCard = null;

  const $avatar = $ownerCard.find(".avatar-wrap");
  if ($avatar.length && $ownerCard.is(":visible")) {
    const off = $avatar.offset();
    $popupToClose.stop(true).animate({
      left: off.left,
      top: off.top,
      width: $avatar.outerWidth(),
      height: $avatar.outerHeight(),
      opacity: 0
    }, 220, function() {
      $popupToClose.remove();
      if (callback) callback();
    });
  } else {
    $popupToClose.stop(true).remove();
    if (callback) callback();
  }
}

function openGuestPopup($card) {
  if ($openGuestCard && $openGuestCard.is($card)) {
    closeGuestPopup();
    return;
  }

  const doOpen = function() {
    const name = $card.attr("data-name");
    const color = $card.attr("data-color");
    const time = $card.attr("data-time");
    const isAitu = $card.attr("data-aitu") === "true";
    const currentRoomId = $card.closest(".room").attr("id");

    const things = $card.find(".thing").map(function() {
      return $(this).attr("data-thing");
    }).get();

    const $avatar = $card.find(".avatar-wrap");
    const startOff = $avatar.offset();
    const startW = $avatar.outerWidth();
    const startH = $avatar.outerHeight();

    const targetW = 300;
    const targetH = 310;
    const targetLeft = $(window).scrollLeft() + ($(window).width() - targetW) / 2;
    const targetTop = $(window).scrollTop() + ($(window).height() - targetH) / 2;

    const $popup = $('<div class="detail-popup"></div>').css({
      left: startOff.left,
      top: startOff.top,
      width: startW,
      height: startH,
      opacity: 0.2
    });

    const $header = $('<div class="detail-header"></div>').appendTo($popup);
    $("<img>").attr("src", "https://api.dicebear.com/9.x/open-peeps/svg?seed=" + name).appendTo($header);
    $('<div class="detail-title"></div>').text(name).appendTo($header);

    const $info = $('<div class="detail-info"></div>').appendTo($popup);
    $("<p></p>").text("🕒 Came at " + time).appendTo($info);
    $("<p></p>").text(isAitu ? "🎓 AITU student" : "👤 Not an AITU student").appendTo($info);
    $("<p></p>").text("👕 Dressed in " + color).appendTo($info);
    $("<p></p>").text("🎒 " + formatThingsInWords(things)).appendTo($info);

    const $moves = $('<div class="move-buttons"></div>').appendTo($popup);
    $.each(partyData, function(_, r) {
      if (r.id !== currentRoomId) {
        $('<button class="move-btn"></button>')
          .text("Move to the " + r.name.toLowerCase())
          .on("click", function(e) {
            e.stopPropagation();
            moveGuestToRoom($card, r.id);
          })
          .appendTo($moves);
      }
    });

    $popup.on("click", function(e) {
      e.stopPropagation();
    });

    $("body").append($popup);
    $openPopup = $popup;
    $openGuestCard = $card;

    $popup.stop(true).animate({
      left: targetLeft,
      top: targetTop,
      width: targetW,
      height: targetH,
      opacity: 1
    }, 260);
  };

  if ($openPopup) {
    closeGuestPopup(doOpen);
  } else {
    doOpen();
  }
}

function moveGuestToRoom($card, targetRoomId) {
  if (isMoving) return;
  isMoving = true;

  const guestName = $card.attr("data-name");
  const sourceRoomId = $card.closest(".room").attr("id");

  closeGuestPopup(function() {
    let movedGuestObj = null;
    $.each(partyData, function(_, r) {
      if (r.id === sourceRoomId) {
        const idx = r.guests.findIndex(function(g) { return g.name === guestName; });
        if (idx !== -1) {
          movedGuestObj = r.guests.splice(idx, 1)[0];
        }
      }
    });

    let newOrigIdx = 0;
    $.each(partyData, function(_, r) {
      if (r.id === targetRoomId && movedGuestObj) {
        r.guests.push(movedGuestObj);
        newOrigIdx = r.guests.length - 1;
      }
    });

    $("#" + sourceRoomId + " .guests-list .guest-card").not($card).each(function(i) {
      $(this).attr("data-orig", i);
    });

    const $targetList = $("#" + targetRoomId + " .guests-list");
    const startOff = $card.offset();
    const cardW = $card.outerWidth();
    const cardH = $card.outerHeight();

    const $placeholder = $('<div class="guest-placeholder"></div>')
      .css({ width: 0, height: cardH })
      .appendTo($targetList);

    const $flyer = $card.clone()
      .addClass("flying-card")
      .css({
        position: "absolute",
        left: startOff.left,
        top: startOff.top,
        width: cardW,
        height: cardH,
        margin: 0,
        zIndex: 1500
      })
      .appendTo("body");

    $card.css({ overflow: "hidden", visibility: "hidden" }).stop(true).animate({
      width: 0,
      paddingLeft: 0,
      paddingRight: 0,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      marginRight: -10
    }, 450, function() {
      $card.remove();
    });

    $placeholder.stop(true).animate({ width: cardW }, 450);

    const targetOff = $placeholder.offset();
    $flyer.stop(true).animate({
      left: targetOff.left,
      top: targetOff.top
    }, 450, function() {
      $card.stop(true);
      const $newCard = movedGuestObj
        ? createGuestCard(movedGuestObj, newOrigIdx)
        : $flyer.removeClass("flying-card").attr("style", "").attr("data-orig", newOrigIdx);
      $placeholder.replaceWith($newCard);
      $flyer.remove();
      isMoving = false;
    });
  });
}

function sortRoomByTime(roomId) {
  const roomObj = partyData.find(function(r) { return r.id === roomId; });
  if (!roomObj) return;

  roomObj.sorted = !roomObj.sorted;
  const $room = $("#" + roomId);
  const $btn = $room.find(".sort-btn");
  $btn.toggleClass("sorted", roomObj.sorted)
    .text(roomObj.sorted ? "Original order" : "Sort by time");

  const $list = $room.find(".guests-list");
  const $cards = $list.children(".guest-card");

  const oldPositions = {};
  $cards.each(function() {
    const name = $(this).attr("data-name");
    oldPositions[name] = $(this).offset().left;
  });

  $cards.stop(true, false).css({ position: "relative", left: 0, top: 0 });

  const sortedCards = $cards.get().sort(function(a, b) {
    if (roomObj.sorted) {
      const tA = $(a).attr("data-time");
      const tB = $(b).attr("data-time");
      return tA.localeCompare(tB);
    } else {
      return parseInt($(a).attr("data-orig"), 10) - parseInt($(b).attr("data-orig"), 10);
    }
  });

  $.each(sortedCards, function(_, el) {
    $list.append(el);
  });

  $cards.each(function() {
    const name = $(this).attr("data-name");
    const newLeft = $(this).offset().left;
    const delta = oldPositions[name] - newLeft;
    $(this).css({ position: "relative", left: delta }).stop(true, false).animate({ left: 0 }, 380);
  });
}

const cases = [
  { id: 1, text: "1. Who is in the hall?", run: () => $("#hall .guest-card") },
  { id: 2, text: "2. Who is dressed in yellow or purple?", run: () => $(".guest-card.color-yellow, .guest-card.color-purple") },
  { id: 3, text: "3. Which AITU students are upstairs?", run: () => $("#floor-2 .guest-card.aitu") },
  { id: 4, text: "4. Who has glasses or a bag?", run: () => $(".guest-card:has(.thing.glasses, .thing.bag)") },
  { id: 5, text: "5. Who came with nothing at all?", run: () => $(".guest-card:not(:has(.thing))") },
  { id: 6, text: "6. Who has a phone but no bag?", run: () => $(".guest-card:has(.thing.phone):not(:has(.thing.bag))") },
  { id: 7, text: "7. Arrived 20:30 to 21:00 (inclusive)?", run: () => $(".guest-card").filter(function() { const t = $(this).attr("data-time"); return t >= "20:30" && t <= "21:00"; }) },
  { id: 8, text: "8. Arrived after 21:00 & not AITU?", run: () => $(".guest-card:not(.aitu)").filter(function() { return $(this).attr("data-time") > "21:00"; }) },
  { id: 9, text: "9. Who stands right next to Askar?", run: () => $('.guest-card[data-name="Askar"]').prev(".guest-card").add($('.guest-card[data-name="Askar"]').next(".guest-card")) },
  { id: 10, text: "10. Who stands last in each room?", run: () => $(".room .guest-card:last-child") },
  { id: 11, text: "11. Who stands third in each room?", run: () => $(".room .guest-card:nth-child(3)") },
  { id: 12, text: "12. Who stands after Timur in his room?", run: () => $('.guest-card[data-name="Timur"]').nextAll(".guest-card") },
  { id: 13, text: "13. Who stands right before someone in black?", run: () => $(".guest-card.color-black").prev(".guest-card") },
  { id: 14, text: "14. In which room is Aruzhan?", run: () => $('.guest-card[data-name="Aruzhan"]').closest(".room") },
  { id: 15, text: "15. Which rooms have fewer than 6 guests?", run: () => $(".room:not(:has(.guest-card:nth-child(6)))") },
  { id: 16, text: "16. Rooms with a cup, but nobody wears glasses?", run: () => $(".room:has(.thing.cup):not(:has(.thing.glasses))") },
  { id: 17, text: "17. Who came first to each room?", run: () => $(".guest-card").filter(function() { const t = $(this).attr("data-time"); return $(this).siblings(".guest-card").filter(function() { return $(this).attr("data-time") < t; }).length === 0; }) },
  { id: 18, text: "18. Miras (AITU, blue, 21:20, phone) joins Askar & Inkar", run: () => createGuestCard({ name: "Miras", color: "blue", time: "21:20", aitu: true, things: ["phone"] }, 99).hide().insertAfter('.guest-card[data-name="Askar"]').fadeIn(400) },
  { id: 19, text: "19. Natasha says goodbye and goes home", run: () => $('.guest-card[data-name="Natasha"]').fadeOut(400, function() { $(this).remove(); }) },
  { id: 20, text: "20. Who took the cake?", run: () => $("#floor-1 .guest-card:has(.thing.crumbs):not(:has(.thing.cup))").filter(function() { const t = $(this).attr("data-time"); return t > "21:00" && t < "21:30" && $(this).prev(".guest-card").add($(this).next(".guest-card")).filter(".aitu").length > 0; }) }
];

$(function() {
  buildParty();

  const $btnContainer = $("#cases-buttons");
  $.each(cases, function(_, c) {
    $('<button class="case-btn"></button>')
      .text(c.text)
      .on("click", function() {
        closeGuestPopup();
        $(".case-btn").removeClass("active");
        $(this).addClass("active");

        $(".guest-card").removeClass("found").stop(true, false).css({ top: 0 });
        $(".room").removeClass("found-room");

        if ($('.guest-card[data-name="Miras"]').length && c.id !== 18) {
          $('.guest-card[data-name="Miras"]').remove();
        }

        const $found = c.run();
        const names = $found.map(function() {
          return $(this).attr("data-name");
        }).get();

        if ($found.hasClass("room")) {
          $found.addClass("found-room");
          const $brightGuests = $found.find(".guest-card");
          const $paleGuests = $(".guest-card").not($brightGuests);
          $brightGuests.stop(true).fadeTo(300, 1);
          $paleGuests.stop(true).fadeTo(300, 0.2);
        } else {
          $found.addClass("found");
          const $paleGuests = $(".guest-card").not($found);
          if (c.id !== 19) {
            $found.stop(true).fadeTo(300, 1);
          }
          $paleGuests.stop(true).fadeTo(300, 0.2);
        }

        $("#result-box").text("Case " + c.id + " — Found (" + names.length + "): " + names.join(", "));
      })
      .appendTo($btnContainer);
  });

  $("#clear-btn").on("click", function() {
    closeGuestPopup();
    $(".case-btn").removeClass("active");
    $(".room").removeClass("found-room");
    $(".guest-card").removeClass("found").stop(true).fadeTo(300, 1);
    $("#result-box").text("Spotlight cleared. All guests are bright.");
  });

  $("#house").on("click", ".sort-btn", function(e) {
    e.stopPropagation();
    closeGuestPopup();
    const roomId = $(this).attr("data-room");
    sortRoomByTime(roomId);
  });

  $("#house").on("click", ".guest-card", function(e) {
    e.stopPropagation();
    openGuestPopup($(this));
  });

  $(document).on("click", function() {
    closeGuestPopup();
  });

  $(document).on("keydown", function(e) {
    if (e.key === "Escape") {
      closeGuestPopup();
    }
  });
});
