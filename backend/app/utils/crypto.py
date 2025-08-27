import os
import base64


def gen_secret_key(n=32):
    return base64.urlsafe_b64encode(os.urandom(n)).decode() 