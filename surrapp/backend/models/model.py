import torch.nn as nn
import numpy as np
import torch

#model class architecture for exporting to app.py
class ChordNN(nn.Module):
    def __init__(self, level1_classes, level2_classes, level3_classes):
        #constructor that defines our convolutional layers
        super(ChordNN, self).__init__()
        #4 conv layers
        self.conv1 = nn.Sequential(
            nn.Conv2d(
                in_channels = 1,
                out_channels = 16,
                kernel_size = 3,
                stride = 1,
                padding = 2
            ),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size = 2)
        )
        
        self.conv2 = nn.Sequential(
            nn.Conv2d(
                in_channels = 16,
                out_channels = 32,
                kernel_size = 3,
                stride = 1,
                padding = 2
            ),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size = 2)
        )
        
        self.conv3 = nn.Sequential(
            nn.Conv2d(
                in_channels = 32,
                out_channels = 64,
                kernel_size = 3,
                stride = 1,
                padding = 2
            ),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size = 2)
        )
        
        self.conv4 = nn.Sequential(
            nn.Conv2d(
                in_channels = 64,
                out_channels = 128,
                kernel_size = 3,
                stride = 1,
                padding = 2
            ),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size = 2)
        )
        
        
        self.flatten = nn.Flatten()
        #calling the function to get output shape
        n_features = self.__get_shape__(torch.randn(1,1,12,173))
        
        self.linear1 = nn.Linear(n_features, level1_classes)
        self.softmax1 = nn.Softmax(dim=1)
        
        self.linear2 = nn.Linear(n_features, level2_classes)
        self.softmax2 = nn.Softmax(dim=1)
        
        self.linear3 = nn.Linear(n_features, level3_classes)
        self.softmax3 = nn.Softmax(dim=1)
        
        #dropout layer to prevent overfitting
        self.dropout = nn.Dropout(0.2)
        
        
    #forward pass method
    def forward(self, input_data):
        x = self.conv1(input_data)
        x = self.dropout(x)
        x = self.conv2(x)
        x = self.dropout(x)
        x = self.conv3(x)
        x = self.dropout(x)
        x = self.conv4(x)
        x = self.dropout(x)
        x = self.flatten(x)
        
        #layer_specific predictions
        logits1 = self.linear1(x)
        output_root = self.softmax1(logits1)
        
        logits2 = self.linear2(x)
        output_quality = self.softmax2(logits2)
        
        logits3 = self.linear3(x)
        output_modifier = self.softmax3(logits3)
        
        return output_root, output_quality, output_modifier
    
    def __get_shape__(self, x):
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        x = self.conv4(x)
        
        return int(x.numel())