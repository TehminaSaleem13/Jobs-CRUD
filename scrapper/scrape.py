import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime, timedelta, date


options = Options()
options.headless = False

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)


def parse_posting_date(text):

    today = datetime.today().date()

    if not text or not isinstance(text, str):
        return None

    text = text.strip().lower()

    if "today" in text or "just posted" in text:
        return today

    import re
    match = re.match(r"(\d+)([a-z]+)", text)
    if match:
        num = int(match.group(1))
        unit = match.group(2)

        if unit in ["d", "day", "days"]:
            return today - timedelta(days=num)
        elif unit in ["h", "hour", "hours"]:
            return today 
        elif unit in ["mo", "month", "months"]:
            return today - timedelta(days=num * 30)  

    return None  

    

print("Opening homepage…")
driver.get("https://www.actuarylist.com")

WebDriverWait(driver, 15).until(
    EC.presence_of_element_located((By.CLASS_NAME, "Job_job-card__YgDAV"))
)

driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
time.sleep(3)

job_cards = driver.find_elements(By.CLASS_NAME, "Job_job-card__YgDAV")
print(f"Found {len(job_cards)} job cards")

for card in job_cards:
    try:
        title = card.find_element(By.CLASS_NAME, "Job_job-card__position__ic1rc").text.strip()
        company = card.find_element(By.CLASS_NAME, "Job_job-card__company__7T9qY").text.strip()
        posting_date_text = card.find_element(By.CLASS_NAME, "Job_job-card__posted-on__NCZaJ").text.strip()
        
        posting_date = parse_posting_date(posting_date_text)
        
        print(f"Posting date text: '{posting_date_text}' -> Parsed: {posting_date} (type: {type(posting_date)})")

        locations = []
        try:
            wrapper = card.find_element(By.CLASS_NAME, "Job_job-card__locations__x1exr")
            spans = wrapper.find_elements(By.CLASS_NAME, "Job_job-card__location__bq7jX")
            locations = [loc.text.strip() for loc in spans if loc.text.strip()]
        except:
            try:
                loc = card.find_element(By.CLASS_NAME, "Job_job-card__country__GRVhK").text.strip()
                if loc:
                    locations = [loc]
            except:
                pass
        location = ", ".join(locations) if locations else "Not specified"

        tags = []
        try:
            tw = card.find_element(By.CLASS_NAME, "Job_job-card__tags__zfriA")
            spans = tw.find_elements(By.CLASS_NAME, "Job_job-card__location__bq7jX")
            tags = [t.text.strip() for t in spans if t.text.strip()]
        except:
            pass
        tags_str = ", ".join(tags)

        job_type = "Full-time"
        for t in tags:
            if "Intern" in t:
                job_type = "Internship"
                break
            if "Part-time" in t:
                job_type = "Part-time"
                break

        summary = ""
        try:
            link = card.find_element(By.TAG_NAME, "a").get_attribute("href")
            driver.execute_script("window.open(arguments[0]);", link)
            driver.switch_to.window(driver.window_handles[-1])

            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "Job_job-body__M1FLu"))
            )

            body_div = driver.find_element(By.CLASS_NAME, "Job_job-body__M1FLu")
            inner_divs = body_div.find_elements(By.XPATH, "./div[not(@class)]")

            summary_parts = []

            for div in inner_divs:
                ps = div.find_elements(By.TAG_NAME, "p")
                uls = div.find_elements(By.TAG_NAME, "ul")

                for p in ps:
                    text = p.text.strip()
                    if text:
                        summary_parts.append(text)

                for ul in uls:
                    lis = ul.find_elements(By.TAG_NAME, "li")
                    for li in lis:
                        text = li.text.strip()
                        if text:
                            summary_parts.append(f"- {text}")

                if summary_parts:
                    break

            summary = "\n".join(summary_parts)

        except Exception as e:
            summary = ""
        finally:
            driver.close()
            driver.switch_to.window(driver.window_handles[0])

        if isinstance(posting_date, str):

            try:
                posting_date = datetime.strptime(posting_date, "%Y-%m-%d").date()
            except ValueError:
                posting_date = datetime.today().date()

        job = {
            "title": title,
            "company": company,
            "location": location,
            "posting_date": posting_date.strftime("%Y-%m-%d") if isinstance(posting_date, date) else None,
            "job_type": job_type,
            "tags": tags_str,
            "summary": summary
        }


        resp = requests.post("http://localhost:5000/jobs", json=job)
        if resp.status_code == 201:
            print(f"Added: {title} at {company}")
        elif resp.status_code == 409:
            print(f"Skipped (already exists): {title} at {company}")
        else:
            print(f"Failed — {resp.status_code}: {resp.text}")

    except Exception as e:
        print("Error scraping one job card:", str(e))
        continue

driver.quit()
print("Done scraping.")