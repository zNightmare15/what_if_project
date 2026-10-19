import asyncio
import edge_tts

async def main():
    communicate = edge_tts.Communicate("Testing one two three. Hello world.", "en-US-ChristopherNeural")
    submaker = edge_tts.SubMaker()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            pass
        elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
            submaker.feed(chunk)
    print("SRT output:\n", submaker.get_srt())

if __name__ == "__main__":
    asyncio.run(main())

