// Flip cards for the travel options and hotels on location.html.
(function () {
    // The room cards flip between rooms instead and are handled in rooms.js.
    document.querySelectorAll('.flip-card:not(.room-card)').forEach(function (card) {
        var front = card.querySelector('.flip-card-front');
        var back = card.querySelector('.flip-card-back');
        var flipBack = card.querySelector('.flip-card-flip-back');

        function setFlipped(flipped) {
            card.classList.toggle('is-flipped', flipped);
            front.setAttribute('aria-expanded', String(flipped));
            // Only the visible face can be reached by keyboard and screen readers.
            front.inert = flipped;
            back.inert = !flipped;
            (flipped ? flipBack : front).focus({ preventScroll: true });
        }

        front.addEventListener('click', function () {
            setFlipped(true);
        });

        // Clicking anywhere on the back flips it again, except the booking.com link.
        back.addEventListener('click', function (event) {
            if (event.target.closest('a')) return;
            setFlipped(false);
        });
    });
})();
