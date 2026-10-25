// Photos of the rooms at the venue, for the room cards on location.html.
//
// To add a photo: put the file in that room's folder under assets/rooms/ and
// add a line for it to the room's list below. Photos show in list order, so
// move a line up or down to change the order; the first one shows first.
// "alt" describes the photo for people who can't see it.
var ROOM_PHOTOS = {
    '2-bed': [
        { src: 'assets/rooms/2-bed/PXL_20261024_155714581.jpg', alt: 'The 2-bed room, photo 1' },
        { src: 'assets/rooms/2-bed/PXL_20261024_155722462.jpg', alt: 'The 2-bed room, photo 2' },
        { src: 'assets/rooms/2-bed/PXL_20261024_155659653.jpg', alt: 'The 2-bed room, photo 3' },
        { src: 'assets/rooms/2-bed/PXL_20261024_155701792.jpg', alt: 'The 2-bed room, photo 4' },
        { src: 'assets/rooms/2-bed/PXL_20261024_155736052.jpg', alt: 'The 2-bed room, photo 5' }
    ],
    '3-bed': [
        { src: 'assets/rooms/3-bed/PXL_20261024_160055695.jpg', alt: 'The 3-bed room, photo 1' },
        { src: 'assets/rooms/3-bed/PXL_20261024_155850138.jpg', alt: 'The 3-bed room, photo 2' },
        { src: 'assets/rooms/3-bed/PXL_20261024_155931858.jpg', alt: 'The 3-bed room, photo 3' },
    ],
    '3-plus-bed': [
        { src: 'assets/rooms/3-plus-bed/PXL_20261024_155926079.jpg', alt: 'The 3+ bed room, photo 3' },
        { src: 'assets/rooms/3-plus-bed/PXL_20261024_160119760.jpg', alt: 'The 3+ bed room, photo 6' },
        { src: 'assets/rooms/3-plus-bed/PXL_20261024_155906389.jpg', alt: 'The 3+ bed room, photo 2' },
        { src: 'assets/rooms/3-plus-bed/PXL_20261024_160102421.jpg', alt: 'The 3+ bed room, photo 4' },
        { src: 'assets/rooms/3-plus-bed/PXL_20261024_160108576.jpg', alt: 'The 3+ bed room, photo 5' },
        { src: 'assets/rooms/3-plus-bed/PXL_20261024_155736052.jpg', alt: 'The 3+ bed room, photo 1' }
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

    // The cards are held like a hand of cards: one at the front and one
    // peeking out on each side. Picking a side card turns the hand so that
    // card comes to the front, keeping the rooms in order around it.
    var cards = Array.prototype.slice.call(document.querySelectorAll('.room-card'));
    var turns = {
        left: { left: 'front', front: 'right', right: 'left' },
        right: { left: 'right', front: 'left', right: 'front' }
    };

    function update() {
        cards.forEach(function (card) {
            var front = card.dataset.pos === 'front';
            // Only the front card's photo controls can be reached
            card.querySelector('.room-gallery').inert = !front;
            card.querySelector('.room-pick').hidden = front;
        });
    }

    cards.forEach(function (card) {
        card.querySelector('.room-pick').addEventListener('click', function () {
            var turn = turns[card.dataset.pos];
            cards.forEach(function (c) {
                c.dataset.pos = turn[c.dataset.pos];
            });
            update();
            var controls = card.querySelectorAll('.room-arrow:not([hidden])');
            (controls[controls.length - 1] || card.querySelector('.room-pick')).focus({ preventScroll: true });
        });
    });

    update();
})();
