import pandas as pd
import os

DATA_PATH = "backend/data/covid_sample.csv"
PROCESSED_PATH = "backend/data/processed.parquet"

def main():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    # Minimal preprocessing
    df["date"] = pd.to_datetime(df["date"])
    df.to_parquet(PROCESSED_PATH, index=False)
    print(f"Processed data saved to {PROCESSED_PATH}")

if __name__ == "__main__":
    main()

