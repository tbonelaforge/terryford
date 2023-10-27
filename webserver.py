from flask import Flask
from flask import render_template
from flask import make_response
from flask import request
from flask import json
from flask import Response
from datetime import datetime, timedelta
import mysql.connector
from mysql.connector import errorcode
from configparser import ConfigParser
import sys
import time


from arithmetic import user_service

app = Flask(__name__)

arithmetic_db_cxn = None


HIGH_SCORE_TTL_SECONDS = 7 * 24 * 60 * 60
# HIGH_SCORE_TTL_SECONDS = 120

try:
  Config = ConfigParser()
  Config.read("webserver_config.ini")
  
  arithmetic_db_cxn =  mysql.connector.connect(
      user=Config.get('database', 'user'),
      password=Config.get('database', 'password'),
      host='127.0.0.1',
      database='arithmetic')
except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Something is wrong with your user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print(err)


@app.route('/')
def home_page():
    html = render_template('homepage/index.html')
    return html

@app.route('/arithmetic')
def arithmetic_start_page():
    cookie = request.cookies.get('arithmetic')
    html = render_template("arithmetic/game-container.html")
    resp = make_response(html)
    if cookie is None or len(cookie) == 0:
        cookie = generate_new_cookie()
    resp.set_cookie('arithmetic', cookie)
    return resp

insert_score_template = ("INSERT INTO arithmetic.user_score "
                      "(user_id, score, level, created_date)"
                      "VALUES (%s, %s, '%s', '%s')")

get_score_template = ("SELECT id, user_id, score, level, created_date "
                      "FROM arithmetic.user_score "
                      "WHERE id = %s")


def insert_new_score(user_id, json_object):
    if (arithmetic_db_cxn is None):
      return None
    now = datetime.now()
    now_string = str(now)
    insert_score_statement = insert_score_template % (user_id, json_object['score'], json_object['level'], now_string)
    cursor = arithmetic_db_cxn.cursor()
    cursor.execute(insert_score_statement)
    new_score_id = cursor.lastrowid
    arithmetic_db_cxn.commit()
    return new_score_id


def retrieve_new_score(new_score_id):
    get_score_statement = get_score_template % (new_score_id)
    cursor = arithmetic_db_cxn.cursor()
    cursor.execute(get_score_statement)
    new_score = None
    for (score_id, user_id, score, level, created_date) in cursor:
        if new_score is None:
            new_score = {
                "id": score_id,
                "user_id": user_id,
                "score": score,
                "level": level,
                "createdDate": created_date
            }
    cursor.close()
    return new_score


get_high_scores_template = ("SELECT MAX(us.id) as score_id, u.username, u.id as user_id, us.score as score "
                            "FROM user_score us join user u on us.user_id = u.id "
                            "WHERE us.level = '%s' AND us.created_date > '%s'"
                            "GROUP BY user_id, score "
                            "ORDER BY score desc, score_id desc "
                            "LIMIT 5")




def retrieve_high_scores(level):
    if (arithmetic_db_cxn is None):
      return None
    now = datetime.now()
    
    past_cutoff = now - timedelta(seconds=HIGH_SCORE_TTL_SECONDS)
    
    past_cutoff_string = past_cutoff.strftime('%Y-%m-%d %H:%M:%S')
    
    get_high_scores_statement = get_high_scores_template % (level, past_cutoff_string)
    
    cursor = arithmetic_db_cxn.cursor()
    cursor.execute(get_high_scores_statement)
    high_scores = []
    for (score_id, username, user_id, score) in cursor:
      high_scores.append({
        "userId": user_id,
        "scoreId": score_id,
        "username": username,
        "score": score
      })
    return high_scores;
    
  
  

@app.route('/arithmetic/scores/<user_id>', methods=['POST'])
def arithmetic_scores(user_id):
    if request.method == "POST":
        json_object = request.json
        new_score_id = insert_new_score(user_id, json_object)
        if new_score_id is None:
          resp = Response('"Could not insert score"', status=503, mimetype='application/json')
          return resp
        new_score = retrieve_new_score(new_score_id)
        high_scores = retrieve_high_scores(json_object['level'])
        response_data = {
          "newScore": new_score,
          "highScores": high_scores
        }
        resp = Response(json.dumps(response_data), status=200, mimetype='application/json')
        return resp


@app.route('/arithmetic/username/<user_id>', methods=['POST'])
def arithmetic_username(user_id):
  if request.method == "POST":
    json_object = request.json
    if (not 'username' in json_object) or (len(json_object['username']) == 0):
      error_data = {"error": "payload did not contain 'username'"}
      resp = Response(json.dumps(error_data), status=400, mimetype='application/json')
      return resp
    username = json_object['username']
    updated_user = user_service.update_username(
      arithmetic_db_cxn,
      user_id,
      username
    )
    if updated_user is None:
          resp = Response('"Could not update user"', status=503, mimetype='application/json')
          return resp
    response_data = {
      "user": updated_user
    }
    resp = Response(json.dumps(response_data), status=200, mimetype='application/json')
    return resp

@app.route('/arithmetic/walkthrough')
def walkthrough():
    html = render_template("arithmetic/walkthrough.html")

    return html


add_user_template = ("INSERT INTO arithmetic.user "
                     "(created_date) "
                     "VALUES ('%s')")

def create_new_user():
    if arithmetic_db_cxn is None:
      return None
    cursor = arithmetic_db_cxn.cursor()
    add_user_statement = add_user_template % (datetime.now())
    cursor.execute(add_user_statement)
    user_id = cursor.lastrowid
    arithmetic_db_cxn.commit()
    cursor.close()
    return user_id

def generate_new_cookie():
    user_id = create_new_user()
    if user_id is None:
      return '0fffff'
    else:
      return str(user_id) + 'fffff'
