import pandas as pd
import numpy as np

with open("analysis_output.txt", "w", encoding="utf-8") as f:
    file_path = "data/Dataset_complet_Meteo.xlsx"
    f.write(f"=== ANALYSE COMPLETE DU DATASET SMARTAIR CAMEROON ===\n")
    f.write(f"Fichier : {file_path}\n\n")
    
    df = pd.read_excel(file_path)
    
    # 1. Dimensions
    f.write(f"{'='*60}\n1. DIMENSIONS DU DATASET\n{'='*60}\n")
    f.write(f"   Nombre de lignes   : {df.shape[0]}\n")
    f.write(f"   Nombre de colonnes : {df.shape[1]}\n\n")
    
    # 2. Colonnes et types
    f.write(f"{'='*60}\n2. COLONNES ET TYPES DE DONNEES\n{'='*60}\n")
    for col in df.columns:
        f.write(f"   {col:40s} | Type: {str(df[col].dtype):15s} | Non-null: {df[col].notna().sum():6d} | Null: {df[col].isna().sum():5d}\n")
    f.write("\n")
    
    # 3. Premiers enregistrements
    f.write(f"{'='*60}\n3. PREMIERS ENREGISTREMENTS (5 lignes)\n{'='*60}\n")
    f.write(df.head().to_string())
    f.write("\n\n")
    
    # 4. Statistiques descriptives (colonnes numeriques uniquement)
    f.write(f"{'='*60}\n4. STATISTIQUES DESCRIPTIVES (colonnes numeriques)\n{'='*60}\n")
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    f.write(f"   Colonnes numeriques : {numeric_cols}\n\n")
    f.write(df[numeric_cols].describe().to_string())
    f.write("\n\n")
    
    # 5. Valeurs manquantes
    f.write(f"{'='*60}\n5. VALEURS MANQUANTES\n{'='*60}\n")
    missing = df.isnull().sum()
    missing_pct = (df.isnull().sum() / len(df) * 100).round(2)
    for col in df.columns:
        status = "OK" if missing[col] == 0 else "ATTENTION"
        f.write(f"   [{status:9s}] {col:40s} | Manquantes: {missing[col]:6d} ({missing_pct[col]:5.2f}%)\n")
    f.write("\n")
    
    # 6. Villes
    f.write(f"{'='*60}\n6. LISTE DES VILLES\n{'='*60}\n")
    city_col = 'city' if 'city' in df.columns else ('City' if 'City' in df.columns else None)
    
    if city_col:
        cities = sorted(df[city_col].dropna().unique())
        f.write(f"   Nombre de villes : {len(cities)}\n\n")
        for i, city in enumerate(cities, 1):
            count = len(df[df[city_col] == city])
            f.write(f"   {i:3d}. {str(city):25s} : {count} observations\n")
    f.write("\n")
    
    # 7. Regions
    f.write(f"{'='*60}\n7. REGIONS DU CAMEROUN\n{'='*60}\n")
    reg_col = 'region' if 'region' in df.columns else ('Region' if 'Region' in df.columns else None)
    
    if reg_col:
        regions = sorted(df[reg_col].dropna().unique())
        f.write(f"   Nombre de regions : {len(regions)}\n\n")
        for i, reg in enumerate(regions, 1):
            count = len(df[df[reg_col] == reg])
            f.write(f"   {i:3d}. {str(reg):25s} : {count} observations\n")
    f.write("\n")
    
    # 8. Plage temporelle
    f.write(f"{'='*60}\n8. PLAGE TEMPORELLE\n{'='*60}\n")
    time_col = 'time' if 'time' in df.columns else ('date' if 'date' in df.columns else None)
    
    if time_col:
        df[time_col] = pd.to_datetime(df[time_col], errors='coerce')
        f.write(f"   Date de debut : {df[time_col].min()}\n")
        f.write(f"   Date de fin   : {df[time_col].max()}\n")
        f.write(f"   Duree totale  : {(df[time_col].max() - df[time_col].min()).days} jours\n")
    f.write("\n")
    
    # 9. Coordonnees geographiques par ville
    f.write(f"{'='*60}\n9. COORDONNEES GEOGRAPHIQUES PAR VILLE\n{'='*60}\n")
    if 'latitude' in df.columns and 'longitude' in df.columns and city_col and reg_col:
        df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
        df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
        coords = df.groupby([city_col, reg_col]).agg(
            latitude=('latitude', 'first'),
            longitude=('longitude', 'first')
        ).sort_index().reset_index()
        for _, row in coords.iterrows():
            lat = float(row['latitude']) if pd.notna(row['latitude']) else 0.0
            lon = float(row['longitude']) if pd.notna(row['longitude']) else 0.0
            f.write(f"   {str(row[city_col]):25s} | Region: {str(row[reg_col]):20s} | Lat: {lat:8.4f} | Lon: {lon:8.4f}\n")
    f.write("\n")
    
    # 10. Correlations cles (numeriques seulement)
    f.write(f"{'='*60}\n10. MATRICE DE CORRELATIONS\n{'='*60}\n")
    # Exclure id, latitude, longitude des correlations
    corr_cols = [c for c in numeric_cols if c not in ['id', 'latitude', 'longitude']]
    if len(corr_cols) > 2:
        corr = df[corr_cols].corr()
        f.write(corr.round(3).to_string())
    f.write("\n\n")
    
    # 11. Analyse saisonniere
    f.write(f"{'='*60}\n11. ANALYSE SAISONNIERE\n{'='*60}\n")
    if time_col:
        df['month'] = df[time_col].dt.month
        df['is_dry_season'] = df['month'].isin([11, 12, 1, 2, 3]).astype(int)
        dry = df[df['is_dry_season'] == 1]
        wet = df[df['is_dry_season'] == 0]
        f.write(f"   Saison seche  (Nov-Mar) : {len(dry)} observations\n")
        f.write(f"   Saison humide (Avr-Oct) : {len(wet)} observations\n")
        
        for col_name in ['temperature_2m_mean', 'precipitation_sum', 'wind_speed_10m_max', 'shortwave_radiation_sum']:
            if col_name in df.columns:
                dry_val = pd.to_numeric(dry[col_name], errors='coerce').mean()
                wet_val = pd.to_numeric(wet[col_name], errors='coerce').mean()
                f.write(f"\n   {col_name} :\n")
                f.write(f"      Saison seche  : {dry_val:.2f}\n")
                f.write(f"      Saison humide : {wet_val:.2f}\n")
    
    # 12. Valeurs uniques pour colonnes categoriques
    f.write(f"\n{'='*60}\n12. VALEURS UNIQUES (colonnes non-numeriques)\n{'='*60}\n")
    cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
    for col in cat_cols:
        n_unique = df[col].nunique()
        f.write(f"   {col:40s} : {n_unique} valeurs uniques\n")
        if n_unique <= 15:
            for val in sorted(df[col].dropna().unique(), key=str):
                f.write(f"      - {val}\n")

    f.write(f"\n{'='*60}\n=== FIN DE L'ANALYSE ===\n{'='*60}\n")

print("Analyse terminee avec succes ! Resultats dans analysis_output.txt")
