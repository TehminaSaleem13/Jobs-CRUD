from db import db
from sqlalchemy.schema import UniqueConstraint
from datetime import datetime, date

class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    posting_date = db.Column(db.Date, nullable=True)  
    job_type = db.Column(db.String(50), nullable=True)
    tags = db.Column(db.String(255), nullable=True)
    summary = db.Column(db.Text, nullable=True)

    __table_args__ = (
        UniqueConstraint('title', 'company', 'location', name='unique_job_entry'),
    )

    def to_dict(self):
        
        today = date.today()
        formatted_posting = ''
        raw_posting = None

        if self.posting_date:
            posting_date_obj = None
            
            if isinstance(self.posting_date, str):
                try:
                    posting_date_obj = datetime.strptime(self.posting_date, "%Y-%m-%d").date()
                    raw_posting = self.posting_date  
                except ValueError:
                    return {
                        "id": self.id,
                        "title": self.title,
                        "company": self.company,
                        "location": self.location,
                        "posting_date": self.posting_date, 
                        "posting_date_raw": self.posting_date,
                        "job_type": self.job_type,
                        "tags": self.tags,
                        "summary": self.summary
                    }
            else:
                posting_date_obj = self.posting_date
                raw_posting = self.posting_date.strftime("%Y-%m-%d")
            
            days_ago = (today - posting_date_obj).days
            if days_ago == 0:
                formatted_posting = "Today"
            elif days_ago == 1:
                formatted_posting = "1 day ago"
            else:
                formatted_posting = f"{days_ago} days ago"

        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "posting_date": formatted_posting,       
            "posting_date_raw": raw_posting,         
            "job_type": self.job_type,
            "tags": self.tags,
            "summary": self.summary
        }