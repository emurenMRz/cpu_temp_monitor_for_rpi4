#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import json
import dataset
from flask import Flask

settings = json.load(open('./settings.json', 'r'))

app = Flask(__name__, static_folder='static', static_url_path='/')
app.config['SECRET_KEY'] = os.urandom(24)
app.config['JSON_AS_ASCII'] = False

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/timeline')
def timeline():
    res = []
    db = dataset.connect(f"{settings['adaptor']}://{settings['user']}:{settings['password']}@{settings['host']}/{settings['dbname']}")
    temp_record = db["temp_record"]
    results = temp_record.find(order_by=["-recorded_at"])
    for record in results:
        res.append({'recorded_at': record['recorded_at'], 'temp': record['temp']})
    return res

if __name__ == "__main__":
    app.run(port=5000, debug=True)
