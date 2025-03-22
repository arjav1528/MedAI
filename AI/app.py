from flask import Flask, render_template
# Remove the 'import gunicorn' line as it's not needed in the application code

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/hello')
def some_function():
    return {
        'name': 'Hello World',
        'age': 25,
        'city': 'New York',
        'state': 'NY'
    }

if __name__ == '__main__':
    app.run()