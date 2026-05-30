# Show dashboard
watchtower dashboard

# List all programs
watchtower programs all

# Show program details
watchtower programs show --name asda

# Get subdomains by domain
watchtower subdomains domain --domain example.com

# Get subdomains by program
watchtower subdomains program --name asda --page 1 --per-page 50

# Get all subdomains
watchtower subdomains all --page 1 --per-page 100

# Get live subdomains
watchtower live all
watchtower live fresh
watchtower live subdomain --name www.example.com
watchtower live provider --provider subfinder

# Get HTTP services
watchtower http all
watchtower http fresh

# Export data
watchtower export subdomains --output subdomains.txt --format txt
watchtower export programs --output programs.json

# Show statistics
watchtower stats

# Real-time monitoring
watchtower watch --interval 10

# Check API health
watchtower health
