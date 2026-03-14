const SAN_JOSE = {
  name: "San Jose, CA",
  latitude: 37.3382,
  longitude: -121.8863,
  timeZone: "America/Los_Angeles",
};

const loadingScreen = document.getElementById("loading-screen");

const SYNODIC_MONTH_DAYS = 29.530588853;
const SYNODIC_MONTH_MS = SYNODIC_MONTH_DAYS * 24 * 60 * 60 * 1000;
const BASE_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

const MAJOR_PHASES = [
  {
    key: "new-moon",
    name: "New Moon",
    fraction: 0,
    meaning:
      "The Moon sits roughly between Earth and the Sun, so the illuminated side mostly faces away from us.",
    observation:
      "The Moon is hard to spot, but dark skies make this a strong night for deep-sky observing and a good time to catch faint earthshine just after sunset.",
    bestViewing: "45 to 90 minutes after sunset",
  },
  {
    key: "waxing-crescent",
    name: "Waxing Crescent",
    fraction: 0.125,
    meaning:
      "A slim crescent appears as the illuminated portion grows after new moon.",
    observation:
      "Look low in the western sky after sunset. Binoculars help reveal earthshine across the darker portion of the disk.",
    bestViewing: "Just after sunset in the west",
  },
  {
    key: "first-quarter",
    name: "First Quarter",
    fraction: 0.25,
    meaning:
      "Half the lunar disk appears lit as the Moon reaches the first quarter of its orbit from new moon.",
    observation:
      "This is one of the best times for crater contrast along the terminator. Start at dusk and keep watching into the evening.",
    bestViewing: "Dusk through late evening",
  },
  {
    key: "waxing-gibbous",
    name: "Waxing Gibbous",
    fraction: 0.375,
    meaning:
      "The illuminated area keeps expanding on its way toward full moon.",
    observation:
      "The Moon dominates the evening sky. Surface details remain visible, especially near the shadow line before full moon.",
    bestViewing: "Evening to near midnight",
  },
  {
    key: "full-moon",
    name: "Full Moon",
    fraction: 0.5,
    meaning:
      "Earth is roughly between the Sun and the Moon, so the visible face appears fully illuminated.",
    observation:
      "Watch moonrise for the strongest visual impact. Bright light washes out faint stars, but the disk is easy to spot all night.",
    bestViewing: "At moonrise and through the night",
  },
  {
    key: "waning-gibbous",
    name: "Waning Gibbous",
    fraction: 0.625,
    meaning:
      "After full moon, the illuminated face starts shrinking while the Moon rises later each night.",
    observation:
      "Catch it later in the evening or before dawn. The return of shadow relief improves lunar surface contrast.",
    bestViewing: "Late evening to dawn",
  },
  {
    key: "last-quarter",
    name: "Last Quarter",
    fraction: 0.75,
    meaning:
      "Half the disk is lit again, this time on the waning side as the Moon heads toward new.",
    observation:
      "Best seen after midnight into sunrise, when the terminator again adds strong texture to craters and mountains.",
    bestViewing: "After midnight to sunrise",
  },
  {
    key: "waning-crescent",
    name: "Waning Crescent",
    fraction: 0.875,
    meaning:
      "Only a thin sliver remains lit before the Moon returns to new.",
    observation:
      "Look low in the eastern sky before dawn. Clear horizons help, and the crescent can appear especially delicate in twilight.",
    bestViewing: "Pre-dawn in the east",
  },
];

function setHeroPhaseFromIllumination(illuminationPercent) {
  const value = Math.max(0, Math.min(1, illuminationPercent / 100));
  document.documentElement.style.setProperty("--hero-phase", value.toFixed(2));
}

function hideLoader() {
  if (!loadingScreen) return;
  loadingScreen.classList.add("is-hidden");
}

const formatDateTime = new Intl.DateTimeFormat("en-US", {
  timeZone: SAN_JOSE.timeZone,
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const formatMonth = new Intl.DateTimeFormat("en-US", {
  timeZone: SAN_JOSE.timeZone,
  month: "long",
  year: "numeric",
});

function getPhaseCycle(date) {
  const ageMs = ((date.getTime() - BASE_NEW_MOON_UTC) % SYNODIC_MONTH_MS + SYNODIC_MONTH_MS) % SYNODIC_MONTH_MS;
  const cycle = ageMs / SYNODIC_MONTH_MS;
  return cycle;
}

function getIlluminationPercent(date) {
  const cycle = getPhaseCycle(date);
  const illumination = ((1 - Math.cos(2 * Math.PI * cycle)) / 2) * 100;
  return Math.round(illumination);
}

function getUpcomingPhases() {
  const now = new Date();
  const end = new Date(now.getTime());
  end.setFullYear(end.getFullYear() + 1);

  const currentCycleIndex = Math.floor((now.getTime() - BASE_NEW_MOON_UTC) / SYNODIC_MONTH_MS);
  const phases = [];

  for (let lunation = currentCycleIndex - 1; lunation < currentCycleIndex + 16; lunation += 1) {
    MAJOR_PHASES.forEach((phase) => {
      const phaseTime = new Date(
        BASE_NEW_MOON_UTC + (lunation + phase.fraction) * SYNODIC_MONTH_MS
      );

      if (phaseTime >= now && phaseTime <= end) {
        phases.push({
          ...phase,
          timestamp: phaseTime,
          monthLabel: formatMonth.format(phaseTime),
          localDateTime: formatDateTime.format(phaseTime),
          illumination: `${getIlluminationPercent(phaseTime)}%`,
        });
      }
    });
  }

  return phases.sort((a, b) => a.timestamp - b.timestamp);
}

function updateHero(nextPhase) {
  const summary = document.getElementById("next-phase-summary");
  const caption = document.getElementById("next-phase-caption");

  summary.textContent = `${nextPhase.name} · ${nextPhase.localDateTime}`;
  caption.textContent = `${nextPhase.illumination} illumination expected. Best viewing: ${nextPhase.bestViewing}.`;

  const illuminationValue = Number.parseInt(nextPhase.illumination, 10);
  if (!Number.isNaN(illuminationValue)) {
    setHeroPhaseFromIllumination(illuminationValue);
  }
}

function updateDetails(phase, button) {
  document.querySelectorAll(".phase-card").forEach((card) => {
    card.classList.toggle("is-selected", card === button);
    card.setAttribute("aria-pressed", card === button ? "true" : "false");
  });

  document.getElementById("detail-title").textContent = phase.name;
  document.getElementById("detail-datetime").textContent = `${phase.localDateTime} · ${SAN_JOSE.name}`;
  document.getElementById("detail-illumination").textContent = phase.illumination;
  document.getElementById("detail-viewing").textContent = phase.bestViewing;
  document.getElementById("detail-description").textContent = phase.observation;
  document.getElementById("detail-meaning").textContent = phase.meaning;
}

function createCard(phase, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "phase-card";
  button.setAttribute("role", "listitem");
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", `${phase.name} on ${phase.localDateTime}`);

  button.innerHTML = `
    <span class="phase-card__month">${phase.monthLabel}</span>
    <span class="phase-card__phase">${phase.name}</span>
    <span class="phase-card__datetime">${phase.localDateTime}</span>
    <span class="phase-card__illumination">${phase.illumination} lit</span>
    <p class="phase-card__description">${phase.observation}</p>
  `;

  const handleSelect = () => updateDetails(phase, button);
  button.addEventListener("click", handleSelect);
  button.addEventListener("mouseenter", () => {
    if (window.matchMedia("(hover: hover)").matches) {
      handleSelect();
    }
  });
  button.addEventListener("focus", handleSelect);

  if (index === 0) {
    requestAnimationFrame(() => handleSelect());
  }

  return button;
}

function renderTimeline(phases) {
  const track = document.getElementById("timeline-track");
  const fragment = document.createDocumentFragment();

  phases.forEach((phase, index) => {
    fragment.appendChild(createCard(phase, index));
  });

  track.appendChild(fragment);
}

function init() {
  const phases = getUpcomingPhases();

  if (!phases.length) {
    document.getElementById("next-phase-summary").textContent = "No phases available";
    document.getElementById("next-phase-caption").textContent =
      "The client-side generator could not produce events for the requested range.";
    hideLoader();
    return;
  }

  updateHero(phases[0]);
  renderTimeline(phases);
  hideLoader();
}

init();
