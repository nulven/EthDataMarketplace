from flask import Flask, request, jsonify
from flask_cors import CORS
from starkware.crypto.signature.fast_pedersen_hash import pedersen_hash

import subprocess
import logging
import sys
import os
import json
import re

app = Flask('test')
CORS(app, resources={r'/*': {'origins': '*'}})

app.logger.setLevel(logging.INFO)

@app.route('/hash', methods=['POST'])
def hash():
    x = request.json.get('x')
    y = request.json.get('y')
    output = pedersen_hash(int(x), int(y))
    return jsonify({ 'res': output })

@app.route('/prove', methods=['POST'])
def prove():
    circuit = request.json.get('circuit')
    inputs = request.json.get('inputs')
    print(circuit, inputs)
    with open('/home/nulven/CairoMarketplace/cairo/'+circuit+'/input.json', 'w') as f:
        json.dump(inputs, f)

    command = 'cairo-sharp submit --source /home/nulven/CairoMarketplace/cairo/' + circuit + '/circuit.cairo --program_input /home/nulven/CairoMarketplace/cairo/' + circuit + '/input.json'
    output = os.system(command)
    print(output)
    job_key = re.search('(?<=Job key: ).*', output)
    fact = re.search('(?<=Fact: ).*', output)
    print(job_key, fact)

    return jsonify({'res': {'jobKey': job_key, 'fact': fact}})

@app.route('/', methods=['POST'])
def send_request():
    call = request.json.get('type')
    inputs = request.json.get('inputs')
    contractAddress = request.json.get('contractAddress')
    contract = request.json.get('contract')
    func = request.json.get('func')
    print(func, inputs)
    if len(inputs) > 0:
        inp = '--inputs ' + ' '.join(inputs)
    else:
        inp = ''
    print(inp)
    command = 'starknet ' + call + ' --address ' + contractAddress + ' --abi /home/nulven/CairoMarketplace/cairo/contracts/' + contract + '_abi.json --function ' + func + ' ' + inp
    output = os.system(command)
    print(output)
    return jsonify({ 'res': output })

app.run(host='localhost', port=5002, debug=True)
