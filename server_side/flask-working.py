import subprocess
from flask import Flask, json, request,session
import re


old_acc_results = "This could be a fun test result"
#acc_results = [{"ACC_X": 0.15, "ACC_Y": 1.13, "ACC_Z": -1.15}]


#session['my_var'] = acc_results;
api = Flask(__name__)
api.secret_key = "mom"

@api.route('/accelerometer', methods=['GET'])
def get_companies():
  if 'my_results' in session:
    acc_results = session['my_results']
    acc_results = re.sub('label','\"label\"',acc_results)
    acc_results = re.sub('value','\"value\"',acc_results)
    acc_results = re.sub('anomaly','\"anomaly\"',acc_results)
    acc_results = re.sub('results','\"results\"',acc_results)
    acc_results = re.sub('\'','\"',acc_results)
    acc_results = acc_results.replace("\n","")
    print('results are {}'.format(acc_results))
    print(type(acc_results))
    acc_results = json.loads(acc_results)
    print(type(acc_results))
    print('no results yet')
  else:
    acc_results={
      'anomaly': 0,
      'results': [
        { 'label': 'Class_1', 'value': 0 },
        { 'label': 'Class_10', 'value': 0 },
        { 'label': 'Class_11', 'value': 0 },
        { 'label': 'Class_12', 'value': 0 },
        { 'label': 'Class_2', 'value': 0 },
        { 'label': 'Class_3', 'value': 0 },
        { 'label': 'Class_4', 'value': 0 },
        { 'label': 'Class_5', 'value': 0},
        { 'label': 'Class_6', 'value': 0},
        { 'label': 'Class_7', 'value': 0 },
        { 'label': 'Class_8', 'value': 0},
        { 'label': 'Class_9', 'value': 0}
      ]
    }
    print('results going back {}'.format(acc_results))
    print(type(acc_results))
  return json.dumps(acc_results)

@api.route('/accelerometer', methods=['POST'])
def post_companies():
  if 'my_results' in session:
    print('already have results')
  attempted_acc = request.form['acc']
  print(attempted_acc)          
  mod_acc = attempted_acc[:-1]          
  print(mod_acc)
  
  model_result = subprocess.run(['node', '/var/tmp/edgeimpulse/run-edgeimpulse.js', mod_acc], stdout=subprocess.PIPE).stdout.decode('utf-8')

  session['my_results'] = model_result
  if 'my_results' in session:
    print('hello')
  print(session['my_results'])
  return json.dumps({"success": True}), 201

if __name__ == '__main__':
    api.run(host='0.0.0.0')
