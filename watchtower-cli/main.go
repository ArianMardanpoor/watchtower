package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"text/tabwriter"
	"time"
)

// رنگ‌های ANSI برای زیباسازی ترمینال
const (
	ColorReset  = "\033[0m"
	ColorRed    = "\033[1;31m"
	ColorGreen  = "\033[1;32m"
	ColorYellow = "\033[1;33m"
	ColorBlue   = "\033[1;34m"
	ColorCyan   = "\033[1;36m"
	ColorWhite  = "\033[1;37m"
)

var (
	apiBaseURL string
	apiToken   string
)

func init() {
	// خواندن تنظیمات از متغیرهای محیطی با Fallback پیش‌فرض
	apiBaseURL = os.Getenv("WATCHTOWER_API_URL")
	if apiBaseURL == "" {
		apiBaseURL = "http://127.0.0.1:3131/api"
	}

	apiToken = "a21uc0lzeTcK"
	
}

// Structهای مورد نیاز برای پارس کردن دیتای Flask API
type SubdomainResponse struct {
	Total   int      `json:"total"`
	Page    int      `json:"page"`
	PerPage int      `json:"per_page"`
	Data    []string `json:"data"`
}

type Program struct {
	Scopes      []string          `json:"scopes"`
	Outofscopes []string          `json:"outofscopes"`
	Config      map[string]string `json:"config"`
	CreatedDate string            `json:"created_date"`
}
type ProgramResponse map[string]Program

type LiveResponse struct {
	Total   int      `json:"total"`
	Page    int      `json:"page"`
	PerPage int      `json:"per_page"`
	Data    []string `json:"data"`
}

type HTTPResponse struct {
	Total   int      `json:"total"`
	Page    int      `json:"page"`
	PerPage int      `json:"per_page"`
	Data    []string `json:"data"`
}

// تابع کمکی برای برقراری ارتباط امن و تمیز با API
func makeRequest(endpoint string, result interface{}) error {
	client := &http.Client{Timeout: 15 * time.Second}
	req, err := http.NewRequest("GET", apiBaseURL+endpoint, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("X-API-Token", apiToken)

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("server connection failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API error (Status %d): %s", resp.StatusCode, string(body))
	}

	return json.NewDecoder(resp.Body).Decode(result)
}

func printUsage() {
	fmt.Printf("%s🔭 Watchtower CLI - Recon Automation System%s\n", ColorCyan, ColorReset)
	fmt.Println("Usage: watchtower <command> [subcommand] [flags]")
	fmt.Println("\nAvailable Commands:")
	fmt.Println("  health                       Check API server health status")
	fmt.Println("  stats                        Show global database statistics")
	fmt.Println("  dashboard                    Display active monitor dashboard")
	fmt.Println("  programs all                 List all registered bug bounty programs")
	fmt.Println("  programs show --name <p>     Show detailed specs for a specific program")
	fmt.Println("  subdomains all               List all collected subdomains")
	fmt.Println("  subdomains domain --domain <d>  List subdomains belonging to a specific root domain")
	fmt.Println("  live all|fresh               List alive assets / new alive assets")
	fmt.Println("  http all|fresh               List HTTP probed assets / new web services")
	fmt.Println("  watch --interval <sec>       Real-time monitoring console")
	fmt.Println("  export subdomains|programs   Export data to files")
}

func main() {
	if len(os.Args) < 2 {
		printUsage()
		return
	}

	command := os.Args[1]

	switch command {
	case "health":
		checkHealth()
	case "stats":
		showStats()
	case "dashboard":
		showDashboard()
	case "programs":
		handlePrograms()
	case "subdomains":
		handleSubdomains()
	case "live":
		handleLive()
	case "http":
		handleHTTP()
	case "watch":
		handleWatch()
	case "export":
		handleExport()
	default:
		fmt.Printf("%s[!] Unknown command: %s%s\n", ColorRed, command, ColorReset)
		printUsage()
	}
}

func checkHealth() {
	var res map[string]interface{}
	err := makeRequest("/health", &res)
	if err != nil {
		fmt.Printf("%s[-] Status: OFFLINE (%v)%s\n", ColorRed, err, ColorReset)
		return
	}
	fmt.Printf("%s[+] Status: ONLINE | Timestamp: %v%s\n", ColorGreen, res["timestamp"], ColorReset)
}

func showStats() {
	var programs ProgramResponse
	_ = makeRequest("/programs/all", &programs)

	var subdomains SubdomainResponse
	_ = makeRequest("/subdomains/all?page=1&per_page=1", &subdomains)

	var live LiveResponse
	_ = makeRequest("/lives/all?page=1&per_page=1", &live)

	fmt.Println("\n" + ColorCyan + "╔══════════════════════════════════════════════════════════════╗" + ColorReset)
	fmt.Println(ColorCyan + "║                    📊 WATCHTOWER STATS                        ║" + ColorReset)
	fmt.Println(ColorCyan + "╚══════════════════════════════════════════════════════════════╝" + ColorReset)
	fmt.Printf("  %-18s : %s%d%s\n", "📦 Total Programs", ColorWhite, len(programs), ColorReset)
	fmt.Printf("  %-18s : %s%d%s\n", "🔍 Total Subdomains", ColorYellow, subdomains.Total, ColorReset)
	fmt.Printf("  %-18s : %s%d%s\n", "✅ Live Subdomains", ColorGreen, live.Total, ColorReset)
	fmt.Println(ColorCyan + "────────────────────────────────────────────────────────────────" + ColorReset)
}

func handlePrograms() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: watchtower programs [all|show]")
		return
	}
	subCmd := os.Args[2]

	switch subCmd {
	case "all":
		var programs ProgramResponse
		if err := makeRequest("/programs/all", &programs); err != nil {
			fmt.Printf("%sError: %v%s\n", ColorRed, err, ColorReset)
			return
		}
		w := tabwriter.NewWriter(os.Stdout, 0, 0, 3, ' ', 0)
		fmt.Fprintln(w, "PROGRAM NAME\tSCOPES COUNT\tCREATED DATE")
		for name, p := range programs {
			fmt.Fprintf(w, "%s%s%s\t%d\t%s\n", ColorGreen, name, ColorReset, len(p.Scopes), p.CreatedDate)
		}
		w.Flush()

	case "show":
		showCmd := flag.NewFlagSet("programs show", flag.ExitOnError)
		progName := showCmd.String("name", "", "Name of the program")
		_ = showCmd.Parse(os.Args[3:])

		if *progName == "" {
			fmt.Println("Error: --name flag is required")
			return
		}
		// در لایه Flask پیاده‌سازی متناسب با این روت یا دریافت کل پکیج انجام می‌شود
		var programs ProgramResponse
		_ = makeRequest("/programs/all", &programs)
		prog, exists := programs[*progName]
		if !exists {
			fmt.Printf("%s[-] Program '%s' not found.%s\n", ColorRed, *progName, ColorReset)
			return
		}
		fmt.Printf("\n%s📋 Program: %s%s\n", ColorCyan, *progName, ColorReset)
		fmt.Println("In-Scope Domains:")
		for _, s := range prog.Scopes {
			fmt.Printf("  └── %s\n", s)
		}
	}
}

func handleSubdomains() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: watchtower subdomains [all|domain|program]")
		return
	}
	subCmd := os.Args[2]

	switch subCmd {
	case "all":
		var res SubdomainResponse
		if err := makeRequest("/subdomains/all?page=1&per_page=50", &res); err != nil {
			fmt.Println(err)
			return
		}
		fmt.Printf("Total Subdomains: %d (Showing top 50)\n", res.Total)
		for _, sd := range res.Data {
			fmt.Println(sd)
		}

	case "domain":
		domCmd := flag.NewFlagSet("subdomains domain", flag.ExitOnError)
		domain := domCmd.String("domain", "", "Root domain filter")
		_ = domCmd.Parse(os.Args[3:])

		if *domain == "" {
			fmt.Println("Error: --domain flag is required")
			return
		}
		var res SubdomainResponse
		endpoint := fmt.Sprintf("/subdomains/%s", *domain)
		if err := makeRequest(endpoint, &res); err != nil {
			fmt.Println(err)
			return
		}
		fmt.Printf("\n%s✨ Subdomains for %s (%d found):%s\n", ColorGreen, *domain, res.Total, ColorReset)
		for _, sd := range res.Data {
			fmt.Println("  " + sd)
		}
	}
}

func handleLive() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: watchtower live [all|fresh]")
		return
	}
	subCmd := os.Args[2]
	var res LiveResponse

	endpoint := "/lives/all"
	if subCmd == "fresh" {
		endpoint = "/live/fresh"
	}

	if err := makeRequest(endpoint, &res); err != nil {
		fmt.Printf("%sError: %v%s\n", ColorRed, err, ColorReset)
		return
	}

	fmt.Printf("\n%s✅ Alive Assets [%s] (Total: %d):%s\n", ColorGreen, strings.ToUpper(subCmd), res.Total, ColorReset)
	for _, host := range res.Data {
		fmt.Printf("  %s\n", host)
	}
}

func handleHTTP() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: watchtower http [all|fresh]")
		return
	}
	subCmd := os.Args[2]
	var res HTTPResponse

	endpoint := "/http/all"
	if subCmd == "fresh" {
		endpoint = "/http/fresh"
	}

	if err := makeRequest(endpoint, &res); err != nil {
		fmt.Printf("%sError: %v%s\n", ColorRed, err, ColorReset)
		return
	}

	fmt.Printf("\n%s🌐 Web Services [%s] (Total: %d):%s\n", ColorCyan, strings.ToUpper(subCmd), res.Total, ColorReset)
	for _, url := range res.Data {
		fmt.Printf("  %s\n", url)
	}
}

func handleWatch() {
	watchCmd := flag.NewFlagSet("watch", flag.ExitOnError)
	interval := watchCmd.Int("interval", 10, "Interval in seconds")
	_ = watchCmd.Parse(os.Args[2:])

	fmt.Printf("%s[*] Starting real-time monitor (Interval: %ds)...%s\n", ColorYellow, *interval, ColorReset)
	for {
		// پاک کردن ترمینال برای افکت داشبورد زنده
		fmt.Print("\033[H\033[2J")
		fmt.Printf("Watchtower Live Monitor Engine | %s\n", time.Now().Format(time.RFC1123))
		showStats()
		time.Sleep(time.Duration(*interval) * time.Second)
	}
}

func showDashboard() {
	fmt.Println(ColorCyan + "--- WATCHTOWER DASHBOARD CONSOLE ---" + ColorReset)
	showStats()
}

func handleExport() {
	if len(os.Args) < 4 {
		fmt.Println("Usage: watchtower export [subdomains|programs] --output <file>")
		return
	}
	target := os.Args[2]
	exportCmd := flag.NewFlagSet("export", flag.ExitOnError)
	output := exportCmd.String("output", "", "Output filepath")
	_ = exportCmd.Parse(os.Args[3:])

	if *output == "" {
		fmt.Println("Error: --output flag is required")
		return
	}

	if target == "subdomains" {
		var res SubdomainResponse
		_ = makeRequest("/subdomains/all?page=1&per_page=10000", &res)
		data := strings.Join(res.Data, "\n")
		_ = os.WriteFile(*output, []byte(data), 0644)
		fmt.Printf("%s[+] Successfully exported %d subdomains to %s%s\n", ColorGreen, len(res.Data), *output, ColorReset)
	}
}