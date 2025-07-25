Below are the instructions to set up the backend 
First of all clone the git repo

install backend dependencies by runing this command

```pip install -r requirements.txt```

now set up the scrape and create virtual environment for python

```python -m venv venv```

then activate virtual environment

```venv\Scripts\activate```

Now create env file using this command

```echo 'DATABASE_URL="postgresql://postgres:tehmina12@localhost:5432/job_listing"' > .env```


Then do ```cd scrapper``` 

now run the scrape file to extract jobs

```python scrape.py```

now start the backend by runing this command

```cd backend```
```python app.py```

For frontendend go to frontend folder by 

```cd frontend```
then run 
```npm install```

now run 

``npm start``

here is the google drive video link of presentation

```https://drive.google.com/file/d/10Qvo02C7BRV1pDbDml8Es51XAPjq38iY/view?usp=sharing```

