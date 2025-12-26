from PIL import Image
import sys

try:
    img = Image.open('icon.png')
    # Save as .ico with multiple sizes for best quality
    img.save('favicon.ico', format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
    print("Successfully created favicon.ico")
except Exception as e:
    print(f"Error: {e}")
