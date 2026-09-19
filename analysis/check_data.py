import pandas as pd

df = pd.read_csv("../data/data_cleaned.csv")

print("Shape:", df.shape)
print("\nColumns:")
print(df.columns.tolist())

print("\nFirst 5 rows:")
print(df.head())