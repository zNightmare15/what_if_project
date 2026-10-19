import asyncio
import json
import os
import edge_tts

SCRIPT_DATA = {
    "title": "What if electrons disappeared for 5 seconds?",
    "countdown_start": 5.0,
    "lines": [
        {
            "id": 1,
            "text": "What if electrons disappeared for 5 seconds?",
            "subtext": "EVERY ATOM ON EARTH HAS THEM",
            "hud_phase": "countdown",
            "visual_mode": "normal_lowpoly"
        },
        {
            "id": 2,
            "text": "Every atom on Earth is held together by them.",
            "subtext": "ELECTRONS DISAPPEAR IN",
            "hud_phase": "countdown",
            "visual_mode": "normal_lowpoly"
        },
        {
            "id": 3,
            "text": "The moment they vanish, matter loses its negative charge.",
            "subtext": "TIME SLOWED DOWN 11x",
            "hud_phase": "disrupted",
            "visual_mode": "wireframe"
        },
        {
            "id": 4,
            "text": "And positive charges violently repel.",
            "subtext": "BONDS SHATTERING",
            "hud_phase": "disrupted",
            "visual_mode": "wireframe"
        },
        {
            "id": 5,
            "text": "Your hands, the ground, and the skyscrapers explode into subatomic dust.",
            "subtext": "MATTER EXPANDING",
            "hud_phase": "disrupted",
            "visual_mode": "particles"
        },
        {
            "id": 6,
            "text": "Five seconds later, electrons return.",
            "subtext": "ELECTRONS BACK",
            "hud_phase": "aftermath",
            "visual_mode": "pointcloud"
        },
        {
            "id": 7,
            "text": "Every electron returns to a world that no longer exists.",
            "subtext": "CENTRAL PARK 5 SECONDS LATER",
            "hud_phase": "aftermath",
            "visual_mode": "pointcloud"
        }
    ]
}

VOICE = "en-US-ChristopherNeural"
OUTPUT_AUDIO = "audio_narrative.mp3"
TIMESTAMPS_JSON = "timeline.json"

async def generate():
    full_text = " ".join([item["text"] for item in SCRIPT_DATA["lines"]])
    print("Generating speech with edge-tts...")
    communicate = edge_tts.Communicate(full_text, VOICE, rate="-6%", pitch="-3Hz")
    
    submaker = edge_tts.SubMaker()
    sentences = []
    
    with open(OUTPUT_AUDIO, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "SentenceBoundary":
                submaker.feed(chunk)
                sentences.append({
                    "text": chunk["text"],
                    "offset_sec": (chunk["offset"] / 10000) / 1000.0,
                    "duration_sec": (chunk["duration"] / 10000) / 1000.0
                })

    srt_content = submaker.get_srt()
    with open("subtitles.srt", "w", encoding="utf-8") as f:
        f.write(srt_content)
        
    # Associate sentences with script metadata
    timeline = []
    for i, s in enumerate(sentences):
        meta = SCRIPT_DATA["lines"][i] if i < len(SCRIPT_DATA["lines"]) else SCRIPT_DATA["lines"][-1]
        timeline.append({
            "index": i + 1,
            "start": round(s["offset_sec"], 3),
            "end": round(s["offset_sec"] + s["duration_sec"], 3),
            "duration": round(s["duration_sec"], 3),
            "text": s["text"],
            "subtext": meta.get("subtext", ""),
            "hud_phase": meta.get("hud_phase", "countdown"),
            "visual_mode": meta.get("visual_mode", "normal_lowpoly")
        })
        
    with open(TIMESTAMPS_JSON, "w", encoding="utf-8") as f:
        json.dump({"title": SCRIPT_DATA["title"], "timeline": timeline}, f, indent=2)
        
    total_duration = timeline[-1]["end"] if timeline else 0
    print(f"Narrative generated: {OUTPUT_AUDIO} ({total_duration:.2f}s), {len(timeline)} scenes timed.")

if __name__ == "__main__":
    asyncio.run(generate())

