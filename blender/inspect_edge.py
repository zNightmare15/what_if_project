import asyncio
import edge_tts

async def main():
    communicate = edge_tts.Communicate("Testing one two three", "en-US-ChristopherNeural")
    types = set()
    async for chunk in communicate.stream():
        types.add(chunk["type"])
        if chunk["type"] != "audio":
            print("Chunk:", chunk)
    print("Types seen:", types)

if __name__ == "__main__":
    asyncio.run(main())

