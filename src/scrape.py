import requests
from bs4 import BeautifulSoup
import pymongo
import pandas as pd
from urllib.parse import urlparse
import re
import time
from datetime import datetime, UTC
import logging
import os
from dotenv import load_dotenv
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import traceback
import ssl
import certifi
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import selenium.common.exceptions
import sys
import socket
import shutil

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('scrape.log')
    ]
)
logger = logging.getLogger('scrape')

# Log Python, pymongo, and OpenSSL versions
logger.debug(f"Python version: {sys.version}")
logger.debug(f"pymongo version: {pymongo.__version__}")
logger.debug(f"OpenSSL version: {ssl.OPENSSL_VERSION}")

class CompanyScraper:
    def __init__(self, mongodb_uri, database_name='company_db', collection_name='scraper_results', skip_mongodb=False):
        """Initialize MongoDB connection and scraper settings with enhanced retry and diagnostics."""
        self.skip_mongodb = skip_mongodb
        self.results = []  # Store scraped data in memory
        if not skip_mongodb:
            logger.debug(f"Attempting MongoDB connection with URI: {mongodb_uri[:50]}... (truncated for logs)")
            # Test network connectivity to MongoDB cluster
            cluster_host = mongodb_uri.split('@')[-1].split('/')[0].split(',')[0].split(':')[0]
            try:
                socket.create_connection((cluster_host, 27017), timeout=5)
                logger.debug(f"Network connectivity test to {cluster_host}:27017 succeeded")
            except socket.error as e:
                logger.warning(f"Network connectivity test to {cluster_host}:27017 failed: {e}")
            max_retries = 5
            retry_delay = 10
            for attempt in range(1, max_retries + 1):
                try:
                    self.client = pymongo.MongoClient(
                        mongodb_uri,
                        serverSelectionTimeoutMS=60000,
                        connectTimeoutMS=30000,
                        socketTimeoutMS=30000,
                        heartbeatFrequencyMS=30000,
                        maxPoolSize=5,
                        tls=True,
                        tlsCAFile=certifi.where(),
                        retryWrites=True,
                        w='majority',
                        appName='CompanyScraper'
                    )
                    self.db = self.client[database_name]
                    self.collection = self.db[collection_name]
                    start_time = time.time()
                    self.collection.insert_one({'test': 'connection_check', 'timestamp': datetime.now(UTC)})
                    duration = (time.time() - start_time) * 1000
                    logger.info(f"Connected to MongoDB successfully, test document inserted to {database_name}.{collection_name} in {duration:.2f}ms")
                    break
                except Exception as e:
                    logger.error(f"MongoDB connection attempt {attempt}/{max_retries} failed: {e}\n{traceback.format_exc()}")
                    if attempt == max_retries:
                        logger.warning("Max retries reached. Falling back to skip_mongodb=True")
                        self.skip_mongodb = True
                        self.collection = None
                    else:
                        logger.info(f"Retrying in {retry_delay} seconds...")
                        time.sleep(retry_delay)
        else:
            logger.info("Skipping MongoDB connection as per configuration")
            self.collection = None

        self.session = requests.Session()
        retries = Retry(total=5, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
        self.session.mount('http://', HTTPAdapter(max_retries=retries))
        self.session.mount('https://', HTTPAdapter(max_retries=retries))
        self.session.timeout = 15
        # Check chromedriver once during initialization
        self.chromedriver_path = shutil.which('chromedriver')
        if not self.chromedriver_path:
            logger.warning("Chromedriver not found. Install it via 'sudo apt-get install chromium-chromedriver' or download from https://chromedriver.chromium.org/downloads. Using requests instead.")

    def close_connection(self):
        """Close MongoDB connection and requests session."""
        if not self.skip_mongodb and hasattr(self, 'client'):
            self.client.close()
        self.session.close()
        logger.info("Connections closed")

    def clean_text(self, text):
        """Clean scraped text by removing extra whitespace, special characters, and HTML tags."""
        if text:
            soup = BeautifulSoup(text, 'html.parser')
            text = soup.get_text(separator=' ')
            return re.sub(r'\s+', ' ', text.strip())
        return None

    def extract_domain(self, url):
        """Extract domain from URL."""
        if url:
            parsed = urlparse(url)
            return parsed.netloc or None
        return None

    def scrape_clearbit_logo(self, company_name):
        """Scrape company logo from Clearbit Logo API."""
        try:
            logger.debug(f"Scraping logo for {company_name} from Clearbit")
            domain = f"www.{company_name.lower()}.com"
            logo_url = f"https://logo.clearbit.com/{domain}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = self.session.head(logo_url, headers=headers, timeout=self.session.timeout)
            if response.status_code == 200:
                logger.debug(f"Found logo for {company_name} at {logo_url}")
                return logo_url
            logger.warning(f"No logo found on Clearbit for {company_name}")
            return None
        except Exception as e:
            logger.error(f"Error scraping Clearbit logo for {company_name}: {e}\n{traceback.format_exc()}")
            return None

    def scrape_wikipedia_tech_stack(self, soup, company_name):
        """Scrape programming languages, tools, and frameworks from Wikipedia infobox, article, and specific sections."""
        tech_stack = []
        languages = {
            'python': 'Python',
            'javascript': 'JavaScript',
            'java': 'Java',
            'c++': 'C++',
            'c#': 'C#',
            'ruby': 'Ruby',
            'php': 'PHP',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            'typescript': 'TypeScript',
            'go': 'Go',
            'rust': 'Rust'
        }
        tools = {
            'git': 'Git',
            'docker': 'Docker',
            'jenkins': 'Jenkins',
            'kubernetes': 'Kubernetes',
            'ansible': 'Ansible',
            'terraform': 'Terraform',
            'aws': 'AWS',
            'azure': 'Azure',
            'gcp': 'Google Cloud Platform',
            'cloudflare': 'Cloudflare'
        }
        frameworks = {
            'react': 'React',
            'angular': 'Angular',
            'vue': 'Vue.js',
            'django': 'Django',
            'flask': 'Flask',
            'node': 'Node.js',
            'express': 'Express.js',
            'wordpress': 'WordPress',
            'next': 'Next.js',
            'gatsby': 'Gatsby',
            'tailwind': 'Tailwind CSS',
            'laravel': 'Laravel',
            'svelte': 'Svelte',
            'nuxt': 'Nuxt.js'
        }

        # Check infobox
        infobox = soup.find('table', {'class': 'infobox'})
        if infobox:
            rows = infobox.find_all('tr')
            for row in rows:
                header = row.find('th')
                if header:
                    header_text = header.text.lower().strip()
                    cell = row.find('td')
                    if cell and ('products' in header_text or 'services' in header_text or 'technology' in header_text):
                        cell_text = self.clean_text(cell.text)
                        if cell_text:
                            cell_text = cell_text.lower()
                            for key, tech in {**languages, **tools, **frameworks}.items():
                                if key in cell_text and tech not in tech_stack:
                                    tech_stack.append(tech)
                                    logger.debug(f"Detected {tech} in Wikipedia infobox for {company_name}")

        # Check specific sections
        sections = soup.find_all(['h2', 'h3'])
        for section in sections:
            section_title = self.clean_text(section.text)
            if section_title and any(keyword in section_title.lower() for keyword in ['products', 'services', 'technology', 'operations', 'software', 'hardware', 'research']):
                content = []
                for sibling in section.find_next_siblings():
                    if sibling.name in ['h2', 'h3']:
                        break
                    content.append(sibling.get_text())
                if content:  # Check if content is non-empty
                    section_text = self.clean_text(' '.join(content))
                    if section_text:
                        section_text = section_text.lower()
                        for key, tech in {**languages, **tools, **frameworks}.items():
                            if key in section_text and tech not in tech_stack:
                                tech_stack.append(tech)
                                logger.debug(f"Detected {tech} in Wikipedia section '{section_title}' for {company_name}")

        # Check all paragraphs
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = self.clean_text(p.text)
            if text:
                text = text.lower()
                for key, tech in {**languages, **tools, **frameworks}.items():
                    if key in text and tech not in tech_stack:
                        tech_stack.append(tech)
                        logger.debug(f"Detected {tech} in Wikipedia paragraph for {company_name}")

        logger.debug(f"Extracted tech stack from Wikipedia for {company_name}: {tech_stack}")
        return tech_stack

    def scrape_website(self, company_name):
        """Scrape company website information with enhanced tech stack detection."""
        try:
            logger.debug(f"Starting website scrape for {company_name}")
            known_urls = {
				'Walmart': 'https://www.walmart.com',
				'Amazon': 'https://www.amazon.com',
				'ExxonMobil': 'https://corporate.exxonmobil.com',
				'Apple': 'https://www.apple.com',
				'Microsoft': 'https://www.microsoft.com',
				'JPMorgan Chase': 'https://www.jpmorganchase.com',
				'Chevron': 'https://www.chevron.com',
				'UnitedHealth Group': 'https://www.unitedhealthgroup.com',
				'General Motors': 'https://www.gm.com',
				'Ford Motor Company': 'https://www.ford.com',
				'CVS Health': 'https://www.cvshealth.com',
				'AT&T': 'https://www.att.com',
				'Berkshire Hathaway': 'https://www.berkshirehathaway.com',
				'Costco Wholesale': 'https://www.costco.com',
				'Home Depot': 'https://www.homedepot.com',
				'Walgreens Boots Alliance': 'https://www.walgreensbootsalliance.com',
				'Marathon Petroleum': 'https://www.marathonpetroleum.com',
				'Alphabet': 'https://abc.xyz',
				'Meta': 'https://about.meta.com',
				'Verizon Communications': 'https://www.verizon.com',
				'Comcast': 'https://corporate.comcast.com',
				'Intel': 'https://www.intel.com',
				'Pfizer': 'https://www.pfizer.com',
				'Johnson & Johnson': 'https://www.jnj.com',
				'Cisco Systems': 'https://www.cisco.com',
				'Eli Lilly': 'https://www.lilly.com',
				'Coca-Cola': 'https://www.coca-colacompany.com',
				'PepsiCo': 'https://www.pepsico.com',
				'Procter & Gamble': 'https://www.pg.com',
				'General Electric': 'https://www.ge.com',
				'Nvidia': 'https://www.nvidia.com',
				'TSMC': 'https://www.tsmc.com',
				'Samsung Electronics': 'https://www.samsung.com',
				'Hon Hai Precision': 'https://www.foxconn.com',
				'Dell Technologies': 'https://www.dell.com',
				'Oracle': 'https://www.oracle.com',
				'Salesforce': 'https://www.salesforce.com',
				'Adobe': 'https://www.adobe.com',
				'IBM': 'https://www.ibm.com',
				'Tencent': 'https://www.tencent.com',
				'Alibaba': 'https://www.alibabagroup.com',
				'JD.com': 'https://www.jd.com',
				'Volkswagen Group': 'https://www.volkswagenag.com',
				'Shell': 'https://www.shell.com',
				'BP': 'https://www.bp.com',
				'TotalEnergies': 'https://www.totalenergies.com',
				'Nestlé': 'https://www.nestle.com',
				'Glencore': 'https://www.glencore.com',
				'Unilever': 'https://www.unilever.com',
				'Siemens': 'https://www.siemens.com',
				'Mercedes-Benz Group': 'https://www.mercedes-benz.com',
				'BMW': 'https://www.bmwgroup.com',
				'Roche': 'https://www.roche.com',
				'Novartis': 'https://www.novartis.com',
				'Allianz': 'https://www.allianz.com',
				'AXA': 'https://www.axa.com',
				'HSBC': 'https://www.hsbc.com',
				'Airbus': 'https://www.airbus.com',
				'LVMH': 'https://www.lvmh.com',
				'Deutsche Telekom': 'https://www.telekom.com',
				'Saudi Aramco': 'https://www.aramco.com',
				'Toyota Motor': 'https://global.toyota',
				'Mitsubishi Corporation': 'https://www.mitsubishicorp.com',
				'Honda Motor': 'https://global.honda',
				'Sony': 'https://www.sony.com',
				'Reliance Industries': 'https://www.ril.com',
				'ICBC': 'https://www.icbc.com.cn',
				'China Construction Bank': 'https://www.ccb.com',
				'Agricultural Bank of China': 'https://www.abchina.com',
				'State Grid': 'https://www.sgcc.com.cn',
				'Sinopec': 'https://www.sinopecgroup.com',
				'China National Petroleum': 'https://www.cnpc.com.cn',
				'Ping An Insurance': 'https://www.pingan.com',
				'Hyundai Motor': 'https://www.hyundai.com',
				'SoftBank': 'https://group.softbank',
				'McDonald’s': 'https://www.mcdonalds.com',
				'Nike': 'https://www.nike.com',
				'Disney': 'https://www.thewaltdisneycompany.com',
				'Tesla': 'https://www.tesla.com',
				'Boeing': 'https://www.boeing.com',
				'Lockheed Martin': 'https://www.lockheedmartin.com',
				'Goldman Sachs': 'https://www.goldmansachs.com',
				'Morgan Stanley': 'https://www.morganstanley.com',
				'Citigroup': 'https://www.citigroup.com',
				'Wells Fargo': 'https://www.wellsfargo.com',
				'BHP Group': 'https://www.bhp.com',
				'Rio Tinto': 'https://www.riotinto.com',
				'AstraZeneca': 'https://www.astrazeneca.com',
				'GSK': 'https://www.gsk.com',
				'Sanofi': 'https://www.sanofi.com',
				'UBS': 'https://www.ubs.com',
				'Credit Suisse': 'https://www.credit-suisse.com',
				'Zurich Insurance Group': 'https://www.zurich.com',
				'Vitol': 'https://www.vitol.com',
				'Trafigura': 'https://www.trafigura.com',
				'IKEA': 'https://www.ikea.com',
				'Lidl': 'https://www.lidl.com',
				'Aldi': 'https://www.aldi.com',
				'Koch Industries': 'https://www.kochind.com',
				'Cargill': 'https://www.cargill.com',
            }
            website = known_urls.get(company_name)
            if not website:
                logger.warning(f"No known website URL for {company_name}")
                return {'website': None, 'logo': None, 'tech_stack': []}

            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }

            content = None
            if self.chromedriver_path:
                try:
                    logger.debug(f"Scraping website with Selenium: {website}")
                    options = Options()
                    options.add_argument('--headless')
                    options.add_argument('--disable-gpu')
                    options.add_argument(f'user-agent={headers["User-Agent"]}')
                    driver = webdriver.Chrome(options=options)
                    driver.set_page_load_timeout(30)
                    driver.get(website)
                    time.sleep(3)  # Wait for dynamic content
                    content = driver.page_source
                    driver.quit()
                except selenium.common.exceptions.WebDriverException as se:
                    logger.warning(f"Selenium failed for {website}: {se}. Falling back to requests.")
                    self.chromedriver_path = None  # Avoid retrying Selenium

            if not content:
                try:
                    response = self.session.get(url=website, headers=headers, timeout=self.session.timeout)
                    response.raise_for_status()
                    content = response.text
                except (requests.exceptions.Timeout, requests.exceptions.RequestException) as e:
                    logger.error(f"Requests failed for {website}: {e}\n{traceback.format_exc()}")
                    return {'website': website, 'logo': self.scrape_clearbit_logo(company_name), 'tech_stack': []}

            soup = BeautifulSoup(content, 'html.parser')

            # Enhanced logo detection
            logo = None
            img_tags = soup.find_all('img')
            for img in img_tags:
                alt_text = img.get('alt', '').lower()
                src_text = img.get('src', '').lower()
                class_text = ' '.join(img.get('class', [])).lower()
                if 'logo' in alt_text or 'logo' in src_text or 'logo' in class_text or company_name.lower() in alt_text:
                    logo = img.get('src')
                    if logo and not logo.startswith('http'):
                        logo = f"{website.rstrip('/')}/{logo.lstrip('/')}"
                    break

            # Fallback to Clearbit
            if not logo:
                logo = self.scrape_clearbit_logo(company_name)

            # Enhanced tech stack detection
            tech_stack = []
            frameworks = {
                'react': 'React',
                'angular': 'Angular',
                'vue': 'Vue.js',
                'jquery': 'jQuery',
                'bootstrap': 'Bootstrap',
                'node': 'Node.js',
                'express': 'Express.js',
                'django': 'Django',
                'flask': 'Flask',
                'wordpress': 'WordPress',
                'next': 'Next.js',
                'gatsby': 'Gatsby',
                'tailwind': 'Tailwind CSS',
                'laravel': 'Laravel',
                'svelte': 'Svelte',
                'nuxt': 'Nuxt.js'
            }
            languages = {
                'javascript': 'JavaScript',
                'python': 'Python',
                'java': 'Java',
                'c++': 'C++',
                'c#': 'C#',
                'ruby': 'Ruby',
                'php': 'PHP',
                'swift': 'Swift',
                'kotlin': 'Kotlin',
                'typescript': 'TypeScript',
                'go': 'Go',
                'rust': 'Rust'
            }
            tools = {
                'git': 'Git',
                'docker': 'Docker',
                'jenkins': 'Jenkins',
                'kubernetes': 'Kubernetes',
                'ansible': 'Ansible',
                'terraform': 'Terraform',
                'aws': 'AWS',
                'azure': 'Azure',
                'gcp': 'Google Cloud Platform',
                'cloudflare': 'Cloudflare'
            }

            # Check scripts
            scripts = soup.find_all('script')
            for script in scripts:
                src = script.get('src', '').lower()
                content = script.text.lower()
                for key, tech in {**frameworks, **languages, **tools}.items():
                    if (key in src or key in content) and tech not in tech_stack:
                        tech_stack.append(tech)
                        logger.debug(f"Detected {tech} in website script for {company_name}")
                if src and '.js' in src and 'JavaScript' not in tech_stack:
                    tech_stack.append('JavaScript')
                    logger.debug(f"Detected JavaScript in website script for {company_name}")
                if src and '.py' in src and 'Python' not in tech_stack:
                    tech_stack.append('Python')
                    logger.debug(f"Detected Python in website script for {company_name}")

            # Check link tags for CSS frameworks
            links = soup.find_all('link', {'rel': 'stylesheet'})
            for link in links:
                href = link.get('href', '').lower()
                for key, tech in frameworks.items():
                    if key in href and tech not in tech_stack:
                        tech_stack.append(tech)
                        logger.debug(f"Detected {tech} in website link tag for {company_name}")
                if 'tailwind' in href and 'Tailwind CSS' not in tech_stack:
                    tech_stack.append('Tailwind CSS')
                    logger.debug(f"Detected Tailwind CSS in website link tag for {company_name}")
                if 'bootstrap' in href and 'Bootstrap' not in tech_stack:
                    tech_stack.append('Bootstrap')
                    logger.debug(f"Detected Bootstrap in website link tag for {company_name}")

            # Check meta tags
            meta_tags = soup.find_all('meta')
            for meta in meta_tags:
                content = meta.get('content', '').lower()
                for key, tech in {**frameworks, **languages, **tools}.items():
                    if key in content and tech not in tech_stack:
                        tech_stack.append(tech)
                        logger.debug(f"Detected {tech} in website meta tag for {company_name}")

            # Check headers
            try:
                response = self.session.head(url=website, headers=headers, timeout=self.session.timeout)
                headers_lower = {k.lower(): v.lower() for k, v in response.headers.items()}
                if 'x-powered-by' in headers_lower:
                    powered_by = headers_lower['x-powered-by']
                    for key, tech in {**frameworks, **languages, **tools}.items():
                        if key in powered_by and tech not in tech_stack:
                            tech_stack.append(tech)
                            logger.debug(f"Detected {tech} in website headers for {company_name}")
                if 'server' in headers_lower and 'cloudflare' in headers_lower['server']:
                    tech_stack.append('Cloudflare')
                    logger.debug(f"Detected Cloudflare in website headers for {company_name}")
            except:
                pass

            logger.debug(f"Website scrape completed for {company_name}: tech_stack={tech_stack}")
            return {
                'website': website,
                'logo': logo,
                'tech_stack': tech_stack
            }

        except Exception as e:
            logger.error(f"Unexpected error scraping website for {company_name}: {website}: {e}\n{traceback.format_exc()}")
            return {'website': website, 'logo': self.scrape_clearbit_logo(company_name), 'tech_stack': []}

    def scrape_wikipedia(self, company_name):
        """Scrape Wikipedia using MediaWiki API with improved title search and full page scraping."""
        try:
            logger.debug(f"Starting Wikipedia scrape for {company_name}")
            start_time = time.time()
            search_url = "https://en.wikipedia.org/w/api.php"
            headers = {'User-Agent': 'CompanyScraper/1.0 (pranay@example.com)'}

            # Try multiple search terms
            search_terms = [
                f"{company_name}, Inc.",
                f"{company_name} (company)",
                f"{company_name}",
                f"{company_name} company"
            ]
            title = None
            for term in search_terms:
                logger.debug(f"Searching Wikipedia with term: {term}")
                search_params = {
                    'action': 'opensearch',
                    'search': term,
                    'limit': 1,
                    'format': 'json'
                }
                response = self.session.get(search_url, params=search_params, headers=headers, timeout=self.session.timeout)
                response.raise_for_status()
                search_data = response.json()

                if search_data[1]:
                    title = search_data[1][0]
                    logger.debug(f"Found potential title: {title}")
                    # Validate title
                    query_params = {
                        'action': 'query',
                        'titles': title,
                        'format': 'json',
                        'prop': 'extracts|info',
                        'exintro': 1,
                        'exsentences': 2,
                        'inprop': 'url'
                    }
                    response = self.session.get(search_url, params=query_params, headers=headers, timeout=self.session.timeout)
                    response.raise_for_status()
                    data = response.json()
                    page = next(iter(data['query']['pages'].values()))
                    if 'extract' in page and page['extract']:
                        summary = self.clean_text(page['extract']).lower()
                        # Check for company-specific keywords and infobox
                        page_url = page.get('fullurl', f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}")
                        page_response = self.session.get(page_url, headers=headers, timeout=self.session.timeout)
                        page_response.raise_for_status()
                        page_soup = BeautifulSoup(page_response.text, 'html.parser')
                        infobox = page_soup.find('table', {'class': 'infobox'})
                        if infobox and any(keyword in summary for keyword in ['corporation', 'multinational', 'company', 'founded', 'headquarters']):
                            logger.debug(f"Validated title: {title}")
                            break
                    logger.debug(f"Title {title} invalid or missing extract for term '{term}', trying next term")
                    title = None

            if not title:
                logger.warning(f"No valid Wikipedia page found for {company_name}")
                return None

            # Fetch full page data
            query_params = {
                'action': 'query',
                'titles': title,
                'format': 'json',
                'redirects': 1,
                'prop': 'extracts|info',
                'exlimit': 'max',
                'inprop': 'url'
            }
            logger.debug(f"Fetching full Wikipedia page data for {title}")
            response = self.session.get(search_url, params=query_params, headers=headers, timeout=self.session.timeout)
            response.raise_for_status()
            data = response.json()

            pages = data['query']['pages']
            page = next(iter(pages.values()))
            if 'missing' in page:
                logger.warning(f"Wikipedia page {title} is missing")
                return None

            logger.debug(f"Retrieved Wikipedia page: {title} in {(time.time() - start_time)*1000:.2f}ms")

            summary = None
            if 'extract' in page and page['extract']:
                summary = self.clean_text(page['extract'])
            else:
                logger.warning(f"No summary available for {title}")

            page_url = page.get('fullurl', f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}")
            response = self.session.get(page_url, headers=headers, timeout=self.session.timeout)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            employees = None
            revenue = None
            industries = None
            infobox = soup.find('table', {'class': 'infobox'})
            if infobox:
                rows = infobox.find_all('tr')
                for row in rows:
                    header = row.find('th')
                    if header:
                        header_text = header.text.lower().strip()
                        cell = row.find('td')
                        if cell:
                            cell_text = self.clean_text(cell.text)
                            if 'employees' in header_text:
                                employees = cell_text
                                logger.debug(f"Found employees for {company_name}: {employees}")
                            elif 'revenue' in header_text:
                                revenue = cell_text
                                logger.debug(f"Found revenue for {company_name}: {revenue}")
                            elif 'industry' in header_text or 'industries' in header_text:
                                industries = cell_text
                                logger.debug(f"Found industries for {company_name}: {industries}")

            # Fallback: Scrape sections if infobox is missing or incomplete
            if not all([employees, revenue, industries]):
                sections = soup.find_all(['h2', 'h3'])
                for section in sections:
                    section_title = self.clean_text(section.text)
                    if section_title and any(keyword in section_title.lower() for keyword in ['operations', 'history', 'financials', 'business', 'about']):
                        content = []
                        for sibling in section.find_next_siblings():
                            if sibling.name in ['h2', 'h3']:
                                break
                            content.append(sibling.get_text())
                        if content:  # Check if content is non-empty
                            section_text = self.clean_text(' '.join(content))
                            if section_text:
                                section_text = section_text.lower()
                                if not employees and 'employees' in section_text:
                                    match = re.search(r'(\d{1,3}(?:,\d{3})*(?:\s*\(\d{4}\))?) employees', section_text, re.IGNORECASE)
                                    if match:
                                        employees = match.group(1)
                                        logger.debug(f"Found employees in section for {company_name}: {employees}")
                                if not revenue and 'revenue' in section_text:
                                    match = re.search(r'revenue.*?(?:us\$|USD)\s*([\d.]+)\s*(billion|million)', section_text, re.IGNORECASE)
                                    if match:
                                        revenue = f"US${match.group(1)} {match.group(2)}"
                                        logger.debug(f"Found revenue in section for {company_name}: {revenue}")
                                if not industries and 'industry' in section_text:
                                    match = re.search(r'industr(?:y|ies):?\s*([a-zA-Z\s,]+)', section_text, re.IGNORECASE)
                                    if match:
                                        industries = match.group(1).strip()
                                        logger.debug(f"Found industries in section for {company_name}: {industries}")

            # Scrape tech stack, handle errors gracefully
            tech_stack = []
            try:
                tech_stack = self.scrape_wikipedia_tech_stack(soup, company_name)
            except Exception as e:
                logger.error(f"Error scraping Wikipedia tech stack for {company_name}: {e}\n{traceback.format_exc()}")
                logger.warning(f"Skipping tech stack for {company_name}, returning other Wikipedia data")

            # Log warnings for missing fields
            if not employees:
                logger.warning(f"No employees data found for {company_name}")
            if not revenue:
                logger.warning(f"No revenue data found for {company_name}")
            if not industries:
                logger.warning(f"No industries data found for {company_name}")
            if not tech_stack:
                logger.warning(f"No tech stack data found for {company_name}")

            logger.debug(f"Wikipedia scrape completed for {company_name} in {(time.time() - start_time)*1000:.2f}ms")
            return {
                'description': summary,
                'employees': employees,
                'revenue': revenue,
                'industries': industries,
                'wiki_title': title,
                'tech_stack': tech_stack
            }

        except requests.exceptions.Timeout:
            logger.warning(f"Timeout scraping Wikipedia for {company_name}")
            return None
        except requests.exceptions.RequestException as e:
            logger.warning(f"Network error scraping Wikipedia for {company_name}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error scraping Wikipedia for {company_name}: {e}\n{traceback.format_exc()}")
            return {'wiki_title': title} if title else None

    def scrape_company(self, company_name):
        """Scrape all company information and store in memory/MongoDB, ensuring Wikipedia data is stored even if website scrape fails."""
        try:
            if not company_name or not isinstance(company_name, str):
                logger.error(f"Invalid company name: {company_name}")
                return None

            logger.info(f"Starting to scrape data for {company_name}")
            wiki_data = self.scrape_wikipedia(company_name)
            time.sleep(3)
            web_data = self.scrape_website(company_name)

            # Combine tech stacks from Wikipedia and website
            tech_stack = web_data.get('tech_stack', [])
            if wiki_data and wiki_data.get('tech_stack'):
                tech_stack = list(set(tech_stack + wiki_data.get('tech_stack', [])))

            # Ensure Wikipedia data is stored even if website scrape fails
            company_record = {
                'name': company_name,
                'description': wiki_data.get('description') if wiki_data else None,
                'employees': wiki_data.get('employees') if wiki_data else None,
                'revenue': wiki_data.get('revenue') if wiki_data else None,
                'industries': wiki_data.get('industries') if wiki_data else None,
                'wiki_title': wiki_data.get('wiki_title') if wiki_data else None,
                'website': web_data.get('website') if web_data else None,
                'domain': self.extract_domain(web_data.get('website')) if web_data else None,
                'logo': web_data.get('logo') if web_data else self.scrape_clearbit_logo(company_name),
                'tech_stack': tech_stack,
                'scraped_at': datetime.now(UTC),
                'source': ['Wikipedia'] if wiki_data else []
            }
            if web_data and web_data.get('website'):
                company_record['source'].append('Company Website')

            self.results.append(company_record)

            if not self.skip_mongodb:
                start_time = time.time()
                self.collection.update_one(
                    {'name': company_name},
                    {'$set': company_record},
                    upsert=True
                )
                duration = (time.time() - start_time) * 1000
                logger.info(f"Successfully stored data for {company_name} in MongoDB in {duration:.2f}ms")
            else:
                logger.info(f"Skipping MongoDB storage for {company_name} (skip_mongodb=True)")

            return company_record

        except Exception as e:
            logger.error(f"Error scraping company {company_name}: {e}\n{traceback.format_exc()}")
            return None

    def export_to_files(self, output_dir='output'):
        """Export scraped data to Excel and CSV files."""
        try:
            logger.debug("Starting data export")
            os.makedirs(output_dir, exist_ok=True)

            if not self.results and self.skip_mongodb:
                logger.warning("No data to export (no results and skip_mongodb=True)")
                return

            records = self.results
            if not self.skip_mongodb:
                start_time = time.time()
                try:
                    records.extend(list(self.collection.find()))
                    duration = (time.time() - start_time) * 1000
                    logger.debug(f"Fetched {len(records)} records from MongoDB in {duration:.2f}ms")
                except Exception as e:
                    logger.warning(f"Failed to fetch records from MongoDB: {e}. Using in-memory results only.")

            if not records:
                logger.warning("No records to export")
                return

            df = pd.DataFrame(records)
            if '_id' in df.columns:
                df = df.drop('_id', axis=1)

            # Convert timezone-aware datetimes to naive
            for col in df.columns:
                if isinstance(df[col].dtype, pd.DatetimeTZDtype):
                    df[col] = df[col].dt.tz_localize(None)

            excel_path = os.path.join(output_dir, 'company_data.xlsx')
            try:
                df.to_excel(excel_path, index=False)
                logger.info(f"Successfully exported data to {excel_path}")
            except Exception as e:
                logger.error(f"Excel export failed: {e}. Falling back to CSV.")
                csv_path = os.path.join(output_dir, 'company_data.csv')
                df.to_csv(csv_path, index=False)
                logger.info(f"Successfully exported data to {csv_path}")

            if not os.path.exists(excel_path):
                csv_path = os.path.join(output_dir, 'company_data.csv')
                df.to_csv(csv_path, index=False)
                logger.info(f"Successfully exported data to {csv_path}")

            logger.debug("Data export completed")

        except Exception as e:
            logger.error(f"Error exporting data to files: {e}\n{traceback.format_exc()}")

def read_companies(file_path='companies.txt'):
    """Read company names from a file, one per line."""
    try:
        logger.debug(f"Reading companies from {file_path}")
        with open(file_path, 'r', encoding='utf-8') as file:
            companies = [line.strip() for line in file if line.strip() and len(line.strip()) > 1]
        logger.info(f"Read {len(companies)} companies from {file_path}")
        return companies
    except Exception as e:
        logger.error(f"Error reading {file_path}: {e}\n{traceback.format_exc()}")
        return []

def main():
    MONGODB_URI = os.getenv('MONGODB_URI')
    if not MONGODB_URI:
        logger.error("MONGODB_URI environment variable not set")
        return

    logger.debug(f"Using MONGODB_URI: {MONGODB_URI[:50]}... (truncated for logs)")
    DATABASE_NAME = "company_db"
    COLLECTION_NAME = "companies"
    COMPANIES_FILE = "companies.txt"

    try:
        scraper = CompanyScraper(MONGODB_URI, DATABASE_NAME, COLLECTION_NAME, skip_mongodb=False)
    except Exception as e:
        logger.error(f"Failed to initialize scraper: {e}\n{traceback.format_exc()}")
        logger.warning("Proceeding with skip_mongodb=True to continue scraping")
        scraper = CompanyScraper(MONGODB_URI, DATABASE_NAME, COLLECTION_NAME, skip_mongodb=True)

    companies = read_companies(COMPANIES_FILE)
    if not companies:
        logger.error("No companies to process. Exiting.")
        scraper.close_connection()
        return

    for company in companies:
        scraper.scrape_company(company)
        time.sleep(10)

    scraper.export_to_files()
    scraper.close_connection()

if __name__ == "__main__":
    main()