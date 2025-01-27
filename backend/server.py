from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastai.vision.all import *
import io
from PIL import Image
import os
import base64

app = FastAPI()

# Load model using Windows-friendly path
model_path = Path(__file__).parent/'model.pkl'
if not model_path.exists():
    raise RuntimeError(f"Model file not found at {model_path}")
learn = load_learner(model_path)

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    try:
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            raise HTTPException(400, "Invalid file type")

        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Create base64 string of image for frontend display
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        pred, pred_idx, probs = learn.predict(img)
        return {
            "prediction": pred,
            "confidence": float(probs[pred_idx]),
            "details": {learn.dls.vocab[i]: float(p) for i, p in enumerate(probs)},
            "image": f"data:image/jpeg;base64,{img_str}"
        }
    except Exception as e:
        raise HTTPException(500, f"Classification failed: {str(e)}")
    
    