import os
from dotenv import load_dotenv

# Load the .env file
load_dotenv()

array_string = os.getenv("SECRETS").split(",")

def list_quotes_folder(folder_path):
    try:
        files = os.listdir(folder_path)
        for file in files:
            if not any(secret in file for secret in array_string):
                print(f'"{file}",')
    except FileNotFoundError:
        print(f"The folder {folder_path} does not exist.")

# Replace 'quotes' with the path to your quotes folder
quotes_folder_path = '/Users/aziz/Documents/VS Code Projects/QuoteCrafter/quotes'
list_quotes_folder(quotes_folder_path)