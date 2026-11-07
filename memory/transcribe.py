import asyncio, os, sys, json, glob
from emergentintegrations.llm.openai import OpenAISpeechToText

stt = OpenAISpeechToText(api_key=os.environ["EMERGENT_LLM_KEY"])
sem = asyncio.Semaphore(6)

async def one(path, verbose=False):
    async with sem:
        with open(path, "rb") as f:
            kw = dict(response_format="verbose_json", timestamp_granularities=["segment"]) if verbose else dict(response_format="json")
            r = await stt.transcribe(file=f, model="whisper-1", language="en", **kw)
        if verbose:
            return path, [(s.start, s.end, s.text) for s in r.segments]
        return path, r.text

async def main():
    files = sorted(glob.glob(sys.argv[1]))
    verbose = len(sys.argv) > 3
    res = await asyncio.gather(*[one(p, verbose) for p in files])
    json.dump({os.path.basename(p): t for p, t in res}, open(sys.argv[2], "w"), indent=1)

asyncio.run(main())
