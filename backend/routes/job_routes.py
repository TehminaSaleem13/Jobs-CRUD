from flask import Blueprint, request, jsonify
from models.job import Job
from db import db
from sqlalchemy import or_, and_, func
from datetime import datetime

job_routes = Blueprint('job_routes', __name__)

def parse_posting_date(posting_date_str):
    if not posting_date_str:
        return None
    
    if isinstance(posting_date_str, str):
        try:
            return datetime.strptime(posting_date_str, "%Y-%m-%d").date()
        except ValueError as e:
            print(f"Invalid posting date format: {posting_date_str}, error: {e}")
            return None
    
    return posting_date_str

@job_routes.route("/jobs", methods=["POST"])
def create_job():
    data = request.get_json()

    if not data.get("title") or not data.get("company") or not data.get("location"):
        return jsonify({"error": "Title, company, and location are required"}), 400

    try:
        existing_job = Job.query.filter_by(
            title=data["title"],
            company=data["company"],
            location=data["location"]
        ).first()

        if existing_job:
            return jsonify({"message": "Job already exists"}), 409

        posting_date_str = data.get("posting_date", "")
        posting_date = None
        
        if posting_date_str:
            try:
                posting_date = datetime.strptime(posting_date_str, "%Y-%m-%d").date()
            except ValueError as e:
                print(f"Failed to parse posting_date: {e}")
                return jsonify({"error": "Invalid posting date format"}), 400

        job = Job(
            title=data["title"],
            company=data["company"],
            location=data["location"],
            posting_date=posting_date,
            job_type=data.get("job_type", "Full-time"),
            tags=data.get("tags", ""),
            summary=data.get("summary", "")
        )
        
        print(f"Job object created. posting_date attribute: {job.posting_date} (type: {type(job.posting_date)})")
        
        db.session.add(job)
        db.session.commit()
        print("Job saved to database successfully")

        try:
            job_dict = job.to_dict()
        except Exception as dict_error:
            print(f"job.to_dict() failed: {dict_error}")
            print(f"job.posting_date at time of error: {job.posting_date} (type: {type(job.posting_date)})")
            return jsonify({"message": "Job added successfully "}), 201

        return jsonify({
            "message": "Job added successfully",
            "job": job_dict
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Exception in create_job: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@job_routes.route("/jobs", methods=["GET"])
def get_jobs():
    try:
        job_type = request.args.get('job_type')
        location = request.args.get('location')
        tag = request.args.get('tag')
        search = request.args.get('search')  
        sort = request.args.get('sort', 'posting_date_desc')
        
        query = Job.query
        
        if job_type:
            query = query.filter(Job.job_type == job_type)
            
        if location:
            query = query.filter(Job.location.ilike(f'%{location}%'))
            
        if tag:
            query = query.filter(Job.tags.ilike(f'%{tag}%'))
            
        if search:
            search_term = f'%{search}%'
            query = query.filter(
                or_(
                    Job.title.ilike(search_term),
                    Job.company.ilike(search_term)
                )
            )
        
        if sort == 'posting_date_desc':
            query = query.order_by(Job.id.desc())
        elif sort == 'posting_date_asc':
            query = query.order_by(Job.id.asc())
        elif sort == 'title':
            query = query.order_by(func.lower(Job.title))
        elif sort == 'company':
            query = query.order_by(func.lower(Job.company))
        else:
            query = query.order_by(Job.id.desc())
        
        jobs = query.all()
        return jsonify([job.to_dict() for job in jobs]), 200
        
    except Exception as e:
        print(f"Failed to get jobs: {e}")
        return jsonify({"error": str(e)}), 500


@job_routes.route("/jobs/<int:job_id>", methods=["GET"])
def get_job(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({"error": "Job not found"}), 404
        
        return jsonify(job.to_dict()), 200
        
    except Exception as e:
        print(f"Failed to get job {job_id}: {e}")
        return jsonify({"error": str(e)}), 500


@job_routes.route("/jobs/<int:job_id>", methods=["PUT"])
def update_job(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({"error": "Job not found"}), 404

        data = request.get_json()

        if not data.get("title") or not data.get("company") or not data.get("location"):
            return jsonify({"error": "Title, company, and location are required"}), 400

        existing_job = Job.query.filter(
            and_(
                Job.title == data["title"],
                Job.company == data["company"],
                Job.location == data["location"],
                Job.id != job_id
            )
        ).first()

        if existing_job:
            return jsonify({"error": "A job with these details already exists"}), 409

        job.title = data["title"]
        job.company = data["company"]
        job.location = data["location"]

        job.posting_date = parse_posting_date(data.get("posting_date"))

        job.job_type = data.get("job_type", job.job_type)
        job.tags = data.get("tags", job.tags)
        job.summary = data.get("summary", job.summary)

        db.session.commit()

        return jsonify({
            "message": "Job updated successfully",
            "job": job.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Failed to update job {job_id}: {e}")
        return jsonify({"error": str(e)}), 400


@job_routes.route("/jobs/<int:job_id>", methods=["DELETE"])
def delete_job(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({"error": "Job not found"}), 404
        
        db.session.delete(job)
        db.session.commit()
        
        return jsonify({"message": "Job deleted successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Failed to delete job {job_id}: {e}")
        return jsonify({"error": str(e)}), 500


@job_routes.route("/jobs/filters", methods=["GET"])
def get_filter_options():
    try:
        job_types = db.session.query(Job.job_type).filter(Job.job_type.isnot(None)).distinct().all()
        job_types = [jt[0] for jt in job_types if jt[0]]
        
        locations = db.session.query(Job.location).filter(Job.location.isnot(None)).distinct().all()
        locations = [loc[0] for loc in locations if loc[0]]
        
        tags_raw = db.session.query(Job.tags).filter(Job.tags.isnot(None)).distinct().all()
        all_tags = set()
        for tag_row in tags_raw:
            if tag_row[0]:
                tags = [tag.strip() for tag in tag_row[0].split(',') if tag.strip()]
                all_tags.update(tags)
        
        return jsonify({
            "job_types": sorted(job_types),
            "locations": sorted(locations),
            "tags": sorted(list(all_tags))
        }), 200
        
    except Exception as e:
        print(f"Failed to get filter options: {e}")
        return jsonify({"error": str(e)}), 500