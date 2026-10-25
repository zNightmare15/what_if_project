// Modular Story Configuration for "What If" 3D Simulation Pipeline
// Auto-compiled by build_story.js from: stories/sun_vanishes.json
// Can be swapped or generated via `node build_story.js stories/<name>.json`

window.STORY_CONFIG = {
  "id": "sun_vanishes",
  "totalDuration": 45,
  "showText": false,
  "titleHTML": "What if <span class=\"hl\">the Sun</span> vanished?",
  "outroTitleHTML": "What if <span class=\"hl\">the Sun</span> vanished?",
  "outroSubHTML": "LIGHT TAKES 8 MINUTES AND 20 SECONDS TO REACH US.<br>GRAVITY TRAVELS AT THE EXACT SAME SPEED.",
  "audioSrc": "assets/audio/sun_vanishes_ambient.mp3",
  "meta": {
    "title": "What if the Sun vanished?",
    "style": "cosmic_simulation",
    "aspectRatio": "9:16",
    "resolution": {
      "width": 1080,
      "height": 1920
    },
    "fps": 60,
    "totalDuration": 45,
    "showText": false,
    "audioSrc": "assets/audio/sun_vanishes_ambient.mp3"
  },
  "hook": {
    "prefix": "What if",
    "highlightWord": "the Sun",
    "highlightColor": "#f59e0b",
    "suffix": "vanished?",
    "titleHTML": "What if <span class=\"hl\">the Sun</span> vanished?",
    "visibleStart": 0,
    "visibleEnd": 4
  },
  "timerPhases": [
    {
      "id": "orbit_countdown",
      "start": 0,
      "end": 8.033,
      "label": "GRAVITY AND LIGHT",
      "mode": "countdown",
      "countdownFrom": 8.033,
      "timeScale": 1,
      "format": "0:0{sec.3}"
    },
    {
      "id": "light_arrival_countdown",
      "start": 8.033,
      "end": 16,
      "label": "LAST SUNLIGHT EN ROUTE",
      "mode": "slowmo_countdown",
      "countdownFrom": 8,
      "timeScale": 1,
      "format": "0:0{sec.3}"
    },
    {
      "id": "darkness_static",
      "start": 16,
      "end": 45,
      "label": "ROGUE PLANET",
      "mode": "static_serif",
      "staticText": "LOST IN SPACE",
      "fadeOutStart": 43.5,
      "fadeOutEnd": 45
    }
  ],
  "subtracks": [
    {
      "start": 0,
      "end": 8.033,
      "type": "static",
      "text": "EARTH ORBITS THE SUN AT 67,000 MPH"
    },
    {
      "start": 8.033,
      "end": 16,
      "type": "static",
      "text": "WITHOUT GRAVITY, EARTH FLIES OFF IN A STRAIGHT LINE"
    },
    {
      "start": 16,
      "end": 24,
      "type": "static",
      "text": "THE LAST PHOTONS ARRIVE — TOTAL DARKNESS FALLS"
    },
    {
      "start": 24,
      "end": 45,
      "type": "static",
      "text": "SURFACE TEMPERATURE DROPS TO -100°F IN DAYS"
    }
  ],
  "visualPhases": [
    {
      "id": "orbital_daylight",
      "world": "solarSystem",
      "lookPreset": "day",
      "start": 0,
      "end": 8.033,
      "triggers": {
        "sunVisible": true,
        "gravityActive": true
      }
    },
    {
      "id": "tangential_flight",
      "world": "solarSystem",
      "lookPreset": "sunlight_persisting",
      "start": 8.033,
      "end": 16,
      "triggers": {
        "sunVisible": false,
        "gravityActive": false,
        "lightWaveEnRoute": true
      }
    },
    {
      "id": "light_extinction",
      "world": "spaceWorld",
      "lookPreset": "night_grid",
      "start": 16,
      "end": 22,
      "triggers": {
        "lightExtinctionFlash": true,
        "nightCitiesActive": true
      }
    },
    {
      "id": "rogue_freeze",
      "world": "spaceWorld",
      "lookPreset": "deep_space_ice",
      "start": 22,
      "end": 45,
      "triggers": {
        "iceSpread": true,
        "gridFailure": true,
        "zoomOut": true
      }
    }
  ],
  "cameraKeyframes": [
    {
      "id": "cam_orbit_sweep",
      "start": 0,
      "end": 8.033,
      "interpStart": 0,
      "interpEnd": 8.033,
      "posFrom": [
        5.6,
        0.9,
        3.6
      ],
      "posTo": [
        5.6,
        2.3,
        -3
      ],
      "lookFrom": [
        -4.5,
        1,
        0
      ],
      "lookTo": [
        -8.5,
        1.7,
        0
      ],
      "lensFov": 48
    },
    {
      "id": "cam_tangent_escape",
      "start": 8.033,
      "end": 16,
      "interpStart": 8.033,
      "interpEnd": 16,
      "posFrom": [
        -3.6,
        2,
        4.2
      ],
      "posTo": [
        -5,
        1.4,
        3.4
      ],
      "lookFrom": [
        -5.8,
        0.7,
        0
      ],
      "lookTo": [
        0.4,
        1.3,
        0
      ],
      "lensFov": 48
    },
    {
      "id": "cam_extinction_close",
      "start": 16,
      "end": 22,
      "interpStart": 16,
      "interpEnd": 22,
      "posFrom": [
        -5,
        1.4,
        3.4
      ],
      "posTo": [
        -2,
        2.2,
        6.2
      ],
      "lookFrom": [
        0,
        0,
        0
      ],
      "lookTo": [
        0,
        0,
        0
      ],
      "lensFov": 48
    },
    {
      "id": "cam_rogue_zoomout",
      "start": 22,
      "end": 45,
      "interpStart": 30,
      "interpEnd": 45,
      "posFrom": [
        -2,
        2.2,
        6.2
      ],
      "posTo": [
        -25,
        60,
        120
      ],
      "lookFrom": [
        0,
        0,
        0
      ],
      "lookTo": [
        0,
        0,
        0
      ],
      "lensFov": 48
    }
  ],
  "outro": {
    "titleHTML": "What if <span class=\"hl\">the Sun</span> vanished?",
    "subHTML": "LIGHT TAKES 8 MINUTES AND 20 SECONDS TO REACH US.<br>GRAVITY TRAVELS AT THE EXACT SAME SPEED.",
    "facts": [
      "LIGHT TAKES 8 MINUTES AND 20 SECONDS TO REACH US.",
      "GRAVITY TRAVELS AT THE EXACT SAME SPEED."
    ]
  },
  "scenes": [
    {
      "id": 1,
      "name": "Orbital Daylight",
      "start": 0,
      "end": 8.033,
      "desc": "Earth orbits the radiant Sun normally; smooth sweep camera tracking the illuminated hemisphere.",
      "color": "#f59e0b",
      "badge": "NORMAL"
    },
    {
      "id": 2,
      "name": "Gravitational Cut",
      "start": 8.033,
      "end": 16,
      "desc": "The Sun vanishes instantly. Gravity ceases, Earth flies tangentially into interstellar space at 67,000 mph. Daylight persists because photons are still en route.",
      "color": "#ef4444",
      "badge": "TANGENT"
    },
    {
      "id": 3,
      "name": "Light Extinction (8 Minutes Later)",
      "start": 16,
      "end": 22,
      "desc": "The last sunlight shell reaches Earth. Global darkness falls instantly. City lights illuminate the night continents.",
      "color": "#3b82f6",
      "badge": "EXTINCTION"
    },
    {
      "id": 4,
      "name": "The Great Freeze & Rogue Earth",
      "start": 22,
      "end": 45,
      "desc": "Atmosphere and oceans begin to freeze solid into a cracked icy crust. Power grids fail. Camera executes a dynamic zoom-out as Rogue Earth wanders the Milky Way.",
      "color": "#6366f1",
      "badge": "ROGUE"
    }
  ],
  "subtitles": [
    {
      "start": 0.5,
      "end": 4,
      "text": "Earth orbits the Sun at 67,000 mph."
    },
    {
      "start": 8.033,
      "end": 12,
      "text": "Gravity vanishes instantly."
    },
    {
      "start": 12.2,
      "end": 15.8,
      "text": "Earth hurtles into interstellar space in a straight line."
    },
    {
      "start": 16,
      "end": 20,
      "text": "8 minutes and 20 seconds later... the last sunlight arrives."
    },
    {
      "start": 20.5,
      "end": 25,
      "text": "Total darkness blankets the globe."
    },
    {
      "start": 25.5,
      "end": 32,
      "text": "Oceans freeze into thick planetary ice sheets."
    },
    {
      "start": 32.5,
      "end": 43,
      "text": "Earth becomes a frozen rogue planet wandering the galaxy forever."
    }
  ]
};
