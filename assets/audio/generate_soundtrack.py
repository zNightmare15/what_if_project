import numpy as np
import wave
import struct
import subprocess
import os

SAMPLE_RATE = 44100
DURATION = 78.0  # Full 1:18 video length matching reference

def generate_soundtrack(output_wav="soundtrack_cinematic.wav"):
    print(f"Synthesizing procedural cinematic soundtrack ({DURATION}s at {SAMPLE_RATE}Hz)...")
    n_samples = int(SAMPLE_RATE * DURATION)
    t = np.linspace(0, DURATION, n_samples, endpoint=False)
    
    # Stereo channels
    left = np.zeros(n_samples, dtype=np.float64)
    right = np.zeros(n_samples, dtype=np.float64)

    # =========================================================================
    # 1. PHASE 1 (0.0s - 8.0s): Central Park Ambience + Nostalgic Chime Melody
    # =========================================================================
    mask_p1 = (t < 8.0)
    t_p1 = t[mask_p1]
    n_p1 = len(t_p1)
    
    # Soft park breeze / distant city hum (filtered pink-ish noise)
    rng = np.random.default_rng(42)
    white = rng.normal(0, 1, n_p1)
    breeze = np.convolve(white, np.ones(80)/80, mode='same') * 0.04
    left[mask_p1] += breeze
    right[mask_p1] += np.roll(breeze, 200)

    # Chirping birds (FM modulated high sine bursts)
    bird_times = [0.4, 0.65, 1.4, 2.1, 2.3, 3.5, 4.2, 4.45, 5.8, 6.4, 7.1]
    for bt in bird_times:
        b_mask = (t >= bt) & (t < bt + 0.18)
        tb = t[b_mask] - bt
        freq = 2800 + 900 * np.sin(2 * np.pi * 25 * tb) + 1200 * (tb / 0.18)
        env = np.sin(np.pi * tb / 0.18) ** 2
        chirp = np.sin(2 * np.pi * freq * tb) * env * 0.045
        pan = 0.3 + 0.4 * ((bt * 7) % 1.0)
        left[b_mask] += chirp * pan
        right[b_mask] += chirp * (1 - pan)

    # Nostalgic Music Box / Celesta Arpeggio (0.0s - 8.0s)
    notes_hz = [523.25, 659.25, 783.99, 1046.50, 987.77, 783.99, 659.25, 587.33] * 3
    for idx, freq in enumerate(notes_hz):
        nt = idx * 0.36
        if nt >= 7.8:
            break
        n_mask = (t >= nt) & (t < min(8.0, nt + 1.2))
        tn = t[n_mask] - nt
        env = np.exp(-3.5 * tn) * (1 - np.exp(-80 * tn))
        tone = (np.sin(2 * np.pi * freq * tn) + 0.3 * np.sin(2 * np.pi * freq * 2 * tn)) * env * 0.08
        left[n_mask] += tone * (0.6 if idx % 2 == 0 else 0.4)
        right[n_mask] += tone * (0.4 if idx % 2 == 0 else 0.6)

    # Countdown ticks (0.0s - 8.0s)
    for sec in range(8):
        tk_mask = (t >= sec) & (t < sec + 0.04)
        ttk = t[tk_mask] - sec
        tick = np.sin(2 * np.pi * 1200 * ttk) * np.exp(-90 * ttk) * 0.12
        left[tk_mask] += tick
        right[tk_mask] += tick

    # =========================================================================
    # 2. PHASE 2 (8.0s - 28.0s): Electrons Vanish! Sub-Bass Drop + Eerie Tinnitus + Slow Bells
    # =========================================================================
    # Massive Sub-Bass Impact at t = 8.0s
    imp_mask = (t >= 8.0) & (t < 11.5)
    t_imp = t[imp_mask] - 8.0
    freq_drop = 110 * np.exp(-1.2 * t_imp) + 32
    phase_drop = 2 * np.pi * np.cumsum(freq_drop) / SAMPLE_RATE
    sub_drop = np.sin(phase_drop) * np.exp(-0.7 * t_imp) * 0.55
    # Glitch burst at 8.0s
    glitch_mask = (t >= 8.0) & (t < 8.18)
    t_gl = t[glitch_mask] - 8.0
    glitch = rng.uniform(-1, 1, len(t_gl)) * np.exp(-20 * t_gl) * 0.45
    left[imp_mask] += sub_drop
    right[imp_mask] += sub_drop
    left[glitch_mask] += glitch
    right[glitch_mask] += glitch

    # Eerie High-Pitched Tinnitus Ring + Dark Drone (8.0s - 28.0s)
    eerie_mask = (t >= 8.0) & (t < 28.5)
    t_ee = t[eerie_mask] - 8.0
    tinnitus_env = np.exp(-0.12 * t_ee) * (1 - np.exp(-5 * t_ee))
    tinnitus = np.sin(2 * np.pi * 3120 * t_ee) * tinnitus_env * 0.07
    
    # Deep Dark Pad (D minor / Phrygian cluster: 55Hz, 82.4Hz, 110Hz, 116.5Hz)
    drone = (
        0.4 * np.sin(2 * np.pi * 55.0 * t_ee) +
        0.25 * np.sin(2 * np.pi * 82.41 * t_ee + 0.3) +
        0.25 * np.sin(2 * np.pi * 110.0 * t_ee) +
        0.18 * np.sin(2 * np.pi * 116.54 * t_ee)
    ) * (1 - np.exp(-1.5 * t_ee)) * 0.28
    left[eerie_mask] += tinnitus + drone
    right[eerie_mask] += tinnitus * 0.9 + drone

    # Slow Haunting Bell Notes (9.5s, 13.5s, 17.5s, 21.5s, 25.0s)
    eerie_bells = [(9.2, 587.33), (13.0, 523.25), (16.8, 466.16), (20.8, 440.0), (24.5, 392.0)]
    for bt, bfreq in eerie_bells:
        bm = (t >= bt) & (t < bt + 4.0)
        tb = t[bm] - bt
        b_env = np.exp(-0.9 * tb) * (1 - np.exp(-40 * tb))
        bell = (np.sin(2 * np.pi * bfreq * tb) + 0.4 * np.sin(2 * np.pi * (bfreq * 1.5) * tb)) * b_env * 0.12
        left[bm] += bell * 0.7
        right[bm] += bell * 0.5

    # =========================================================================
    # 3. PHASE 3 (28.0s - 42.5s): Geiger Counter Acceleration + Nuclear Bloom Riser
    # =========================================================================
    # Geiger clicks accelerating exponentially from 28s to 41.5s
    click_t = 28.0
    while click_t < 41.8:
        progress = (click_t - 28.0) / 13.8  # 0 to 1
        interval = max(0.004, 0.12 * ((1 - progress) ** 2.2) + rng.uniform(0.001, 0.015))
        cm = (t >= click_t) & (t < click_t + 0.003)
        if np.any(cm):
            amp = 0.12 + 0.25 * progress
            burst = rng.uniform(-1, 1, np.sum(cm)) * amp
            left[cm] += burst
            right[cm] += burst
        click_t += interval

    # Massive Shepard / Turbine Nuclear Riser (28.0s - 42.2s)
    riser_mask = (t >= 28.0) & (t < 42.2)
    t_ris = t[riser_mask] - 28.0
    prog_ris = t_ris / 14.2  # 0 to 1
    f_ris1 = 65 * (2 ** (prog_ris * 3.5))
    f_ris2 = 130 * (2 ** (prog_ris * 3.5))
    f_ris3 = 260 * (2 ** (prog_ris * 3.5))
    ph1 = 2 * np.pi * np.cumsum(f_ris1) / SAMPLE_RATE
    ph2 = 2 * np.pi * np.cumsum(f_ris2) / SAMPLE_RATE
    ph3 = 2 * np.pi * np.cumsum(f_ris3) / SAMPLE_RATE
    riser_env = (prog_ris ** 2.0) * 0.45
    riser_sig = (np.sin(ph1) + 0.6 * np.sin(ph2) + 0.4 * np.sawtooth if hasattr(np, 'sawtooth') else np.sin(ph3)) * riser_env
    # Add roaring filtered noise
    roar = rng.normal(0, 1, len(t_ris)) * (prog_ris ** 2.5) * 0.35
    left[riser_mask] += riser_sig + roar
    right[riser_mask] += riser_sig + np.roll(roar, 50)

    # =========================================================================
    # 4. PHASE 4 (42.2s - 64.0s): Planetary Explosion + Space Rumble + Moon Impact
    # =========================================================================
    # Huge Detonation at 42.2s
    det_mask = (t >= 42.2) & (t < 64.0)
    t_det = t[det_mask] - 42.2
    det_boom = np.sin(2 * np.pi * (45 * np.exp(-0.2 * t_det) + 28) * t_det) * np.exp(-0.15 * t_det) * 0.5
    space_noise = np.convolve(rng.normal(0, 1, len(t_det)), np.ones(250)/250, mode='same')
    space_rumble = space_noise * np.exp(-0.08 * t_det) * 0.45
    left[det_mask] += det_boom + space_rumble
    right[det_mask] += det_boom + np.roll(space_rumble, 120)

    # Moon impact whoosh/shockwave at 55.0s ("THE MOON IS GONE")
    moon_mask = (t >= 54.5) & (t < 58.5)
    t_mn = t[moon_mask] - 54.5
    moon_hit = np.sin(2 * np.pi * (80 * np.exp(-0.8 * t_mn) + 25) * t_mn) * np.exp(-0.9 * t_mn) * 0.45
    left[moon_mask] += moon_hit
    right[moon_mask] += moon_hit

    # Final Riser before Electrons Return (59.0s - 64.0s)
    ret_riser_mask = (t >= 59.0) & (t < 64.0)
    t_rr = t[ret_riser_mask] - 59.0
    p_rr = t_rr / 5.0
    ph_rr = 2 * np.pi * np.cumsum(90 * (2 ** (p_rr * 3.0))) / SAMPLE_RATE
    rr_sig = np.sin(ph_rr) * (p_rr ** 2) * 0.4 + rng.normal(0, 1, len(t_rr)) * (p_rr ** 2.5) * 0.3
    left[ret_riser_mask] += rr_sig
    right[ret_riser_mask] += rr_sig

    # =========================================================================
    # 5. PHASE 5 (64.0s - 72.0s): ELECTRONS BACK (Ethereal Chimes -> 2nd Blast at 69.5s)
    # =========================================================================
    chime_mask = (t >= 64.0) & (t < 69.8)
    t_ch = t[chime_mask] - 64.0
    chime_env = np.exp(-0.5 * t_ch) * (1 - np.exp(-30 * t_ch))
    chime_chord = (
        np.sin(2 * np.pi * 523.25 * t_ch) +
        0.7 * np.sin(2 * np.pi * 659.25 * t_ch) +
        0.6 * np.sin(2 * np.pi * 783.99 * t_ch) +
        0.5 * np.sin(2 * np.pi * 1174.66 * t_ch)
    ) * chime_env * 0.14
    left[chime_mask] += chime_chord
    right[chime_mask] += chime_chord * 0.9

    # Second Massive Explosion at 69.5s - 72.2s ("With nothing to hold them, they explode too")
    blast2_mask = (t >= 69.2) & (t < 72.2)
    t_b2 = t[blast2_mask] - 69.2
    b2_env = np.sin(np.pi * (t_b2 / 3.0)) ** 0.7
    b2_roar = rng.normal(0, 1, len(t_b2)) * b2_env * 0.55
    b2_sub = np.sin(2 * np.pi * 42 * t_b2) * b2_env * 0.45
    left[blast2_mask] += b2_roar + b2_sub
    right[blast2_mask] += np.roll(b2_roar, 80) + b2_sub

    # =========================================================================
    # 6. PHASE 6 (72.2s - 78.0s): Outro Black Screen Deep Heartbeat Thud
    # =========================================================================
    for hb in [73.5, 75.5]:
        h_mask = (t >= hb) & (t < hb + 0.8)
        th = t[h_mask] - hb
        thud = np.sin(2 * np.pi * (55 * np.exp(-4 * th) + 28) * th) * np.exp(-5 * th) * 0.4
        left[h_mask] += thud
        right[h_mask] += thud

    # Soft limiter / tanh saturation to prevent clipping
    left = np.tanh(left * 1.2) * 0.92
    right = np.tanh(right * 1.2) * 0.92

    # Interleave and write 16-bit stereo WAV
    stereo = np.empty((n_samples * 2,), dtype=np.int16)
    stereo[0::2] = (left * 32767).astype(np.int16)
    stereo[1::2] = (right * 32767).astype(np.int16)

    with wave.open(output_wav, "w") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(stereo.tobytes())

    # Convert to MP3 via ffmpeg for lightweight browser loading
    output_mp3 = "soundtrack_cinematic.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-i", output_wav,
        "-codec:a", "libmp3lame", "-qscale:a", "2", output_mp3
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Generated {output_wav} and {output_mp3} successfully!")

if __name__ == "__main__":
    generate_soundtrack()

