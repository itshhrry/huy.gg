/* Plate lightbox.
   A plate opens its capture over the page instead of navigating, because a
   reader clicking a screenshot is asking to see the screenshot. Click the image
   to swap between fit and native size, click the ground or press Escape to
   leave. The entry's own link to the running thing lives on its .goto line. */
(function () {
  var plates = document.querySelectorAll('.plate');
  if (!plates.length) return;

  var lb, stage, big, cap, closer, opener = null;

  function build() {
    lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Enlarged capture');
    lb.innerHTML =
      '<div class="lb-stage"><img alt="" tabindex="0"></div>' +
      '<div class="lb-bar"><span class="lb-txt"></span>' +
      '<button type="button" class="lb-x">close</button></div>';
    document.body.appendChild(lb);
    stage = lb.querySelector('.lb-stage');
    big = lb.querySelector('img');
    cap = lb.querySelector('.lb-txt');
    closer = lb.querySelector('.lb-x');

    closer.addEventListener('click', close);
    stage.addEventListener('click', function (e) {
      if (e.target === big) toggle(e); else close();
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb) close();
    });
    big.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        // Two stops inside the dialog, so the cycle stays in it.
        var stops = [big, closer], i = stops.indexOf(document.activeElement);
        e.preventDefault();
        stops[(i + (e.shiftKey ? stops.length - 1 : 1)) % stops.length].focus();
      }
    });
  }

  /* Native size, anchored where the pointer was, so zooming into the corner of
     a wide dashboard lands on that corner rather than on the middle. */
  function toggle(e) {
    var r = big.getBoundingClientRect();
    var rx = e ? (e.clientX - r.left) / r.width : 0.5;
    var ry = e ? (e.clientY - r.top) / r.height : 0.5;
    var on = stage.classList.toggle('in');
    if (on) {
      stage.scrollLeft = rx * big.offsetWidth - stage.clientWidth / 2;
      stage.scrollTop = ry * big.offsetHeight - stage.clientHeight / 2;
    } else {
      stage.scrollLeft = 0;
      stage.scrollTop = 0;
    }
  }

  function open(plate) {
    var src = plate.querySelector('img');
    if (!src) return;
    if (!lb) build();
    opener = plate;
    big.src = src.currentSrc || src.src;
    big.alt = src.alt || '';
    /* The caption that follows this plate, not the first one in the entry: the
       revenue cycle entry carries two plates and two captions. */
    var note = plate.nextElementSibling;
    while (note && !note.classList.contains('platecap')) {
      note = note.classList.contains('plate') ? null : note.nextElementSibling;
    }
    cap.textContent = note ? note.textContent.trim() : (src.alt || '');
    stage.classList.remove('in');
    stage.scrollTop = stage.scrollLeft = 0;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    big.focus();
  }

  function close() {
    lb.classList.remove('open');
    stage.classList.remove('in');
    document.body.style.overflow = '';
    if (opener) { opener.focus(); opener = null; }
  }

  Array.prototype.forEach.call(plates, function (p) {
    p.setAttribute('role', 'button');
    p.setAttribute('tabindex', '0');
    var alt = p.querySelector('img');
    p.setAttribute('aria-label', 'Enlarge: ' + ((alt && alt.alt) || 'capture'));
    p.addEventListener('click', function () { open(p); });
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(p); }
    });
  });
})();
