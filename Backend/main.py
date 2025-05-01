from appwrite.client import Client
from appwrite.services.storage import Storage
import os
import uuid
import requests
from io import BytesIO
from PIL import Image
from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from rembg import remove
import uvicorn
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import socket
import dns.resolver
from appwrite.input_file import InputFile

# Load environment variables

# === Initialize FastAPI ===
app = FastAPI()

# === Enable CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Ensure output folder exists ===
OUTPUT_DIR = "static/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# === Appwrite Setup ===
APPWRITE_URL = "https://cloud.appwrite.io/v1"
PROJECT_ID = "680909f600200e1866ef"
STORAGE_ID = "68127807001f3fce502e"

client = Client()
client.set_endpoint(APPWRITE_URL) \
      .set_project(PROJECT_ID) \
      .set_self_signed()

storage = Storage(client)

# === DALL-E API Setup ===
API_KEY = "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"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}
ENDPOINT = "https://api.openai.com/v1/images/generations"

# === DNS and Proxy Setup ===
resolver = dns.resolver.Resolver()
resolver.nameservers = ['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4']
socket.setdefaulttimeout(30)

# === Upload to Appwrite ===
def upload_to_appwrite(file_path: str, file_name: str) -> str | None:
    try:
        if not os.path.exists(file_path):
            print(f"[❌] File not found: {file_path}")
            return None
            
        file_size = os.path.getsize(file_path)
        print(f"[📁] Uploading file: {file_path} (Size: {file_size} bytes)")
        
        input_file = InputFile.from_path(file_path)  # Use from_path method
        result = storage.create_file(
            bucket_id=STORAGE_ID,
            file_id="unique()",
            file=input_file
        )
        print(f"[✅] Uploaded to Appwrite: {result['$id']}")
        return f"{APPWRITE_URL}/storage/buckets/{STORAGE_ID}/files/{result['$id']}/view?project={PROJECT_ID}"
    except Exception as e:
        print(f"[❌] Appwrite Upload Error Details:")
        print(f"    - Error Type: {type(e).__name__}")
        print(f"    - Error Message: {str(e)}")
        print(f"    - File Path: {file_path}")
        print(f"    - Bucket ID: {STORAGE_ID}")
        return None

# === Request Session with Retry ===
session = requests.Session()
retry_strategy = Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("http://", adapter)
session.mount("https://", adapter)

# === Generate image from DALL-E ===
def generate_image(prompt: str) -> str | None:
    try:
        payload = {
            "model": "dall-e-3",
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024",
            "quality": "hd",  # Request high quality
            "style": "vivid"  # Request vivid style
        }

        response = session.post(ENDPOINT, headers=HEADERS, json=payload, timeout=60)
        if response.status_code == 200:
            return response.json()["data"][0]["url"]
        print(f"[❌] DALL-E error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[❌] generate_image Exception: {str(e)}")
    return None

# === Download, remove BG, resize, and save image ===
def download_and_save_image(url: str, subject: str) -> str | None:
    for attempt in range(3):
        try:
            print(f"[🔄] Attempt {attempt + 1}: downloading image...")

            # DNS check
            try:
                hostname = url.split('/')[2]
                resolver.resolve(hostname, 'A')
            except Exception as e:
                print(f"[❌] DNS resolution failed: {e}")
                time.sleep(2)
                continue

            response = session.get(url, timeout=30)
            response.raise_for_status()

            img_data = response.content
            original = Image.open(BytesIO(img_data)).convert("RGBA")
            transparent_bytes = remove(img_data)
            transparent_image = Image.open(BytesIO(transparent_bytes)).convert("RGBA")

            safe_name = "_".join(subject.lower().split())
            filename = f"{safe_name}_{uuid.uuid4().hex[:8]}.png"
            save_path = os.path.join(OUTPUT_DIR, filename)
            transparent_image.save(save_path)

            print(f"[✅] Image saved at {save_path}")
            return save_path
        except Exception as e:
            print(f"[⚠️] Attempt {attempt + 1} failed: {e}")
            time.sleep(2)
    print("[❌] All attempts to download and save failed.")
    return None

# === Main endpoint ===
@app.post("/")
async def generate(subject: str = Form(...)):
    try:
        full_prompt = (
            f"A high-quality, detailed 8-bit pixel art sprite of a {subject}, side view,"
            "holding a large sci-fi gun or flamethrower pointed directly to the left, "
            "in a dynamic standing combat pose. NES-style pixel character with sharp, clean edges, "
            "high contrast, vibrant colors, perfect pixel alignment, and a completely transparent background. "
            "Inspired by Contra run-and-gun games. The sprite should be well-defined with clear pixel art details, "
            "no blurriness, and perfect transparency around the edges."
            "Make sure the character can also face the right side."
        )

        img_url = generate_image(full_prompt)
        if not img_url:
            return JSONResponse(status_code=500, content={"status": "error", "message": "Image generation failed"})

        saved_path = download_and_save_image(img_url, subject)
        if saved_path:
            web_path = f"/{saved_path.replace(os.sep, '/')}"

            appwrite_url = upload_to_appwrite(saved_path, os.path.basename(saved_path))
            if not appwrite_url:
                return JSONResponse(status_code=500, content={"status": "error", "message": "Appwrite upload failed"})

            return JSONResponse(content={
                "img_url": web_path,
                "filename": os.path.basename(saved_path),
                "status": "success",
                "path": web_path,
                "appwrite_url": appwrite_url,
                "flag": True
            })
        else:
            return JSONResponse(status_code=500, content={"status": "error", "message": "Image download failed"})

    except Exception as e:
        print(f"[❌] generate() Exception: {e}")
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

# === Run locally ===
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)
