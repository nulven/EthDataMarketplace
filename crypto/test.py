import json

from starkware.crypto.signature.math_utils import ec_add, ec_mult
from starkware.crypto.signature.signature import get_random_private_key, private_key_to_ec_point_on_stark_curve, FIELD_PRIME


def genKeypair():
    priv_key = get_random_private_key()
    public_key = private_key_to_ec_point_on_stark_curve(priv_key)

    keypair = { 'priv_key': priv_key, 'pub_key': public_key }
    return keypair

def gen_shared_key(priv_key, pub_key):
    return ec_mult(priv_key, pub_key, 1, FIELD_PRIME)[0]


def gen_keys():
    key_pair1 = genKeypair()
    key_pair2 = genKeypair()
    data = { 'key1': key_pair1, 'key2': key_pair2 }
    with open('./public/keys.json', 'w') as f:
        json.dump(data, f)


gen_keys()
