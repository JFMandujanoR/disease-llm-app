import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(exist_ok=True)

URL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/" \
      "csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"

def ingest():
    df = pd.read_csv(URL)
    df_long = df.melt(
        id_vars=['Province/State','Country/Region','Lat','Long'],
        var_name='date',
        value_name='cases'
    )
    df_long['date'] = pd.to_datetime(df_long['date'])
    df_long.rename(columns={
        'Province/State':'province',
        'Country/Region':'country',
        'Lat':'lat',
        'Long':'lon'
    }, inplace=True)
    out_path = DATA_DIR / "jhu_covid_confirmed.parquet"
    df_long.to_parquet(out_path, index=False)
    print(f"Saved {len(df_long)} rows to {out_path}")

if __name__ == "__main__":
    ingest()
