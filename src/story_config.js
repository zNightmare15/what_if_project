// Modular Story Configuration for "What If" 3D Simulation Pipeline
// Can be swapped or generated via LLM prompt to adapt to new "What If" stories

window.STORY_CONFIG = {
  totalDuration: 80.0,
  showText: true,
  titleHTML: 'What if <span class="hl">electrons</span> disappeared<br>for 5 seconds?',
  outroTitleHTML: 'What if <span class="hl">electrons</span> disappeared<br>for 5 seconds?',
  outroSubHTML: 'ELECTRONS ARE 0.03% OF YOUR MASS<br>AND EVERY CHEMICAL BOND IN YOUR BODY',
  audioSrc: 'original_audio.mp3',

  scenes: [
    {
      id: 1,
      name: "Central Park Daylight & Atom",
      start: 0.0,
      end: 8.033,
      badge: "Low-Poly Daylight",
      color: "#10b981",
      desc: "Picnic en Central Park, perro saltando, rascacielos NYC y átomo 3D animado."
    },
    {
      id: 2,
      name: "Electrons Vanish: X-Ray & Sun Flare",
      start: 8.033,
      end: 14.8,
      badge: "X-Ray + Sun",
      color: "#0ea5e9",
      desc: "Tiempo ralentizado 11x. La luz atraviesa la materia; Sol con lente anamórfica y perro en el aire."
    },
    {
      id: 3,
      name: "Stars Through Your Hands (POV)",
      start: 14.8,
      end: 19.8,
      badge: "1st Person Hands",
      color: "#6366f1",
      desc: "Cámara baja a tus manos translúcidas viendo las estrellas a través de ellas."
    },
    {
      id: 4,
      name: "Pure Positive Charge & Repulsion",
      start: 19.8,
      end: 28.0,
      badge: "Electrostatic",
      color: "#8b5cf6",
      desc: "Paneo por el parque congelado mientras cada átomo se vuelve carga positiva pura."
    },
    {
      id: 5,
      name: "Coulomb Explosion: Sand & Nuclear Glow",
      start: 28.0,
      end: 42.2,
      badge: "Nuclear Bloom",
      color: "#f59e0b",
      desc: "Cada grano de arena detona; tus manos y cada persona brillan más que el Sol hasta el whiteout."
    },
    {
      id: 6,
      name: "Planetary Expansion & The Moon Is Gone",
      start: 42.2,
      end: 64.0,
      badge: "Orbital Space",
      color: "#ec4899",
      desc: "La Tierra se expande a velocidad relativista, engulle la Luna y vista del horizonte orbital."
    },
    {
      id: 7,
      name: "Electrons Back: LiDAR City & 2nd Blast",
      start: 64.0,
      end: 72.5,
      badge: "LiDAR PointCloud",
      color: "#3b82f6",
      desc: "Nube de 110.000 electrones azules reconstruye Central Park y explota hacia arriba."
    },
    {
      id: 8,
      name: "Final Outro Card",
      start: 72.5,
      end: 80.0,
      badge: "Outro",
      color: "#64748b",
      desc: "Pantalla negra final con el dato científico de la masa de los electrones."
    }
  ],

  subtitles: [
    { start: 5.0, end: 7.8, text: "You're in Central Park, New York." },
    { start: 8.5, end: 12.2, text: "Light now passes straight through<br>everything." },
    { start: 15.5, end: 19.4, text: "You can see the stars through your hands." },
    { start: 20.3, end: 23.9, text: "Every atom is now pure positive charge." },
    { start: 24.3, end: 27.7, text: "And positive charges repel." },
    { start: 30.8, end: 34.8, text: "Each grain of sand becomes a nuclear bomb." },
    { start: 36.0, end: 40.0, text: "Each person outshines the Sun." },
    { start: 43.5, end: 48.8, text: "Earth comes apart at nearly light speed." },
    { start: 49.4, end: 54.4, text: "More than the Milky Way will ever shine." },
    { start: 64.6, end: 68.0, text: "Every electron returns to where it was." },
    { start: 68.4, end: 71.8, text: "With nothing to hold them, they explode too." }
  ]
};

