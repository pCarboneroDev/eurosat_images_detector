from fastapi import FastAPI, UploadFile, File
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
from fastapi.middleware.cors import CORSMiddleware

# 1. Inicializar la app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins= ["*"],#["http://localhost:5173", "http://127.0.0.1:5173"],  # Los orígenes de tu frontend
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los headers
)

CLASS_NAMES = [
    'AnnualCrop',
    'Forest',
    'HerbaceousVegetation',
    'Highway',
    'Industrial',
    'Pasture',
    'PermanentCrop',
    'Residential',
    'River',
    'SeaLake'
]


# 2. Definir la arquitectura del modelo
model = models.resnet18(pretrained=False)
num_classes = 10
model.fc = nn.Linear(model.fc.in_features, num_classes)

# 3. Cargar los pesos guardados
model.load_state_dict(torch.load("./models/resnet18_model.pth", map_location=torch.device('cpu')))
model.eval()  # Poner el modelo en modo evaluación

# 4. Definir las transformaciones para las imágenes de entrada
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# 5. Crear el endpoint de predicción
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        input_tensor = transform(image).unsqueeze(0)
        
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            
            # Obtener top-1 prediction
            prediction_idx = torch.argmax(outputs, dim=1).item()
            confidence = probabilities[prediction_idx].item()
            
            # Obtener top-3 predictions para más información
            top3_prob, top3_idx = torch.topk(probabilities, 3)
            top3_predictions = [
                {
                    "class_name": CLASS_NAMES[idx],
                    "class_id": idx.item(),
                    "confidence": prob.item()
                }
                for idx, prob in zip(top3_idx, top3_prob)
            ]
        
        return {
            "success": True,
            "prediction": {
                "class_id": prediction_idx,
                "class_name": CLASS_NAMES[prediction_idx],
                "confidence": round(confidence, 4)
            },
            "top_3_predictions": top3_predictions,
            "filename": file.filename
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }