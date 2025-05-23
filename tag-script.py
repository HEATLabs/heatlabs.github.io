import os
import re

# Directories to scan
directories = [
    ".",  # current directory
    "tournaments",
    "tanks",
    "news",
    "maps",
    "legal",
    "guides",
    "guides/general",
    "guides/maps",
    "guides/tanks",
    "bug-hunting",
    "blog",
    "announcements",
    "placeholder-tables",
]


def update_meta_tags(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        content = file.read()

    # Find the meta tags
    og_title_match = re.search(
        r'<meta\s+property="og:title"\s+content="([^"]*)"\s*/?>', content
    )
    og_desc_match = re.search(
        r'<meta\s+property="og:description"\s+content="([^"]*)"\s*/?>', content
    )
    og_url_match = re.search(
        r'<meta\s+property="og:url"\s+content="([^"]*)"\s*/?>', content
    )

    if not all([og_title_match, og_desc_match, og_url_match]):
        print(f"Skipping {file_path} - missing required og tags")
        return

    og_title = og_title_match.group(1)
    og_description = og_desc_match.group(1)
    og_url = og_url_match.group(1)

    # Update primary meta title
    content = re.sub(
        r'(<meta\s+name="title"\s+content=")([^"]*)("\s*/?>)',
        rf"\1{og_title}\3",
        content,
        count=1,
    )

    # Update primary meta description
    content = re.sub(
        r'(<meta\s+name="description"\s+content=")([^"]*)("\s*/?>)',
        rf"\1{og_description}\3",
        content,
        count=1,
    )

    # Update canonical URL
    content = re.sub(
        r'(<link\s+rel="canonical"\s+href=")([^"]*)("\s*/?>)',
        rf"\1{og_url}\3",
        content,
        count=1,
    )

    # Write back to file
    with open(file_path, "w", encoding="utf-8") as file:
        file.write(content)


def main():
    for directory in directories:
        # Skip directories that are not found
        if not os.path.exists(directory):
            print(f"Directory not found: {directory}")
            continue

        print(f"Processing directory: {directory}")

        for filename in os.listdir(directory):
            if filename.endswith(".html"):
                file_path = os.path.join(directory, filename)
                print(f"  Processing file: {file_path}")
                try:
                    update_meta_tags(file_path)
                except Exception as e:
                    print(f"    Error processing {file_path}: {str(e)}")


if __name__ == "__main__":
    main()
