import requests
from bs4 import BeautifulSoup
import pymongo
import time
import random
from urllib.parse import quote
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MongoDB Atlas connection setup
def connect_to_mongodb_atlas():
    try:
        # Replace with your MongoDB Atlas connection string
        atlas_connection_string = "mongodb+srv://pranay:pranay@clustersme.venb4rq.mongodb.net/?retryWrites=true&w=majority&appName=ClusterSME"
        client = pymongo.MongoClient(atlas_connection_string)
        db = client["job_listings"]  # Database name
        collection = db["jobs"]      # Collection name
        logger.info("Connected to MongoDB Atlas successfully")
        return collection
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB Atlas: {e}")
        raise

# Function to scrape job listings from Indeed for a given company
def scrape_jobs(company_name):
    jobs = []
    base_url = "https://www.indeed.com/jobs"
    query = f"{quote(company_name)}"
    url = f"{base_url}?q=company%3A{query}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Send HTTP request
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise exception for bad status codes
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find job cards (Indeed's job listing structure as of 2025)
        job_cards = soup.find_all('div', class_='job_seen_beacon')
        
        for card in job_cards:
            try:
                title = card.find('h2', class_='jobTitle').text.strip() if card.find('h2', class_='jobTitle') else 'N/A'
                location = card.find('div', class_='companyLocation').text.strip() if card.find('div', class_='companyLocation') else 'N/A'
                description = card.find('div', class_='job-snippet').text.strip() if card.find('div', class_='job-snippet') else 'N/A'
                link = card.find('a', class_='jcs-JobTitle')['href'] if card.find('a', class_='jcs-JobTitle') else 'N/A'
                full_link = f"https://www.indeed.com{link}" if link != 'N/A' else 'N/A'
                
                job = {
                    'company': company_name,
                    'title': title,
                    'location': location,
                    'description': description,
                    'link': full_link,
                    'scraped_at': time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
                }
                jobs.append(job)
            except AttributeError as e:
                logger.warning(f"Failed to parse a job card for {company_name}: {e}")
                continue
                
        logger.info(f"Scraped {len(jobs)} jobs for {company_name}")
        return jobs
    
    except requests.RequestException as e:
        logger.error(f"Failed to scrape jobs for {company_name}: {e}")
        return []

# Function to read companies from file
def read_companies(file_path):
    try:
        with open(file_path, 'r') as file:
            companies = [line.strip() for line in file if line.strip()]
        logger.info(f"Read {len(companies)} companies from {file_path}")
        return companies
    except FileNotFoundError:
        logger.error(f"File {file_path} not found")
        raise
    except Exception as e:
        logger.error(f"Error reading {file_path}: {e}")
        raise

# Function to store jobs in MongoDB Atlas
def store_jobs(collection, jobs):
    try:
        if jobs:
            collection.insert_many(jobs, ordered=False)
            logger.info(f"Stored {len(jobs)} jobs in MongoDB Atlas")
        else:
            logger.info("No jobs to store")
    except pymongo.errors.BulkWriteError as e:
        logger.warning(f"Some jobs failed to insert (possible duplicates): {e}")
    except Exception as e:
        logger.error(f"Failed to store jobs in MongoDB Atlas: {e}")

# Main function
def main():
    companies_file = "companies.txt"
    collection = connect_to_mongodb_atlas()
    
    # Read companies from file
    companies = read_companies(companies_file)
    
    for company in companies:
        logger.info(f"Scraping jobs for {company}")
        
        # Scrape jobs
        jobs = scrape_jobs(company)
        
        # Store jobs in MongoDB Atlas
        store_jobs(collection, jobs)
        
        # Respectful scraping: random delay between 2-5 seconds
        time.sleep(random.uniform(2, 5))

if __name__ == "__main__":
    main()