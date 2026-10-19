#!/usr/bin/env node
/**
 * build_story.js — Modular "What If" Story Preset Validator & Compiler
 *
 * Usage:
 *   node build_story.js stories/electrons_5s.json
 *   node build_story.js stories/gravity_5s_example.json
 *   node build_story.js stories/electrons_5s.json --check
 *   node build_story.js stories/electrons_5s.json --out custom_story_config.js
 */

const fs = require('fs');
const path = require('path');

function printUsage() {
  console.log([
    'Usage: node build_story.js <path-to-story.json> [--check | --dry-run] [--out <target.js>]',
    '',
    'Examples:',
    '  node build_story.js stories/electrons_5s.json',
    '  node build_story.js stories/gravity_5s_example.json',
    '  node build_story.js stories/gravity_5s_example.json --check'
  ].join('\n'));
}

function validateTimeRange(item, label, totalDuration, errors) {
  if (typeof item.start !== 'number' || Number.isNaN(item.start) || item.start < 0) {
    errors.push(`${label}: invalid "start" timestamp (${item.start})`);
  }
  if (typeof item.end !== 'number' || Number.isNaN(item.end) || item.end <= item.start) {
    errors.push(`${label}: "end" (${item.end}) must be greater than "start" (${item.start})`);
  }
  if (typeof totalDuration === 'number' && item.end > totalDuration + 0.001) {
    errors.push(`${label}: "end" (${item.end}) exceeds totalDuration (${totalDuration})`);
  }
}

function validateStoryPreset(preset) {
  const errors = [];

  if (!preset || typeof preset !== 'object') {
    errors.push('Root preset must be a valid JSON object.');
    return errors;
  }

  if (typeof preset.id !== 'string' || !preset.id.trim()) {
    errors.push('Missing or invalid string "id".');
  }

  // 1. Meta validation
  const meta = preset.meta;
  if (!meta || typeof meta !== 'object') {
    errors.push('Missing "meta" object.');
  } else {
    if (typeof meta.totalDuration !== 'number' || meta.totalDuration <= 0) {
      errors.push('meta.totalDuration must be a positive number.');
    }
    if (typeof meta.audioSrc !== 'string' || !meta.audioSrc.trim()) {
      errors.push('meta.audioSrc must be a non-empty string.');
    }
  }

  const totalDuration = meta && typeof meta.totalDuration === 'number' ? meta.totalDuration : 80.0;

  // 2. Hook validation
  const hook = preset.hook;
  if (!hook || typeof hook !== 'object') {
    errors.push('Missing "hook" object.');
  } else {
    if (typeof hook.highlightWord !== 'string' || !hook.highlightWord.trim()) {
      errors.push('hook.highlightWord must be a non-empty string.');
    }
    if (typeof hook.titleHTML !== 'string' && (typeof hook.prefix !== 'string' || typeof hook.suffix !== 'string')) {
      errors.push('hook must provide either "titleHTML" or both "prefix" and "suffix".');
    }
  }

  // 3. Timer phases validation
  if (!Array.isArray(preset.timerPhases) || preset.timerPhases.length === 0) {
    errors.push('"timerPhases" must be a non-empty array.');
  } else {
    preset.timerPhases.forEach((tp, idx) => {
      validateTimeRange(tp, `timerPhases[${idx}] (${tp.id || 'unnamed'})`, totalDuration, errors);
      if (typeof tp.label !== 'string' || !tp.label.trim()) {
        errors.push(`timerPhases[${idx}]: missing "label".`);
      }
      if (!['countdown', 'slowmo_countdown', 'static_serif'].includes(tp.mode)) {
        errors.push(`timerPhases[${idx}]: unsupported mode "${tp.mode}".`);
      }
    });
  }

  // 4. Subtrack telemetry validation
  if (!Array.isArray(preset.subtracks) || preset.subtracks.length === 0) {
    errors.push('"subtracks" must be a non-empty array.');
  } else {
    preset.subtracks.forEach((st, idx) => {
      validateTimeRange(st, `subtracks[${idx}]`, totalDuration, errors);
      if (st.type === 'telemetry_counter') {
        if (typeof st.template !== 'string' || !st.template.includes('{value}')) {
          errors.push(`subtracks[${idx}]: telemetry_counter requires a "template" containing "{value}".`);
        }
        if (typeof st.baseValue !== 'number' || typeof st.ratePerSec !== 'number') {
          errors.push(`subtracks[${idx}]: telemetry_counter requires numeric "baseValue" and "ratePerSec".`);
        }
      } else if (typeof st.text !== 'string') {
        errors.push(`subtracks[${idx}]: static subtrack requires a "text" string.`);
      }
    });
  }

  // 5. Visual phases validation
  if (!Array.isArray(preset.visualPhases) || preset.visualPhases.length === 0) {
    errors.push('"visualPhases" must be a non-empty array.');
  } else {
    preset.visualPhases.forEach((vp, idx) => {
      validateTimeRange(vp, `visualPhases[${idx}] (${vp.id || 'unnamed'})`, totalDuration, errors);
      if (typeof vp.world !== 'string' || !vp.world.trim()) {
        errors.push(`visualPhases[${idx}]: missing "world" identifier.`);
      }
    });
  }

  // 6. Camera keyframes validation
  if (!Array.isArray(preset.cameraKeyframes) || preset.cameraKeyframes.length === 0) {
    errors.push('"cameraKeyframes" must be a non-empty array.');
  } else {
    preset.cameraKeyframes.forEach((ck, idx) => {
      validateTimeRange(ck, `cameraKeyframes[${idx}] (${ck.id || 'unnamed'})`, totalDuration, errors);
      const vecFields = ['posFrom', 'posTo', 'lookFrom', 'lookTo'];
      for (const vf of vecFields) {
        if (!Array.isArray(ck[vf]) || ck[vf].length !== 3 || ck[vf].some(n => typeof n !== 'number')) {
          errors.push(`cameraKeyframes[${idx}]: "${vf}" must be a [x, y, z] numeric array.`);
        }
      }
    });
  }

  // 7. Scenes validation
  if (!Array.isArray(preset.scenes) || preset.scenes.length === 0) {
    errors.push('"scenes" must be a non-empty array.');
  } else {
    preset.scenes.forEach((sc, idx) => {
      validateTimeRange(sc, `scenes[${idx}] (${sc.name || sc.id || idx})`, totalDuration, errors);
      if (typeof sc.name !== 'string' || !sc.name.trim()) {
        errors.push(`scenes[${idx}]: missing "name".`);
      }
    });
  }

  // 8. Subtitles validation
  if (!Array.isArray(preset.subtitles) || preset.subtitles.length === 0) {
    errors.push('"subtitles" must be a non-empty array.');
  } else {
    preset.subtitles.forEach((sub, idx) => {
      validateTimeRange(sub, `subtitles[${idx}]`, totalDuration, errors);
      if (typeof sub.text !== 'string' || !sub.text.trim()) {
        errors.push(`subtitles[${idx}]: missing "text".`);
      }
    });
  }

  // 9. Outro validation
  if (!preset.outro || typeof preset.outro !== 'object') {
    errors.push('Missing "outro" object.');
  } else {
    const hasSubHTML = typeof preset.outro.subHTML === 'string' && preset.outro.subHTML.trim().length > 0;
    const hasFacts = Array.isArray(preset.outro.facts) && preset.outro.facts.length > 0;
    if (!hasSubHTML && !hasFacts) {
      errors.push('outro must include "subHTML" or a non-empty "facts" array.');
    }
  }

  return errors;
}

function compileStoryConfig(preset, sourceFile) {
  const titleHTML = preset.hook.titleHTML ||
    `${preset.hook.prefix} <span class="hl">${preset.hook.highlightWord}</span> ${preset.hook.suffix}`;

  const outroTitleHTML = (preset.outro && preset.outro.titleHTML) || titleHTML;
  const outroSubHTML = (preset.outro && preset.outro.subHTML) ||
    (Array.isArray(preset.outro.facts) ? preset.outro.facts.join('<br>') : '');

  const compiledObj = {
    id: preset.id,
    totalDuration: preset.meta.totalDuration,
    showText: preset.meta.showText !== false,
    titleHTML,
    outroTitleHTML,
    outroSubHTML,
    audioSrc: preset.meta.audioSrc,
    meta: preset.meta,
    hook: preset.hook,
    timerPhases: preset.timerPhases,
    subtracks: preset.subtracks,
    visualPhases: preset.visualPhases,
    cameraKeyframes: preset.cameraKeyframes,
    outro: preset.outro,
    scenes: preset.scenes,
    subtitles: preset.subtitles
  };

  const banner = [
    '// Modular Story Configuration for "What If" 3D Simulation Pipeline',
    `// Auto-compiled by build_story.js from: ${sourceFile.replace(/\\/g, '/')}`,
    '// Can be swapped or generated via `node build_story.js stories/<name>.json`',
    ''
  ].join('\n');

  return `${banner}\nwindow.STORY_CONFIG = ${JSON.stringify(compiledObj, null, 2)};\n`;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const checkOnly = args.includes('--check') || args.includes('--dry-run');
  let outPath = path.resolve(__dirname, 'story_config.js');
  const outIdx = args.indexOf('--out');
  if (outIdx !== -1 && args[outIdx + 1]) {
    outPath = path.resolve(process.cwd(), args[outIdx + 1]);
  }

  const positional = args.filter((arg, i) => {
    if (arg.startsWith('--')) return false;
    if (outIdx !== -1 && i === outIdx + 1) return false;
    return true;
  });

  if (positional.length === 0) {
    console.error('[ERROR] No story JSON file specified.');
    printUsage();
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), positional[0]);
  if (!fs.existsSync(inputPath)) {
    console.error(`[ERROR] Story preset file not found: ${inputPath}`);
    process.exit(1);
  }

  let preset;
  try {
    const raw = fs.readFileSync(inputPath, 'utf8');
    preset = JSON.parse(raw);
  } catch (err) {
    console.error(`[ERROR] Failed to parse JSON in ${inputPath}:\n  ${err.message}`);
    process.exit(1);
  }

  const errors = validateStoryPreset(preset);
  if (errors.length > 0) {
    console.error(`[VALIDATION FAILED] ${path.basename(inputPath)} has ${errors.length} error(s):`);
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  const relSource = path.relative(__dirname, inputPath);
  const compiledJS = compileStoryConfig(preset, relSource);

  if (checkOnly) {
    console.log(`[OK] Validated preset "${preset.id}" (${relSource})`);
    console.log(`  - Title:           ${preset.meta.title}`);
    console.log(`  - Duration:        ${preset.meta.totalDuration}s`);
    console.log(`  - Timer Phases:    ${preset.timerPhases.length}`);
    console.log(`  - Subtracks:       ${preset.subtracks.length}`);
    console.log(`  - Visual Phases:   ${preset.visualPhases.length}`);
    console.log(`  - Camera Shots:    ${preset.cameraKeyframes.length}`);
    console.log(`  - Scenes:          ${preset.scenes.length}`);
    console.log(`  - Subtitles:       ${preset.subtitles.length}`);
    console.log('  (Dry-run mode: story_config.js was not modified)');
    return;
  }

  fs.writeFileSync(outPath, compiledJS, 'utf8');
  console.log(`[BUILT] Compiled "${preset.id}" -> ${path.relative(process.cwd(), outPath)}`);
}

main();
