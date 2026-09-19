const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation.classList.toggle('is-open', !open);
  document.body.classList.toggle('menu-open', !open);
});

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...navigation.querySelectorAll('a')];
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-42% 0px -52%', threshold: 0 });
sections.forEach((section) => navObserver.observe(section));

const booking = document.querySelector('.booking-shell');
const bookingLayout = booking.querySelector('.booking-layout');
const bookingStage = booking.querySelector('.booking-stage');
const bookingClose = booking.querySelector('.booking-close');
const bookingSteps = [...booking.querySelectorAll('[data-booking-step]')];
const bookingProgress = [...booking.querySelectorAll('.booking-progress span')];
const bookingBack = booking.querySelector('[data-booking-back]');
const bookingNext = booking.querySelector('[data-booking-next]');
const bookingNextLabel = bookingNext.querySelector('span');
const rideChoices = [...booking.querySelectorAll('[data-ride-choice]')];
const datePicker = booking.querySelector('.date-picker');
const timeChoices = [...booking.querySelectorAll('[data-time]')];
const riderTotal = booking.querySelector('.counter strong');
const bookingHint = booking.querySelector('.booking-hint');
const bookingForm = booking.querySelector('#booking-form');
const summaryImage = booking.querySelector('.booking-summary figure img');
const summaryCode = booking.querySelector('.booking-summary figcaption b');
const summaryTitle = booking.querySelector('.summary-title strong');
const summaryDate = booking.querySelector('[data-summary-date]');
const summaryTime = booking.querySelector('[data-summary-time]');
const summaryRiders = booking.querySelector('[data-summary-riders]');

const rideData = {
  city: { title: 'Ride Istanbul', code: 'IB / RIDE 01', image: 'assets/night-ride.png' },
  group: { title: 'Ride Together', code: 'IB / RIDE 02', image: 'assets/community.png' },
  night: { title: 'Night Shift', code: 'IB / RIDE 03', image: 'assets/red-bike.png' }
};

const bookingState = {
  step: 1,
  ride: 'city',
  date: '',
  dateLabel: '',
  time: '',
  riders: 1
};

let bookingReturnFocus = null;

const buildDates = () => {
  const dayFormatter = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
  const monthFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' });
  const longFormatter = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const today = new Date();

  for (let offset = 1; offset <= 5; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const value = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.date = value;
    button.dataset.label = longFormatter.format(date);
    button.innerHTML = `<span>${dayFormatter.format(date)}</span><strong>${monthFormatter.format(date)}</strong>`;
    button.setAttribute('aria-pressed', 'false');
    datePicker.append(button);
  }
};

const updateRide = (ride) => {
  bookingState.ride = rideData[ride] ? ride : 'city';
  const selectedRide = rideData[bookingState.ride];

  rideChoices.forEach((choice) => {
    const selected = choice.dataset.rideChoice === bookingState.ride;
    choice.classList.toggle('is-selected', selected);
    choice.setAttribute('aria-pressed', String(selected));
    choice.querySelector('.ride-choice-mark').textContent = selected ? '✓' : '+';
  });

  summaryImage.src = selectedRide.image;
  summaryImage.alt = `${selectedRide.title} preview`;
  summaryCode.textContent = selectedRide.code;
  summaryTitle.textContent = selectedRide.title;
};

const updateBookingView = () => {
  bookingSteps.forEach((step) => step.classList.toggle('is-active', Number(step.dataset.bookingStep) === bookingState.step));
  bookingProgress.forEach((item, index) => {
    const progressStep = index + 1;
    item.classList.toggle('is-current', progressStep === bookingState.step);
    item.classList.toggle('is-done', progressStep < bookingState.step);
  });

  bookingBack.disabled = bookingState.step === 1;
  bookingNextLabel.textContent = bookingState.step === 1 ? 'Set the moment' : bookingState.step === 2 ? 'Add rider details' : 'Assemble my ride';
  bookingStage.classList.toggle('is-complete', bookingState.step === 4);
  bookingStage.scrollTo({ top: 0, behavior: 'smooth' });
  bookingLayout.scrollTo({ top: 0, behavior: 'smooth' });
};

const openBooking = (trigger) => {
  bookingReturnFocus = trigger;
  updateRide(trigger.dataset.ride || bookingState.ride);
  booking.hidden = false;
  document.body.classList.add('booking-open');
  requestAnimationFrame(() => {
    booking.classList.add('is-open');
    bookingClose.focus();
  });
};

const closeBooking = () => {
  booking.classList.remove('is-open');
  document.body.classList.remove('booking-open');
  window.setTimeout(() => {
    booking.hidden = true;
    bookingReturnFocus?.focus();
  }, 320);
};

const resetBooking = () => {
  bookingState.step = 1;
  bookingState.date = '';
  bookingState.dateLabel = '';
  bookingState.time = '';
  bookingState.riders = 1;
  bookingForm.reset();
  datePicker.querySelectorAll('button').forEach((button) => {
    button.classList.remove('is-selected');
    button.setAttribute('aria-pressed', 'false');
  });
  timeChoices.forEach((button) => {
    button.classList.remove('is-selected');
    button.setAttribute('aria-pressed', 'false');
  });
  riderTotal.textContent = '1';
  summaryDate.textContent = 'Choose a date';
  summaryTime.textContent = 'Choose a time';
  summaryRiders.textContent = '01 rider';
  bookingHint.textContent = 'Choose a date and time to continue.';
  bookingHint.classList.remove('is-error');
  updateBookingView();
};

buildDates();
updateRide(bookingState.ride);
updateBookingView();

document.querySelectorAll('[data-booking-open]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openBooking(trigger);
  });
});

bookingClose.addEventListener('click', closeBooking);
booking.querySelector('[data-booking-done]').addEventListener('click', closeBooking);
booking.querySelector('[data-booking-reset]').addEventListener('click', resetBooking);

booking.addEventListener('click', (event) => {
  if (event.target === booking) closeBooking();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && booking.classList.contains('is-open')) closeBooking();
});

rideChoices.forEach((choice) => choice.addEventListener('click', () => updateRide(choice.dataset.rideChoice)));

datePicker.addEventListener('click', (event) => {
  const button = event.target.closest('[data-date]');
  if (!button) return;
  bookingState.date = button.dataset.date;
  bookingState.dateLabel = button.dataset.label;
  datePicker.querySelectorAll('button').forEach((dateButton) => {
    const selected = dateButton === button;
    dateButton.classList.toggle('is-selected', selected);
    dateButton.setAttribute('aria-pressed', String(selected));
  });
  summaryDate.textContent = bookingState.dateLabel;
  bookingHint.classList.remove('is-error');
});

timeChoices.forEach((button) => button.addEventListener('click', () => {
  bookingState.time = button.dataset.time;
  timeChoices.forEach((timeButton) => {
    const selected = timeButton === button;
    timeButton.classList.toggle('is-selected', selected);
    timeButton.setAttribute('aria-pressed', String(selected));
  });
  summaryTime.textContent = `${bookingState.time} · Istanbul`;
  bookingHint.classList.remove('is-error');
}));

const setRiders = (nextTotal) => {
  bookingState.riders = Math.max(1, Math.min(6, nextTotal));
  riderTotal.textContent = String(bookingState.riders);
  summaryRiders.textContent = `${String(bookingState.riders).padStart(2, '0')} ${bookingState.riders === 1 ? 'rider' : 'riders'}`;
};

booking.querySelector('[data-rider-minus]').addEventListener('click', () => setRiders(bookingState.riders - 1));
booking.querySelector('[data-rider-plus]').addEventListener('click', () => setRiders(bookingState.riders + 1));

bookingBack.addEventListener('click', () => {
  if (bookingState.step > 1) {
    bookingState.step -= 1;
    updateBookingView();
  }
});

bookingNext.addEventListener('click', () => {
  if (bookingState.step === 2 && (!bookingState.date || !bookingState.time)) {
    bookingHint.textContent = 'Select both a preferred date and departure window.';
    bookingHint.classList.add('is-error');
    return;
  }

  if (bookingState.step === 3 && !bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  if (bookingState.step < 4) {
    bookingState.step += 1;
    updateBookingView();
  }
});

bookingForm.addEventListener('submit', (event) => event.preventDefault());

