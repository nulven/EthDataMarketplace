from flask import Flask, request, jsonify
from flask_cors import CORS
from starkware.crypto.signature.fast_pedersen_hash import pedersen_hash
from starkware.cairo.bootloader.generate_fact import get_program_output
from starkware.cairo.sharp.sharp_client import init_client
from starkware.cairo.bootloader.hash_program import compute_program_hash_chain
from starkware.crypto.signature.math_utils import ec_add, ec_mult
from starkware.crypto.signature.signature import get_random_private_key, private_key_to_ec_point_on_stark_curve, FIELD_PRIME

import subprocess
import logging
import sys
import os
import json
import re

app = Flask('test')
CORS(app, resources={r'/*': {'origins': '*'}})

app.logger.setLevel(logging.INFO)

sharp_client = init_client(bin_dir='', node_rpc_url='https://goerli.infura.io/v3/68283459972f4c5594019a8878ef1003')
program = sharp_client.compile_cairo(source_code_path='/home/nulven/CairoMarketplace/cairo/encryption/circuit.cairo')
print(sharp_client.contract_client.contract.address)
print(compute_program_hash_chain(program))


@app.route('/prove', methods=['POST'])
def prove():
    circuit = request.json.get('circuit')
    inputs = request.json.get('inputs')
    parsed_inputs = {}
    for key, value in inputs.items():
        if type(value) is list:
            parsed_inputs.update({key: [int(_) for _ in value]})
        else:
            parsed_inputs[key] = int(value)
    print(circuit, parsed_inputs)
    with open('/home/nulven/CairoMarketplace/cairo/'+circuit+'/input.json', 'w') as f:
        json.dump(parsed_inputs, f)

    program = sharp_client.compile_cairo(source_code_path='/home/nulven/CairoMarketplace/cairo/' + circuit + '/circuit.cairo')
    print('PROGRAM')
    cairo_pie = sharp_client.run_program(
            program=program, program_input_path='/home/nulven/CairoMarketplace/cairo/' + circuit + '/input.json')
    print('CAIRO PIE')
    job_key = sharp_client.submit_cairo_pie(cairo_pie=cairo_pie)
    print('JOB KEY')

    fact = sharp_client.get_fact(cairo_pie)
    output = get_program_output(cairo_pie)
    output_new = [str(_) for _ in output]
    print(output_new)
    return jsonify({'res': {'programOutputs': output_new, 'fact': fact}})

app.run(host='localhost', port=5002, debug=True)
