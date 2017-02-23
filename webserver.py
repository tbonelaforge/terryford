from flask import Flask
from flask import render_template
from flask import make_response
from flask import request
app = Flask(__name__)

@app.route('/')
def home_page():
    html = render_template('homepage/index.html')
    return html

@app.route('/arithmetic')
def arithmetic_start_page():
    cookie = request.cookies.get('arithmetic')
    html = render_template("arithmetic3/game-container.html")
    resp = make_response(html)
    if (cookie is not None and len(cookie) > 0):
        resp.set_cookie('arithmetic', cookie)
    else:
        resp.set_cookie('arithmetic', 'none')
    return resp

@app.route('/walkthrough')
def walkthrough():
    return walkthrough_page()

@app.route('/walkthrough/<walkthrough_step>')
def walkthrough_page(walkthrough_step="1"):
    html = render_template("arithmetic3/walkthrough.html", step=walkthrough_step)
    return html
