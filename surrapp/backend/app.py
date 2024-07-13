from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from torchsummary import summary
#model class import 
from models.model import ChordNN

app = Flask(__name__)
#enabling cross origin resource sharing
CORS(app)
#computing device
device = torch.device("cpu")

#loading model 
model = ChordNN(level1_classes=12, level2_classes=4, level3_classes=4)
model.load_state_dict(torch.load("models/chord_cnn.pth", map_location=device))

model.eval()
# print("model summary:")
# summary(model, input_size=(1,12,173))

@app.route('/')
def hello():
    print("Flask app started")
    return("Flask app started")

@app.route('/api/chunks', methods=['POST'])
def handle_chunks(data):
    print(f"Audio chunks recieved: {data}")
    #comvert audio chunks into chroma stft
    #feed into model to get output

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)