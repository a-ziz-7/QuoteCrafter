import os

def list_quotes_folder(folder_path):
    try:
        files = os.listdir(folder_path)
        for file in files:
            print(f'"{file}",')
    except FileNotFoundError:
        print(f"The folder {folder_path} does not exist.")

# Replace 'quotes' with the path to your quotes folder
quotes_folder_path = '/Users/aziz/Documents/VS Code Projects/QuoteCrafter/quotes'
list_quotes_folder(quotes_folder_path)