import pandas as pd

import sys
import os

input_path = sys.argv[1]
output_path = sys.argv[2]


df = pd.read_csv(input_path)

def anonymize_sensitive_fields(df):

    # Mask First Name and Last Name
    if 'first_name' in df.columns:
        df['first_name'] = '*'

    if 'last_name' in df.columns:
        df['last_name'] = '*'

    # Age: generalize into custom bins
    if 'Age' in df.columns or 'age' in df.columns:
        df['age'] = pd.cut(df['age'],
                       bins=[0, 20, 30, 40, 50, 60, 100],
                       labels=["0-20", "21-30", "31-40", "41-50", "51-60", "60+"])

    if 'email' in df.columns:
        def mask_email(email):
            if isinstance(email, str) and "@" in email:
                domain = email.split('@')[1]
                domain_suffix = domain.split('.')[-1] if '.' in domain else ''
                return "****@****." + domain_suffix
            return '*'
        df['email'] = df['email'].apply(mask_email)

    if 'Credit_Card' in df.columns:
        df['Credit_Card'] = '*'

    if 'CVV' in df.columns:
        df['CVV'] = '*'

    if 'Card Date-of-Expiry' in df.columns:
        df['Card Date-of-Expiry'] = '*'

    # ----------------------
    # Generalize Quasi-identifiers
    # ----------------------

    # Ethnicity & Race: Generalize into broader groups (example)
    # if 'Ethnicity' in df.columns:
    #     df['Ethnicity'] = df['Ethnicity'].replace({
    #         'Chinese': 'Asian',
    #         'Indian': 'Asian',
    #         'Malay': 'Asian',
    #         'White': 'Caucasian',
    #         'Black': 'African',
    #         'Hispanic': 'Latino',
    #     }).fillna('Other')

    # if 'Race' in df.columns:
    #     df['Race'] = df['Race'].replace({
    #         'Chinese': 'Asian',
    #         'Indian': 'Asian',
    #         'Malay': 'Asian',
    #         'White': 'Caucasian',
    #         'Black': 'African',
    #         'Hispanic': 'Latino',
    #     }).fillna('Other')

    # Occupation: Generalize to industry or first word
    # if 'occupation' in df.columns:
    #     df['occupation'] = df['occupation'].apply(lambda x: x.split()[0] if isinstance(x, str) else 'Other')

    # Education Level: Generalize to broad categories
    if 'Education Level' in df.columns:
        df['Education Level'] = df['Education Level'].replace({
            'High School': 'Secondary',
            'Diploma': 'Tertiary',
            'Bachelor': 'Tertiary',
            'Master': 'Postgraduate',
            'PhD': 'Postgraduate',
        }).fillna('Other')

    # Geolocation (Coordinates): Generalize to region (e.g., extract city)
    if 'Location' in df.columns:
        df['Location'] = df['Location'].apply(lambda x: x.split(',')[0] if isinstance(x, str) and ',' in x else 'Region')

    # Salary: Generalize into ranges
    # Salary: generalize into custom bins
    if 'Salary' in df.columns or 'salary' in df.columns:
        df['salary'] = pd.cut(df['salary'],
                          bins=[0, 20000, 40000, 60000, 80000, 100000, 9999999],
                          labels=["<20K", "20-40K", "40-60K", "60-80K", "80-100K", "100K+"])

    # Mask Phone Number
    if 'phone_number' in df.columns:
        def mask_phone(phone):
            if isinstance(phone, str) and len(phone) >= 4:
                return '*' * (len(phone) - 4) + phone[-4:]
            return '*'
        df['phone_number'] = df['phone_number'].apply(mask_phone)

    if 'longitude' in df.columns:
        df['longitude'] = df['longitude'].round(1)  # round to ~11km precision
    
    if 'latitude' in df.columns:
        df['latitude'] = df['latitude'].round(1)  # round to ~11km precision

    if 'street_address' in df.columns:
        df['street_address'] = '*'



    return df

anonymized_df = anonymize_sensitive_fields(df)
anonymized_df.to_csv(output_path, index=False)

print(f"Processed file saved to {output_path}")
