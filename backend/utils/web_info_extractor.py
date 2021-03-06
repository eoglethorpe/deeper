from bs4 import BeautifulSoup
from readability.readability import Document
from urllib.parse import urlparse
from .date_extractor import extract_date

import requests
import tldextract


HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36', # noqa
}


class WebInfoExtractor:
    def __init__(self, url):
        self.url = url

        head = requests.head(url, headers=HEADERS)
        if 'text/html' in head.headers.get('content-type'):
            html = requests.get(url, headers=HEADERS).text
            self.readable = Document(html)
            self.page = BeautifulSoup(html, 'lxml')
        else:
            self.readable = None
            self.page = None

    def get_title(self):
        return self.readable and self.readable.short_title()

    def get_date(self):
        return extract_date(self.url, self.page)

    def get_country(self):
        if not self.page:
            return None
        country = self.page.select('.primary-country .country a')
        if country:
            return country[0].text.strip()

        country = self.page.select('.country')
        if country:
            return country[0].text.strip()

        return None

    def get_source(self):
        if self.page:
            source = self.page.select('.field-source')
            if source:
                return source[0].text.strip()

        return tldextract.extract(self.url).domain

    def get_website(self):
        return urlparse(self.url).netloc
