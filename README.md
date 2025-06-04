# Blockchain Based: Research Data Anonymizer




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
- OpenSSL
