// Photos of the rooms at the venue, for the two room cards on location.html.
//
// To add a photo: put the file in that room's folder under assets/rooms/ and
// add a line for it to the room's list below. Photos show in list order.
// "alt" describes the photo for people who can't see it.
var ROOM_PHOTOS = {
    '2-bed': [
        { src: 'assets/rooms/2-bed/placeholder-1.svg', alt: 'Placeholder photo of the 2-bed room' },
        { src: 'assets/rooms/2-bed/placeholder-2.svg', alt: 'Second placeholder photo of the 2-bed room' }
    ],
    '3-bed': [
        { src: 'assets/rooms/3-bed/placeholder-1.svg', alt: 'Placeholder photo of the 3-bed room' },
        { src: 'assets/rooms/3-bed/placeholder-2.svg', alt: 'Second placeholder photo of the 3-bed room' }
    ],
    '3-plus-bed': [
        { src: 'assets/rooms/3-plus-bed/placeholder-1.svg', alt: 'Placeholder photo of the 3+ bed room' },
        { src: 'assets/rooms/3-plus-bed/placeholder-2.svg', alt: 'Second placeholder photo of the 3+ bed room' }
    ]
};

(function () {
    // Photo slideshow inside each room
    document.querySelectorAll('.room').forEach(function (room) {
        var photos = ROOM_PHOTOS[room.dataset.room] || [];
        var frame = room.querySelector('.room-photos');
        var dotsBox = room.querySelector('.room-dots');
        var prev = room.querySelector('.room-prev');
        var next = room.querySelector('.room-next');
        var name = room.querySelector('.room-name').textContent;
        var current = 0;

        var images = photos.map(function (photo, i) {
            var img = document.createElement('img');
            img.src = photo.src;
            img.alt = photo.alt || '';
            if (i > 0) img.loading = 'lazy';
            frame.appendChild(img);
            return img;
        });

        var dots = photos.map(function (photo, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'room-dot';
            dot.setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + photos.length + ', ' + name);
            dot.addEventListener('click', function () {
                show(i);
            });
            dotsBox.appendChild(dot);
            return dot;
        });

        function show(index) {
            current = (index + photos.length) % photos.length;
            images.forEach(function (img, i) {
                img.classList.toggle('is-current', i === current);
            });
            dots.forEach(function (dot, i) {
                if (i === current) dot.setAttribute('aria-current', 'true');
                else dot.removeAttribute('aria-current');
            });
        }

        if (photos.length < 2) {
            prev.hidden = true;
            next.hidden = true;
            dotsBox.hidden = true;
        }
        if (photos.length) show(0);

        prev.addEventListener('click', function () {
            show(current - 1);
        });
        next.addEventListener('click', function () {
            show(current + 1);
        });

        // Swipe left or right on a touch screen
        var startX = null;
        var startY = null;
        frame.addEventListener('touchstart', function (event) {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        }, { passive: true });
        frame.addEventListener('touchend', function (event) {
            if (startX === null || photos.length < 2) return;
            var dx = event.changedTouches[0].clientX - startX;
            var dy = event.changedTouches[0].clientY - startY;
            startX = null;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                show(current + (dx < 0 ? 1 : -1));
            }
        });
    });

    // Two cards, three rooms. Flipping a card turns it over to the room that
    // isn't showing on either card, so the two cards never show the same room.
    var cards = Array.prototype.slice.call(document.querySelectorAll('.room-card'));
    var rooms = Array.prototype.slice.call(document.querySelectorAll('.room'));

    function visibleFace(card) {
        return card.querySelector(card.classList.contains('is-flipped') ? '.flip-card-back' : '.flip-card-front');
    }

    cards.forEach(function (card) {
        var front = card.querySelector('.flip-card-front');
        var back = card.querySelector('.flip-card-back');

        card.addEventListener('click', function (event) {
            if (!event.target.closest('.room-flip')) return;

            var showing = cards.map(function (c) {
                return visibleFace(c).querySelector('.room');
            });
            var spare = rooms.filter(function (room) {
                return showing.indexOf(room) === -1;
            })[0];
            if (!spare) return;

            var flipped = !card.classList.contains('is-flipped');
            var hidden = flipped ? back : front;
            hidden.appendChild(spare);

            card.classList.toggle('is-flipped', flipped);
            // Only the visible face can be reached by keyboard and screen readers.
            front.inert = flipped;
            back.inert = !flipped;
            spare.querySelector('.room-flip').focus({ preventScroll: true });
        });
    });
})();
