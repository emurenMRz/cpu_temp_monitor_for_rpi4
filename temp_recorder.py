#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys
import json
import dataset
import datetime
from subprocess import getoutput

args = sys.argv
setttings_path = './settings.json'
if len(args) == 2:
    setttings_path = args[1]

settings = json.load(open(setttings_path, 'r'))

def cpu_temp():
    temp = getoutput('vcgencmd measure_temp')
    temp2 = temp.split('=')
    Cputemp = temp2[1].split("'")
    return float(Cputemp[0])

def main():
    db = dataset.connect(f"{settings['adaptor']}://{settings['user']}:{settings['password']}@{settings['host']}/{settings['dbname']}")
    temp_record = db["temp_record"]
    temp_record.create_column('recorded_at', db.types.datetime, unique=True, nullable=False, default='NOW()')
    temp_record.insert({"temp": cpu_temp()})

if __name__ == '__main__':
    main()
