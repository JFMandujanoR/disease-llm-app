import pandas as pd

def drop_if_exists(df, cols):
    return df.drop(columns=[c for c in cols if c in df.columns])

# Load CSVs
cases = pd.read_csv("backend/data/time_series_covid19_confirmed_US.csv")
deaths = pd.read_csv("backend/data/time_series_covid19_deaths_US.csv")

# Columns to drop
drop_cols = ["UID","iso2","iso3","code3","FIPS","Admin2","Lat","Long_","Population"]

# Aggregate by state
cases_state = drop_if_exists(cases, drop_cols).groupby("Province_State").sum()
deaths_state = drop_if_exists(deaths, drop_cols).groupby("Province_State").sum()

# Only keep date columns for melting
date_cols_cases = cases_state.columns
date_cols_deaths = deaths_state.columns

# Convert wide → long
cases_long = cases_state.reset_index().melt(id_vars="Province_State", value_vars=date_cols_cases, var_name="date", value_name="cases")
deaths_long = deaths_state.reset_index().melt(id_vars="Province_State", value_vars=date_cols_deaths, var_name="date", value_name="deaths")

# Merge
df = pd.merge(cases_long, deaths_long, on=["Province_State", "date"])
df.rename(columns={"Province_State": "state"}, inplace=True)

# Convert date to YYYY-MM format
df["date"] = pd.to_datetime(df["date"], errors="coerce").dt.to_period("M").astype(str)

# Drop any rows where date parsing failed
df = df.dropna(subset=["date"])

# Ensure numeric columns are integers
df["cases"] = pd.to_numeric(df["cases"], errors="coerce").fillna(0).astype(int)
df["deaths"] = pd.to_numeric(df["deaths"], errors="coerce").fillna(0).astype(int)

# Save parquet
df.to_parquet("backend/data/processed.parquet", index=False)
print("Processed parquet created!")
