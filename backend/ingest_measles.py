# backend/ingest_measles.py
import pandas as pd

print("Downloading measles data...")

url = "https://raw.githubusercontent.com/CSSEGISandData/measles_data/main/measles_county_all_updates.csv"
df = pd.read_csv(url)

# Extract state from "County, State"
df["state"] = df["location_name"].apply(lambda x: x.split(",")[-1].strip())

# Parse dates -> monthly period
df["date"] = pd.to_datetime(df["date"], errors="coerce").dt.to_period("M").astype(str)

# Drop invalid rows
df = df.dropna(subset=["date", "state", "value"])

# Aggregate by state, date, outcome type
agg = (
    df.groupby(["date", "state", "outcome_type"])["value"]
    .sum()
    .reset_index()
)

# Pivot outcome types into columns (e.g., "case_lab-confirmed", "death_lab-confirmed")
agg = agg.pivot_table(
    index=["date", "state"],
    columns="outcome_type",
    values="value",
    fill_value=0
).reset_index()

# Flatten column names
agg.columns.name = None

# Save parquet
output_file = "backend/data/measles.parquet"
agg.to_parquet(output_file, index=False)
print(f"✅ Measles parquet created at {output_file}")
print("Preview:")
print(agg.head())
