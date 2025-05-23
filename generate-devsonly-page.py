#!/usr/bin/env python3
import os
from pathlib import Path

def find_html_files(directory):
    """Find all HTML files in directory and subdirectories, sorted alphabetically"""
    """Notice: This script needs to be ran in the root directory of the repo."""
    html_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.html'):
                full_path = os.path.join(root, file)
                # Skip the devsonly_OG.html file itself (what I rename it to when checking if it updated correctly)
                if os.path.basename(full_path).lower() != 'devsonly_OG.html':
                    html_files.append(full_path)
    return sorted(html_files)

def generate_html_content(html_files, base_dir):
    # HTML header and opening tags
    content = """<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Main meta tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Page title displayed in the browser tab -->
    <title>Devs Only - PCWStats</title>
    <!-- Theme Checker -->
    <script>
      // Immediately set theme class before rendering begins
      (function() {
        try {
          const savedTheme = localStorage.getItem('theme');
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          // Default to dark theme if saved or system preference
          if (savedTheme === 'dark-theme' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark-theme');
          } else {
            document.documentElement.classList.add('light-theme');
          }
        } catch (e) {
          console.error('Theme initialization error:', e);
          document.documentElement.classList.add('light-theme');
        }
      })();
    </script>
    <link rel="stylesheet" href="css/libraries/tailwind.css">
    <link rel="stylesheet" href="css/libraries/font-awesome/all.css">
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/misc.css">
    <link rel="stylesheet" href="css/devsonly.css">
    <link rel="stylesheet" href="css/modules/header.css">
    <link rel="stylesheet" href="css/modules/footer.css">
    <link rel="stylesheet" href="css/modules/sidebar.css">
    <link rel="stylesheet" href="css/modules/cta.css">
    <link rel="stylesheet" href="css/modules/no-scrollbar.css">
    <link rel="stylesheet" href="css/modules/search.css">
    <link rel="stylesheet" href="css/modules/global-hero.css">
    <link rel="stylesheet" href="css/modules/warning.css">
    <link rel="stylesheet" href="css/modules/banner.css">
    <!-- Favicon for all browsers -->
    <link rel="icon" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/favicons/favicon.ico" type="image/x-icon">
    <!-- Apple Touch Icons (for iOS home screen bookmarks) -->
    <link rel="apple-touch-icon" sizes="57x57" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/apple/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/apple/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/apple/apple-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/apple/apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/apple/apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/apple/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/apple/apple-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/apple/apple-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/apple/apple-icon-180x180.png">
    <!-- Favicons for different devices -->
    <link rel="icon" type="image/png" sizes="192x192" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/android/android-icon-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/favicons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/favicons/favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/favicons/favicon-16x16.png">
    <!-- Web Manifest -->
    <link rel="manifest" href="site-data/site.manifest">
    <!-- Windows-specific tiles (for pinned sites in Windows Start menu) -->
    <meta name="msapplication-TileColor" content="#141312">
    <meta name="msapplication-TileImage" content="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/microsoft/ms-icon-144x144.png">
    <!-- Defines the color of the browser UI elements -->
    <meta name="theme-color" content="#141312">
    <!-- Open Graph Meta Tags (for social media sharing, mainly Facebook) -->
    <meta property="og:title" content="PCWStats - Devs Only">
    <meta property="og:description" content="Your one-stop solution for comprehensive statistics insights and guides for Project CW">
    <meta property="og:image" content="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/social-share/PCWStats.png">
    <meta property="og:url" content="https://pcwstats.github.io/devsonly.html">
    <meta property="og:type" content="website">
    <!-- Twitter Card Meta Tags (for better sharing on Twitter) -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="PCWStats - Devs Only">
    <meta name="twitter:description" content="Your one-stop solution for comprehensive statistics insights and guides for Project CW">
    <meta name="twitter:image" content="https://raw.githubusercontent.com/PCWStats/Website-Images/refs/heads/main/social-share/PCWStats.png">
  </head>
  <body>
    <!-- Sidebar Overlay -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="flex items-center justify-between">
          <button id="closeSidebar" class="sidebar-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <nav class="flex-grow">
        <ul class="space-y-2">
          <li>
            <a href="index.html" class="sidebar-link active">
              <i class="fas fa-wrench"></i>
              <span>Why Are You Here?</span>
            </a>
          </li>
          <li>
            <a href="tanks.html" class="sidebar-link">
              <i class="fas fa-shield-alt"></i>
              <span>Tank Statistics</span>
            </a>
          </li>
          <li>
            <a href="players.html" class="sidebar-link wip">
              <i class="fas fa-user"></i>
              <span>Player Statistics</span>
            </a>
          </li>
          <li>
            <a href="maps.html" class="sidebar-link">
              <i class="fas fa-map"></i>
              <span>Map Knowledge</span>
            </a>
          </li>
          <li>
            <a href="guides.html" class="sidebar-link">
              <i class="fas fa-book-open"></i>
              <span>Community Guides</span>
            </a>
          </li>
          <li>
            <a href="strategy-planner.html" class="sidebar-link wip">
              <i class="fas fa-chess"></i>
              <span>Strategy Planner</span>
            </a>
          </li>
          <li>
            <a href="builds.html" class="sidebar-link wip">
              <i class="fas fa-wrench"></i>
              <span>Common Builds</span>
            </a>
          </li>
          <li>
            <a href="news.html" class="sidebar-link">
              <i class="fas fa-newspaper"></i>
              <span>Game News</span>
            </a>
          </li>
          <li>
            <a href="tankopedia.html" class="sidebar-link">
              <i class="fas fa-database"></i>
              <span>Tankopedia</span>
            </a>
          </li>
          <li>
            <a href="bug-hunting.html" class="sidebar-link">
              <i class="fas fa-bug"></i>
              <span>Bug Hunting</span>
            </a>
          </li>
          <li>
            <a href="tournaments.html" class="sidebar-link">
              <i class="fas fa-trophy"></i>
              <span>Tournaments</span>
            </a>
          </li>
          <li>
            <a href="blog.html" class="sidebar-link">
              <i class="fas fa-blog"></i>
              <span>Official Blog</span>
            </a>
          </li>
          <li>
            <a href="legal.html" class="sidebar-link">
              <i class="fas fa-balance-scale"></i>
              <span>Project Policies</span>
            </a>
          </li>
          <li>
            <a href="about-us.html" class="sidebar-link">
              <i class="fas fa-info-circle"></i>
              <span>About the Project</span>
            </a>
          </li>
          <li>
            <a href="credits.html" class="sidebar-link">
              <i class="fas fa-users"></i>
              <span>Community Credits</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Header/Navbar -->
      <header class="navbar">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-center py-3">
            <div class="flex items-center space-x-4">
              <button id="openSidebar" class="hamburger-menu">
                <span></span>
                <span></span>
                <span></span>
              </button>
              <a href="index.html" class="brand-logo">
                <i class="fas fa-tank text-accent-color"></i>
                <span>PCWStats</span>
                <span class="beta-tag">BETA</span>
              </a>
            </div>
            <div class="flex items-center space-x-6">
              <button id="openSearch" class="search-button">
                <i class="fas fa-search"></i>
              </button>
              <div class="theme-toggle-mobile" id="themeToggleMobile">
                <i class="fas fa-moon"></i>
              </div>
            </div>
          </div>
        </div>
      </header>
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1>Devs Only</h1>
          <p>Developer Page Tool</p>
        </div>
      </section>
      <!-- Development Progress Section -->
      <section class="section">
        <div class="container mx-auto px-4">
          <div class="dev-progress-section">
            <div class="progress-header">
              <h2 class="section-title">Development Progress</h2>
              <p>Track the progress of website development tasks and features</p>
            </div>
            <div id="progressContainer">
              <!-- Progress bar and tasks will be loaded here by JavaScript -->
            </div>
          </div>
        </div>
      </section>
      <!-- dev Grid Section -->
      <section id="main" class="section">
        <div class="container mx-auto px-4">
          <h2 class="section-title">All Pages</h2>
          <!-- dev Filters -->
          <div class="news-filters">
            <div class="filter-group">
              <span class="filter-label">Sort by:</span>
              <select id="sortFilter" class="filter-select">
                <option value="a-z">A to Z</option>
                <option value="z-a">Z to A</option>
              </select>
            </div>
            <div class="filter-group">
              <span class="filter-label">Posts per page:</span>
              <select id="postsPerPage" class="filter-select">
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          <!--Cards-->
          <div class="dev-grid text-center">"""

    # Add each HTML file as a card
    for file_path in html_files:
        # Make path relative to base directory
        rel_path = os.path.relpath(file_path, base_dir)
        # Convert to forward slashes for web compatibility
        rel_path = rel_path.replace('\\', '/')
        
        # Extract filename without extension
        filename = os.path.splitext(os.path.basename(rel_path))[0]
        
        # Add the card to the content with the correct class
        content += f"""
                <!-- Page Card {filename} -->
                <div class="dev-card">
                    <div class="dev-info">
                        <h3>{filename}</h3>
                        <a href="{rel_path}" class="btn-accent btn-dev">
                            <i class=""></i>Go to Page </a>
                    </div>
                </div>"""

    # Add the rest of the template
    content += """
          </div>
          <!-- Pagination -->
          <div class="pagination-container">
            <div class="pagination-controls"></div>
          </div>
        </div>
      </section>
      <!-- Web Tests Section -->
      <section class="section">
        <div class="container mx-auto px-4">
          <!-- The tests will be dynamically inserted here by JavaScript -->
          <div class="web-tests-container"></div>
        </div>
      </section>
      <!-- Special CTA Section -->
      <section class="special-cta-section">
        <div class="container mx-auto px-4">
          <!-- First part centered in one column -->
          <div class="text-center mb-10">
            <h2>Hey... You Found It</h2>
            <p class="text-lg mb-1 mt-1 max-w-2xl mx-auto">Usually, we'd just tell you to join our Discord. But this time, we have a more important question: <strong>Why are you here?</strong>
            </p>
            <p class="text-lg mb-1 mt-1 max-w-2xl mx-auto">Seriously. This page isn't linked anywhere. You had to <i>dig</i> for this. Are you one of us? </p>
          </div>
          <!-- Two columns in the same row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- First column -->
            <div class="text-center">
              <h2 class="mb-1">Go on then</h2>
              <p class="text-lg mb-1 mt-5">Since you're here, might as well make yourself useful. Fix a typo. Add a secret. Break something. We won't stop you.</p>
              <div class="flex justify-center mt-6">
                <a href="contact-us.html" class="special-cta-button">
                  <i class="fas fa-edit mr-2"></i> Improve This Page </a>
              </div>
            </div>
            <!-- Second column -->
            <div class="text-center">
              <h2 class="mb-1">Join the Others</h2>
              <p class="text-lg mb-1 mt-5">If you haven't already joined the Discord, now's probably the time. Just… don't mention you found this page. They'll know.</p>
              <div class="flex justify-center mt-6">
                <a href="https://discord.com/invite/2nHHHBWNDw" class="special-cta-button">
                  <i class="fab fa-discord mr-2"></i> Join Our Discord </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- Search Modal -->
      <div class="search-overlay" id="searchOverlay"></div>
      <div class="search-modal" id="searchModal">
        <div class="search-modal-content">
          <div class="search-input-container">
            <i class="fas fa-search search-modal-icon"></i>
            <input type="text" placeholder="Search tanks, maps, guides..." class="search-modal-input" autofocus>
          </div>
          <div class="search-suggestions">
            <p class="search-suggestions-title">Past Searches</p>
            <div class="past-searches-tags">
              <!-- Past searches will be dynamically inserted here -->
            </div>
            <div class="search-results-container">
              <div class="search-results-placeholder">
                <i class="fas fa-search"></i>
                <p>Your search results will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Footer -->
      <footer class="footer bg-gray-900 text-white py-10">
        <div class="container mx-auto px-10 space-y-10">
          <!-- Top Row -->
          <div class="footer-brand flex flex-col items-center text-center">
            <div>
              <h3 class="text-2xl font-semibold">PCWStats</h3>
              <p class="text-gray-400">Your go-to resource for Project CW statistics and gameplay information.</p>
            </div>
            <div class="flex space-x-4 text-xl">
              <a href="https://discord.com/invite/2nHHHBWNDw" class="social-icon">
                <i class="fab fa-discord"></i>
              </a>
              <a href="https://x.com/PCWStats" class="social-icon">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="https://github.com/PCWStats" class="social-icon">
                <i class="fab fa-github"></i>
              </a>
              <a href="https://www.youtube.com/@PCWStats" class="social-icon">
                <i class="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          <!-- Middle Row -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-10 text-center">
            <div>
              <h3 class="text-lg font-semibold mb-2">Tools</h3>
              <ul class="footer-links text-gray-400">
                <li>
                  <a href="maps.html">Map Knowledge</a>
                </li>
                <li>
                  <a href="tanks.html">Tank Statistics</a>
                </li>
                <li>
                  <a href="tankopedia.html">Tankopedia</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Community</h3>
              <ul class="footer-links text-gray-400">
                <li>
                  <a href="guides.html">Community Guides</a>
                </li>
                <li>
                  <a href="builds.html">Common Builds</a>
                </li>
                <li>
                  <a href="#">devs</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">PCWStats</h3>
              <ul class="footer-links text-gray-400">
                <li>
                  <a href="about-us.html">About the Project</a>
                </li>
                <li>
                  <a href="blog.html">Official Blog</a>
                </li>
                <li>
                  <a href="news.html">Game News</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Credits</h3>
              <ul class="footer-links text-gray-400">
                <li>
                  <a href="credits.html">Community Credits</a>
                </li>
                <li>
                  <a href="support-us.html">Support the Project</a>
                </li>
                <li>
                  <a href="contact-us.html">Contact Us</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Legal</h3>
              <ul class="footer-links text-gray-400">
                <li>
                  <a href="legal/terms-of-service.html">Terms of Service</a>
                </li>
                <li>
                  <a href="legal/project-license.html">Project License</a>
                </li>
                <li>
                  <a href="legal/privacy-policy.html">Privacy Policy</a>
                </li>
              </ul>
            </div>
          </div>
          <!-- Contact Row -->
          <div class="text-center">
            <h3 class="text-lg font-semibold mb-1">Contact</h3>
            <p class="text-gray-400 mb-2">Have suggestions, found a bug or want to help?</p>
            <a href="contact-us.html" class="btn-accent mt-4">
              <i class="fas fa-envelope mr-2"></i>Send Feedback </a>
            <a href="get-involved.html" class="btn-accent mt-4">
              <i class="fas fa-users mr-2"></i>Get Involved </a>
          </div>
          <!-- Bottom Disclaimer -->
          <div class="text-center text-sm text-gray-500 space-y-1 border-t border-gray-700 pt-1">
            <p> PCWStats is a community-made project and is not associated with, endorsed by, or affiliated with <a href="https://projectcw.dev" class="disclaimer-link">Project CW</a> or <a href="https://www.wargaming.net" class="disclaimer-link">Wargaming.net</a>.</p>
            <p>&copy; 2025 PCWStats by SINEWAVE Development. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    <script src="js/main.js"></script>
    <script src="js/misc.js"></script>
    <script src="js/modules/sidebar.js"></script>
    <script src="js/modules/theme-loader.js"></script>
    <script src="js/maps.js"></script>
    <script src="js/modules/search.js"></script>
    <script src="js/modules/warning.js"></script>
    <script src="js/devsonly.js"></script>
    <script src="js/modules/global-hero.js"></script>
    <script src="js/modules/banner.js"></script>
  </body>
</html>"""

    return content

def main():
    """Main function to execute the script"""
    print("PCWStats Devs Only HTML File Generator")
    print("---------------------------\n")
    
    # Get current directory as base directory
    base_dir = os.getcwd()
    
    # Get input directory (default to current directory)
    input_dir = input(f"Enter the directory to search for HTML files [{base_dir}]: ").strip()
    if not input_dir:
        input_dir = base_dir
    
    while not os.path.isdir(input_dir):
        print(f"Error: '{input_dir}' is not a valid directory")
        input_dir = input(f"Enter the directory to search for HTML files [{base_dir}]: ").strip()
        if not input_dir:
            input_dir = base_dir
    
    # Find HTML files
    print("\nSearching for HTML files...")
    html_files = find_html_files(input_dir)
    print(f"Found {len(html_files)} HTML files")
    
    # Get output directory (default to current directory)
    output_dir = input(f"\nEnter the output directory for devsonly.html [{base_dir}]: ").strip()
    if not output_dir:
        output_dir = base_dir
    
    while not os.path.isdir(output_dir):
        print(f"Error: '{output_dir}' is not a valid directory")
        output_dir = input(f"Enter the output directory for devsonly.html [{base_dir}]: ").strip()
        if not output_dir:
            output_dir = base_dir
    
    # Generate and save the HTML file
    output_path = os.path.join(output_dir, 'devsonly.html')
    html_content = generate_html_content(html_files, base_dir)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\nSuccessfully generated {output_path}")

if __name__ == "__main__":
    main()