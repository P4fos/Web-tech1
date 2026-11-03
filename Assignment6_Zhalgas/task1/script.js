const partyData = [
  {
    id: "balcony",
    name: "Balcony",
    floor: 2,
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

function createGuestCard(guest) {
  const $card = $("<div></div>")
    .addClass("guest-card color-" + guest.color + (guest.aitu ? " aitu" : ""))
    .attr({
      "data-name": guest.name,
      "data-color": guest.color,
      "data-time": guest.time,
      "data-aitu": guest.aitu
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
        const $room = $("<div></div>")
          .addClass("room")
          .attr({ id: room.id, "data-name": room.name, "data-floor": room.floor });

        const $header = $('<div class="room-header"></div>').appendTo($room);
        $('<div class="room-title"></div>').text(room.name).appendTo($header);

        const $guestsList = $('<div class="guests-list"></div>').appendTo($room);
        $.each(room.guests, function(_, guest) {
          createGuestCard(guest).appendTo($guestsList);
        });

        $roomsRow.append($room);
      }
    });

    $house.append($floor);
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
  { id: 18, text: "18. Miras (AITU, blue, 21:20, phone) joins Askar & Inkar", run: () => createGuestCard({ name: "Miras", color: "blue", time: "21:20", aitu: true, things: ["phone"] }).hide().insertAfter('.guest-card[data-name="Askar"]').fadeIn(400) },
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
        $(".case-btn").removeClass("active");
        $(this).addClass("active");

        buildParty();
        const $found = c.run();

        const names = $found.map(function() {
          return $(this).attr("data-name");
        }).get();

        if ($found.hasClass("room")) {
          $found.addClass("found-room");
          $found.find(".guest-card").stop(true, true).animate({ top: -14 }, 160).animate({ top: 0 }, 160);
        } else {
          $found.addClass("found");
          if (c.id !== 19) {
            $found.stop(true, true).animate({ top: -14 }, 160).animate({ top: 0 }, 160);
          }
        }

        $("#result-box").text("Case " + c.id + " — Found (" + names.length + "): " + names.join(", "));
      })
      .appendTo($btnContainer);
  });
});
