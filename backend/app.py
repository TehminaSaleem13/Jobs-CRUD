from flask import Flask
from flask_cors import CORS
from config import Config
from db import db
from routes.job_routes import job_routes

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
CORS(app)

app.register_blueprint(job_routes)

@app.before_request
def create_tables_once():
    if not hasattr(app, 'tables_created'):
        db.create_all()
        app.tables_created = True


if __name__ == "__main__":
    app.run(debug=True)
