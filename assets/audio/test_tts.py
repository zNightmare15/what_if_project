import asyncio
import json
import edge_tts

TEXT = "What if electrons disappeared for five seconds? Every atom on Earth has them."
VOICE = "en-US-ChristopherNeural"
OUTPUT_FILE = "test_audio.mp3"
TIMING_FILE = "test_timing.json"

async def main():
    communicate = edge_tts.Communicate(TEXT, VOICE, rate="-5%", pitch="-2Hz")
    submaker = edge_tts.SubMaker()
    
    words = []
    with open(OUTPUT_FILE, "wb") as file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                submaker.feed(chunk)
                words.append({
                    "text": chunk["text"],
                    "offset_ms": chunk["offset"] / 10000,
                    "duration_ms": chunk["duration"] / 10000
                })
                
    with open(TIMING_FILE, "w", encoding="utf-8") as f:
        json.dump(words, f, indent=2)
        
    print(f"Generated {OUTPUT_FILE} and {TIMING_FILE} with {len(words)} word timings.")

if __name__ == "__main__":
    asyncio.run(main())

