# hex_dump.py
with open("aes_key.bin", "rb") as f:
    print("KEY:", f.read().hex())

with open("iv.bin", "rb") as f:
    print("IV:", f.read().hex())
