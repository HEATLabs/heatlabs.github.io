import os
import re
import urllib.parse
from datetime import datetime


# Parse date string from article page
def parse_date(date_str):
    try:
        return datetime.strptime(date_str.strip(), "%B %d, %Y")
    except ValueError:
        return None


# Format datetime object into YYYY-MM-DD format for news.html
def format_date_for_news_html(date_obj):
    return date_obj.strftime("%Y-%m-%d")


# Format datetime object into Month Day, Year format for span
def format_date_for_span(date_obj):
    return date_obj.strftime("%B %d, %Y")


# Extract date from an article file using regex
def extract_date_from_article(article_path):
    try:
        with open(article_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Look for the calendar icon followed by date (multiple patterns(i hate regex))
        date_patterns = [
            r'<i class="far fa-calendar-alt mr-1"></i>([A-Za-z]+\s+\d{1,2},\s+\d{4})\s*</span>',
            r'<i class="fa-solid fa-calendar-alt"></i>([A-Za-z]+\s+\d{1,2},\s+\d{4})\s*</span>',
            r'<i class="far fa-calendar-alt"></i>([A-Za-z]+\s+\d{1,2},\s+\d{4})\s*</span>'
        ]

        for pattern in date_patterns:
            date_match = re.search(pattern, content)
            if date_match:
                return parse_date(date_match.group(1))
        return None
    except Exception as e:
        print(f"Error reading {article_path}: {str(e)}")
        return None


# Update news.html with correct dates (finally)
def update_news_dates(news_html_path, news_dir):
    # Read the news.html file
    with open(news_html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all news cards and their hrefs (flexible pattern)
    card_pattern = r'<div class="news-card" data-date="(\d{4}-\d{2}-\d{2})" data-type="[a-z]+">.*?<a href="news/(.*?)" class="btn-accent btn-news">'
    card_matches = list(re.finditer(card_pattern, content, re.DOTALL))

    if not card_matches:
        print("No news cards found in the file")
        return

    updated_count = 0

    # Process each card from last to first to avoid offset issues
    for match in reversed(card_matches):
        original_date = match.group(1)
        href = match.group(2)

        # Handle URL-encoded filenames
        decoded_href = urllib.parse.unquote(href)
        article_path = os.path.join(news_dir, decoded_href)

        if not os.path.exists(article_path):
            print(f"Article not found: {article_path}")
            continue

        date_obj = extract_date_from_article(article_path)
        if not date_obj:
            print(f"Could not extract date from: {article_path}")
            continue

        # Only update if dates are different
        new_data_date = format_date_for_news_html(date_obj)
        if new_data_date == original_date:
            continue

        # Update the data-date attribute
        span_start = match.start(1)
        span_end = match.end(1)
        content = content[:span_start] + new_data_date + content[span_end:]

        # Update the date in the span
        span_pattern = r'(<i class="fa-solid fa-calendar"></i>)\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})\s*(</span>)'
        span_match = re.search(span_pattern, content[match.end():], re.DOTALL)

        if span_match:
            span_pos = match.end() + span_match.start(2)
            new_span_date = format_date_for_span(date_obj)
            content = content[:span_pos] + new_span_date + content[span_pos + len(span_match.group(2)):]
            updated_count += 1

    # Write back to the file
    with open(news_html_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully updated {updated_count} news cards in {news_html_path}")


if __name__ == "__main__":
    # Path to news.html
    news_html_path = 'news.html'

    # Path to news directory
    news_dir = 'news'

    update_news_dates(news_html_path, news_dir)
