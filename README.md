# FYP Blockchain Based: Research Data Anonymizer


## Decrypt the AES key using RSA private key
`openssl pkeyutl -decrypt -inkey private.pem -in encrypted_aes_key.bin -out aes_key.bin` 

##  Decrypt the File using the AES key
`openssl enc -d -aes-256-cbc -in encrypted_output.enc -out decrypted_output.csv -K  -iv`

## Tech Stack
- NodeJS
- ExpressJS
- Python
- HTML/CSS
- MetaMask
- Ganache
- PinataIPFS
- (OpenSSL)

## Encryption
- RSA 2048
- AES 256

## UI
![Block data page](<Screenshot 2025-06-25 141441.png>) ![MyDatasets page](<Screenshot 2025-06-25 135833.png>) ![Upload dataset page](<Screenshot 2025-06-25 135754.png>) ![Home page](<Screenshot 2025-06-25 135715.png>) ![Landing page](<Screenshot 2025-06-25 135421.png>)
