with open("aes_key.bin", "rb") as f:
    key = f.read()
print(f"Key length: {len(key)} bytes")
print("Key (hex):", key.hex())

with open("iv.bin", "rb") as f:
    iv = f.read()
print(f"IV length: {len(iv)} bytes")
print("IV (hex):", iv.hex())
