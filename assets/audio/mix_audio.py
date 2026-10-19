import asyncio
import os
import subprocess
import edge_tts

# Audio configuration
VOICE = "en-US-ChristopherNeural"
ORIGINAL_SFX = "d:/Escritorio/what_if_project/original_audio.mp3"
OUTPUT_MIX = "d:/Escritorio/what_if_project/final_audio_mix.mp3"
TEMP_DIR = "d:/Escritorio/what_if_project/temp_speech"

os.makedirs(TEMP_DIR, exist_ok=True)

# Exact 12-line script matching @man_ia_c reference video subtitles & timing
SCRIPT_CUES = [
    {
        "id": 1,
        "text": "What if electrons disappeared for 5 seconds?",
        "start_sec": 0.4
    },
    {
        "id": 2,
        "text": "You're in Central Park, New York.",
        "start_sec": 4.9
    },
    {
        "id": 3,
        "text": "Light now passes straight through everything.",
        "start_sec": 8.6
    },
    {
        "id": 4,
        "text": "You can see the stars through your hands.",
        "start_sec": 15.6
    },
    {
        "id": 5,
        "text": "Every atom is now pure positive charge.",
        "start_sec": 20.3
    },
    {
        "id": 6,
        "text": "And positive charges repel.",
        "start_sec": 24.3
    },
    {
        "id": 7,
        "text": "Each grain of sand becomes a nuclear bomb.",
        "start_sec": 30.8
    },
    {
        "id": 8,
        "text": "Each person outshines the Sun.",
        "start_sec": 36.0
    },
    {
        "id": 9,
        "text": "Earth comes apart at nearly light speed.",
        "start_sec": 43.6
    },
    {
        "id": 10,
        "text": "More than the Milky Way will ever shine.",
        "start_sec": 49.5
    },
    {
        "id": 11,
        "text": "Every electron returns to where it was.",
        "start_sec": 64.6
    },
    {
        "id": 12,
        "text": "With nothing to hold them, they explode too.",
        "start_sec": 68.4
    }
]


async def generate_speech_clips():
    print("1. Generating 12 exact neural speech clips with edge-tts...")
    clips = []
    for cue in SCRIPT_CUES:
        filename = os.path.join(TEMP_DIR, f"cue_{cue['id']:02d}.mp3")
        communicate = edge_tts.Communicate(cue["text"], VOICE, rate="-2%", pitch="-2Hz")
        await communicate.save(filename)

        dur_cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            filename
        ]
        res = subprocess.run(dur_cmd, capture_output=True, text=True, check=True)
        dur = float(res.stdout.strip())

        clips.append({
            "id": cue["id"],
            "file": filename,
            "start": cue["start_sec"],
            "duration": dur,
            "text": cue["text"]
        })
        print(f"   - Clip {cue['id']:02d} ({dur:.2f}s) @ {cue['start_sec']}s: \"{cue['text']}\"")
    return clips


def build_spaced_speech_track(clips, total_duration=80.0):
    print("2. Building continuous 80-second speech track with precise delays...")
    speech_track = os.path.join(TEMP_DIR, "speech_full_80s.wav")

    filter_parts = []
    inputs = []

    for i, c in enumerate(clips):
        inputs.extend(["-i", c["file"]])
        delay_ms = int(c["start"] * 1000)
        filter_parts.append(f"[{i}:a]adelay={delay_ms}|{delay_ms}[a{i}]")

    merge_inputs = "".join([f"[a{i}]" for i in range(len(clips))])
    # Note: amix divides volume by number of inputs if normalize=1, so use normalize=0 and boost
    filter_parts.append(
        f"{merge_inputs}amix=inputs={len(clips)}:normalize=0,"
        f"compand=attacks=0.02:decays=0.15:points=-80/-80|-30/-12|-15/-6|0/-2:gain=3,"
        f"volume=2.0,apad=whole_dur={total_duration}[outa]"
    )

    cmd = ["ffmpeg", "-y"] + inputs + [
        "-filter_complex", ";".join(filter_parts),
        "-map", "[outa]",
        "-t", str(total_duration),
        speech_track
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    print(f"   Created {speech_track}")
    return speech_track


def mix_with_sfx_and_ducking(speech_track):
    print("3. Mixing speech with original cinematic soundscape and dynamic ducking...")

    filter_complex = (
        "[0:a]volume=1.8[voice];"
        "[1:a]volume=0.80[sfx];"
        "[sfx][voice]sidechaincompress=threshold=0.05:ratio=5:attack=30:release=300[sfx_ducked];"
        "[sfx_ducked][voice]amix=inputs=2:normalize=0:duration=longest:dropout_transition=2,"
        "alimiter=limit=0.95[final_out]"
    )

    cmd = [
        "ffmpeg", "-y",
        "-i", speech_track,
        "-i", ORIGINAL_SFX,
        "-filter_complex", filter_complex,
        "-map", "[final_out]",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        "-t", "80.0",
        OUTPUT_MIX
    ]

    subprocess.run(cmd, check=True, capture_output=True)
    print(f"=== Audio Mix Finished Successfully: {OUTPUT_MIX} ===")


async def main():
    clips = await generate_speech_clips()
    speech_track = build_spaced_speech_track(clips)
    mix_with_sfx_and_ducking(speech_track)


if __name__ == "__main__":
    asyncio.run(main())
