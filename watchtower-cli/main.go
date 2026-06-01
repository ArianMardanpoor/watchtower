package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"text/tabwriter"
	"time"
)

// ─── ANSI Colors & Styles ────────────────────────────────────────────────────

const (
	Reset     = "\033[0m"
	Bold      = "\033[1m"
	Dim       = "\033[2m"
	Italic    = "\033[3m"
	Underline = "\033[4m"
	Blink     = "\033[5m"

	Red     = "\033[1;31m"
	Green   = "\033[1;32m"
	Yellow  = "\033[1;33m"
	Blue    = "\033[1;34m"
	Magenta = "\033[1;35m"
	Cyan    = "\033[1;36m"
	White   = "\033[1;37m"

	DimRed    = "\033[2;31m"
	DimGreen  = "\033[2;32m"
	DimYellow = "\033[2;33m"
	DimCyan   = "\033[2;36m"
	DimWhite  = "\033[2;37m"

	BgRed   = "\033[41m"
	BgGreen = "\033[42m"
	BgBlue  = "\033[44m"
	BgCyan  = "\033[46m"
)

// ─── Config ──────────────────────────────────────────────────────────────────

var (
	apiBaseURL string
	apiToken   string
	verbose    bool
	noColor    bool
	outputFile string
)

func init() {
	apiBaseURL = os.Getenv("WATCHTOWER_API_URL")
	if apiBaseURL == "" {
		apiBaseURL = "http://127.0.0.1:3131/api"
	}

	apiToken = os.Getenv("WATCHTOWER_API_TOKEN")
	if apiToken == "" {
		apiToken = "a21uc0lzeTcK"
	}
}

func c(color, text string) string {
	if noColor {
		return text
	}
	return color + text + Reset
}

// ─── Data Structures ─────────────────────────────────────────────────────────

type GenericResponse struct {
	Total   int      `json:"total"`
	Page    int      `json:"page"`
	PerPage int      `json:"per_page"`
	Data    []string `json:"data"`
}

type SubdomainResponse GenericResponse
type LiveResponse GenericResponse
type HTTPResponse GenericResponse

type Program struct {
	Scopes      []string          `json:"scopes"`
	Outofscopes []string          `json:"outofscopes"`
	Config      map[string]string `json:"config"`
	CreatedDate string            `json:"created_date"`
}
type ProgramResponse map[string]Program

// ─── HTTP Client ─────────────────────────────────────────────────────────────

func makeRequest(endpoint string, result interface{}) error {
	client := &http.Client{Timeout: 20 * time.Second}
	url := apiBaseURL + endpoint

	if verbose {
		fmt.Printf("%s→ GET %s%s\n", DimCyan, url, Reset)
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return fmt.Errorf("failed to build request: %w", err)
	}
	req.Header.Set("X-API-Token", apiToken)
	req.Header.Set("User-Agent", "Watchtower-CLI/2.0")

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("connection failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 401 {
		return fmt.Errorf("unauthorized — check your API token (WATCHTOWER_API_TOKEN)")
	}
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API error [%d]: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	return json.NewDecoder(resp.Body).Decode(result)
}

// fetchAllPagesGeneric fetches all pages for any paginated endpoint and returns all items.
func fetchAllPagesGeneric(endpoint string) ([]string, int, error) {
	var all []string
	page := 1
	perPage := 200
	total := 0

	for {
		sep := "?"
		if strings.Contains(endpoint, "?") {
			sep = "&"
		}
		fullEndpoint := fmt.Sprintf("%s%spage=%d&per_page=%d", endpoint, sep, page, perPage)

		var res GenericResponse
		if err := makeRequest(fullEndpoint, &res); err != nil {
			return nil, 0, err
		}

		total = res.Total
		all = append(all, res.Data...)

		if len(all) >= total || len(res.Data) == 0 {
			break
		}
		page++
	}

	return all, total, nil
}

// ─── Banner ───────────────────────────────────────────────────────────────────

func printBanner() {
	if noColor {
		fmt.Println("=== WATCHTOWER CLI v2.0 ===")
		return
	}
	fmt.Println()
	fmt.Println(Cyan + `  ██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗████████╗ ██████╗ ██╗    ██╗███████╗██████╗ ` + Reset)
	fmt.Println(Cyan + `  ██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║╚══██╔══╝██╔═══██╗██║    ██║██╔════╝██╔══██╗` + Reset)
	fmt.Println(Cyan + `  ██║ █╗ ██║███████║   ██║   ██║     ███████║   ██║   ██║   ██║██║ █╗ ██║█████╗  ██████╔╝` + Reset)
	fmt.Println(Yellow + `  ██║███╗██║██╔══██║   ██║   ██║     ██╔══██║   ██║   ██║   ██║██║███╗██║██╔══╝  ██╔══██╗` + Reset)
	fmt.Println(Red + `  ╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║   ██║   ╚██████╔╝╚███╔███╔╝███████╗██║  ██║` + Reset)
	fmt.Println(DimRed + `   ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝  ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝` + Reset)
	fmt.Printf("  %s Recon Automation & Asset Intelligence Platform  %s  v2.0\n", DimWhite, Reset)
	fmt.Println()
}

// ─── Usage ────────────────────────────────────────────────────────────────────

func printUsage() {
	printBanner()
	fmt.Println(c(Bold+White, "USAGE:"))
	fmt.Printf("  watchtower %s [global flags]\n\n", c(Cyan, "<command>"))

	fmt.Println(c(Bold+White, "GLOBAL FLAGS:"))
	fmt.Printf("  %-26s %s\n", c(Yellow, "--verbose"), "Show HTTP request details")
	fmt.Printf("  %-26s %s\n", c(Yellow, "--no-color"), "Disable terminal colors")
	fmt.Printf("  %-26s %s\n\n", c(Yellow, "--output <file>"), "Write output to a file")

	fmt.Println(c(Bold+White, "COMMANDS:"))
	cmds := [][]string{
		{"health", "", "Check API server health & latency"},
		{"stats", "", "Global database statistics overview"},
		{"dashboard", "", "Live summary dashboard"},
		{"programs", "all", "List all bug bounty programs"},
		{"programs", "show --name <p>", "Detailed view of a specific program"},
		{"subdomains", "all [--page N] [--limit N]", "List all discovered subdomains"},
		{"subdomains", "domain --domain <d>", "Subdomains for a specific root domain"},
		{"subdomains", "search --query <q>", "Search/grep subdomains by keyword"},
		{"subdomains", "count", "Count total subdomains only"},
		{"live", "all", "List all alive assets"},
		{"live", "fresh", "Alive assets discovered in last 12h"},
		{"http", "all", "All HTTP/HTTPS probed services"},
		{"http", "fresh", "New web services discovered in last 12h"},
		{"watch", "--interval <sec>", "Real-time monitoring console"},
		{"export", "subdomains|programs --output <f>", "Export data to a file"},
		{"interactive", "", "Interactive menu mode"},
	}

	w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
	for _, cmd := range cmds {
		fmt.Fprintf(w, "  %s %s\t%s%s%s\n",
			c(Green, cmd[0]),
			c(DimCyan, cmd[1]),
			DimWhite, cmd[2], Reset)
	}
	w.Flush()
	fmt.Println()

	fmt.Println(c(DimWhite, "ENVIRONMENT:"))
	fmt.Printf("  %-30s %s\n", c(DimYellow, "WATCHTOWER_API_URL"), "API base URL (default: http://127.0.0.1:3131/api)")
	fmt.Printf("  %-30s %s\n\n", c(DimYellow, "WATCHTOWER_API_TOKEN"), "Authentication token")
}

// ─── Main ─────────────────────────────────────────────────────────────────────

func main() {
	args := os.Args[1:]
	filtered := args[:0]
	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--verbose", "-v":
			verbose = true
		case "--no-color":
			noColor = true
		default:
			if strings.HasPrefix(args[i], "--output") {
				if args[i] == "--output" && i+1 < len(args) {
					outputFile = args[i+1]
					i++
				} else if strings.HasPrefix(args[i], "--output=") {
					outputFile = strings.TrimPrefix(args[i], "--output=")
				} else {
					filtered = append(filtered, args[i])
				}
			} else {
				filtered = append(filtered, args[i])
			}
		}
	}

	if len(filtered) == 0 {
		printUsage()
		return
	}

	command := filtered[0]
	os.Args = append([]string{os.Args[0]}, filtered...)

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
	case "interactive", "i":
		interactiveMode()
	case "help", "--help", "-h":
		printUsage()
	default:
		fmt.Printf("%s[!] Unknown command: %s%s\n\n", Red, command, Reset)
		printUsage()
		os.Exit(1)
	}
}

// ─── Output Writer ────────────────────────────────────────────────────────────

var writer io.Writer = os.Stdout

func setupOutput() func() {
	if outputFile == "" {
		writer = os.Stdout
		return func() {}
	}
	f, err := os.Create(outputFile)
	if err != nil {
		fmt.Printf("%s[!] Cannot create output file: %v%s\n", Red, err, Reset)
		os.Exit(1)
	}
	writer = io.MultiWriter(os.Stdout, f)
	fmt.Printf("%s[+] Also writing to: %s%s\n\n", DimGreen, outputFile, Reset)
	return func() {
		f.Close()
		fmt.Printf("\n%s[✓] Saved to %s%s\n", Green, outputFile, Reset)
	}
}

// ─── Health ───────────────────────────────────────────────────────────────────

func checkHealth() {
	fmt.Printf("%s[~] Pinging %s ...%s\n", DimCyan, apiBaseURL, Reset)
	start := time.Now()

	var res map[string]interface{}
	err := makeRequest("/health", &res)
	latency := time.Since(start)

	if err != nil {
		fmt.Printf("%s[✗] OFFLINE%s — %v\n", Red, Reset, err)
		fmt.Printf("    %sAPI URL:%s %s\n", DimWhite, Reset, apiBaseURL)
		os.Exit(1)
		return
	}

	latencyColor := Green
	if latency > 500*time.Millisecond {
		latencyColor = Yellow
	}
	if latency > 2*time.Second {
		latencyColor = Red
	}

	fmt.Printf("%s[✓] ONLINE%s\n", Green, Reset)
	fmt.Printf("    %sTimestamp:%s %v\n", DimWhite, Reset, res["timestamp"])
	fmt.Printf("    %sLatency:  %s %s%v%s\n", DimWhite, Reset, latencyColor, latency.Round(time.Millisecond), Reset)
	fmt.Printf("    %sEndpoint: %s %s\n", DimWhite, Reset, apiBaseURL)
}

// ─── Stats ────────────────────────────────────────────────────────────────────

func showStats() {
	type stat struct {
		label string
		value string
		color string
	}
	stats := []stat{}

	var programs ProgramResponse
	if err := makeRequest("/programs/all", &programs); err == nil {
		stats = append(stats, stat{"Programs", strconv.Itoa(len(programs)), Magenta})
	}

	var subdomains SubdomainResponse
	if err := makeRequest("/subdomains/all?page=1&per_page=1", &subdomains); err == nil {
		stats = append(stats, stat{"Subdomains", fmt.Sprintf("%d", subdomains.Total), Yellow})
	}

	var live LiveResponse
	if err := makeRequest("/lives/all?page=1&per_page=1", &live); err == nil {
		stats = append(stats, stat{"Live Assets", fmt.Sprintf("%d", live.Total), Green})
	}

	var http HTTPResponse
	if err := makeRequest("/http/all?page=1&per_page=1", &http); err == nil {
		stats = append(stats, stat{"Web Services", fmt.Sprintf("%d", http.Total), Cyan})
	}

	var freshLive LiveResponse
	if err := makeRequest("/live/fresh?page=1&per_page=1", &freshLive); err == nil {
		stats = append(stats, stat{"New Live (12h)", fmt.Sprintf("%d", freshLive.Total), Blue})
	}

	var freshHTTP HTTPResponse
	if err := makeRequest("/http/fresh?page=1&per_page=1", &freshHTTP); err == nil {
		stats = append(stats, stat{"New HTTP (12h)", fmt.Sprintf("%d", freshHTTP.Total), Blue})
	}

	fmt.Println()
	fmt.Println(c(Cyan, "  ┌──────────────────────────────────────────┐"))
	fmt.Println(c(Cyan, "  │") + c(Bold+White, "        📡  WATCHTOWER STATS               ") + c(Cyan, "│"))
	fmt.Println(c(Cyan, "  ├──────────────────────────────────────────┤"))
	for _, s := range stats {
		label := fmt.Sprintf("%-22s", s.label)
		fmt.Printf(c(Cyan, "  │")+"  %s  %s%-10s%s  "+c(Cyan, "│")+"\n",
			c(DimWhite, label), s.color, s.value, Reset)
	}
	fmt.Printf(c(Cyan, "  │")+"  %s  %s%-10s%s  "+c(Cyan, "│")+"\n",
		c(DimWhite, fmt.Sprintf("%-22s", "Updated at")),
		DimWhite,
		time.Now().Format("15:04:05"),
		Reset)
	fmt.Println(c(Cyan, "  └──────────────────────────────────────────┘"))
	fmt.Println()
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

func showDashboard() {
	printBanner()
	showStats()
}

// ─── Programs ─────────────────────────────────────────────────────────────────

func handlePrograms() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: watchtower programs [all|show]")
		return
	}
	defer setupOutput()()

	switch os.Args[2] {
	case "all":
		var programs ProgramResponse
		if err := makeRequest("/programs/all", &programs); err != nil {
			fmt.Printf("%s[✗] %v%s\n", Red, err, Reset)
			return
		}

		names := make([]string, 0, len(programs))
		for name := range programs {
			names = append(names, name)
		}
		sort.Strings(names)

		fmt.Printf("\n%s Programs: %d total%s\n\n", c(Bold+White, ""), len(programs), Reset)
		w := tabwriter.NewWriter(writer, 0, 0, 3, ' ', 0)
		fmt.Fprintln(w, c(Bold+Underline+White, "PROGRAM")+"\t"+
			c(Bold+Underline+White, "SCOPES")+"\t"+
			c(Bold+Underline+White, "OUT OF SCOPE")+"\t"+
			c(Bold+Underline+White, "CREATED"))

		for _, name := range names {
			p := programs[name]
			fmt.Fprintf(w, "%s\t%s\t%s\t%s\n",
				c(Green, name),
				c(Yellow, strconv.Itoa(len(p.Scopes))),
				c(DimRed, strconv.Itoa(len(p.Outofscopes))),
				c(DimWhite, p.CreatedDate))
		}
		w.Flush()

	case "show":
		showCmd := flag.NewFlagSet("programs show", flag.ExitOnError)
		progName := showCmd.String("name", "", "Program name")
		_ = showCmd.Parse(os.Args[3:])

		if *progName == "" {
			fmt.Println(c(Red, "[!] --name flag required"))
			return
		}

		var programs ProgramResponse
		if err := makeRequest("/programs/all", &programs); err != nil {
			fmt.Printf("%s[✗] %v%s\n", Red, err, Reset)
			return
		}

		prog, exists := programs[*progName]
		if !exists {
			fmt.Printf("%s[✗] Program '%s' not found.%s\n", Red, *progName, Reset)
			fmt.Println(c(DimWhite, "\nDid you mean one of these?"))
			for name := range programs {
				if strings.Contains(strings.ToLower(name), strings.ToLower(*progName)) {
					fmt.Printf("  → %s\n", c(Cyan, name))
				}
			}
			return
		}

		fmt.Printf("\n%s📋 %s%s\n", Bold+White, *progName, Reset)
		fmt.Println(c(Cyan, strings.Repeat("─", 50)))

		fmt.Printf("\n%s In-Scope (%d):%s\n", Green, len(prog.Scopes), Reset)
		for _, s := range prog.Scopes {
			fmt.Printf("  %s %s\n", c(DimGreen, "▸"), s)
		}

		if len(prog.Outofscopes) > 0 {
			fmt.Printf("\n%s Out-of-Scope (%d):%s\n", Red, len(prog.Outofscopes), Reset)
			for _, s := range prog.Outofscopes {
				fmt.Printf("  %s %s\n", c(DimRed, "✗"), c(DimWhite, s))
			}
		}

		if len(prog.Config) > 0 {
			fmt.Printf("\n%s Config:%s\n", Yellow, Reset)
			for k, v := range prog.Config {
				fmt.Printf("  %-20s %s\n", c(DimYellow, k+":"), v)
			}
		}

		fmt.Printf("\n  %s Created: %s%s\n\n", DimWhite, prog.CreatedDate, Reset)
	}
}

// ─── Subdomains ───────────────────────────────────────────────────────────────

func handleSubdomains() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: watchtower subdomains [all|domain|search|count]")
		return
	}

	subCmd := os.Args[2]
	defer setupOutput()()

	switch subCmd {
	case "all":
		allCmd := flag.NewFlagSet("subdomains all", flag.ExitOnError)
		page := allCmd.Int("page", 0, "Page number (0 = all pages)")
		limit := allCmd.Int("limit", 50, "Results per page")
		_ = allCmd.Parse(os.Args[3:])

		if *page == 0 {
			spinner("Fetching all subdomains")
			items, total, err := fetchAllPagesGeneric("/subdomains/all")
			clearLine()
			if err != nil {
				fmt.Printf("%s[✗] %v%s\n", Red, err, Reset)
				return
			}
			fmt.Printf("%s[✓] Total: %d subdomains%s\n\n", Green, total, Reset)
			for _, sd := range items {
				fmt.Fprintln(writer, sd)
			}
		} else {
			endpoint := fmt.Sprintf("/subdomains/all?page=%d&per_page=%d", *page, *limit)
			var res SubdomainResponse
			if err := makeRequest(endpoint, &res); err != nil {
				fmt.Printf("%s[✗] %v%s\n", Red, err, Reset)
				return
			}
			fmt.Printf("%s[✓] Page %d | Showing %d of %d%s\n\n", Green, *page, len(res.Data), res.Total, Reset)
			for _, sd := range res.Data {
				fmt.Fprintln(writer, sd)
			}
		}

	case "domain":
		domCmd := flag.NewFlagSet("subdomains domain", flag.ExitOnError)
		domain := domCmd.String("domain", "", "Root domain to filter by")
		all := domCmd.Bool("all", false, "Fetch all pages")
		_ = domCmd.Parse(os.Args[3:])

		if *domain == "" {
			fmt.Println(c(Red, "[!] --domain flag required"))
			return
		}

		endpoint := fmt.Sprintf("/subdomains/%s", *domain)

		if *all {
			spinner("Fetching all subdomains for " + *domain)
			items, total, err := fetchAllPagesGeneric(endpoint)
			clearLine()
			if err != nil {
				fmt.Printf("%s[✗] %v%s\n", Red, err, Reset)
				return
			}
			fmt.Printf("\n%s✨ %s%s — %s%d found%s\n\n", Green, *domain, Reset, Yellow, total, Reset)
			for _, sd := range items {
				fmt.Fprintln(writer, sd)
			}
		} else {
			var res SubdomainResponse
			if err := makeRequest(endpoint+"?page=1&per_page=100", &res); err != nil {
				fmt.Printf("%s[✗] %v%s\n", Red, err, Reset)
				return
			}
			fmt.Printf("\n%s✨ %s%s — %s%d found%s (showing %d)\n\n",
				Green, *domain, Reset, Yellow, res.Total, Reset, len(res.Data))
			for _, sd := range res.Data {
				fmt.Fprintln(writer, sd)
			}
			if res.Total > len(res.Data) {
				fmt.Printf("\n%s[!] Use --all flag to fetch all %d results%s\n", Yellow, res.Total, Reset)
			}
		}

	case "search":
		searchCmd := flag.NewFlagSet("subdomains search", flag.ExitOnError)
		query := searchCmd.String("query", "", "Search keyword")
		_ = searchCmd.Parse(os.Args[3:])

		if *query == "" {
			fmt.Println(c(Red, "[!] --query flag required"))
			return
		}

		spinner("Fetching all subdomains to search")
		items, total, err := fetchAllPagesGeneric("/subdomains/all")
		clearLine()
		if err != nil {
			fmt.Printf("%s[✗] %v%s\n", Red, err, Reset)
			return
		}

		q := strings.ToLower(*query)
		var matches []string
		for _, sd := range items {
			if strings.Contains(strings.ToLower(sd), q) {
				matches = append(matches, sd)
			}
		}

		fmt.Printf("\n%s🔍 Search: \"%s\"%s — %s%d matches%s of %d total\n\n",
			Cyan, *query, Reset, Yellow, len(matches), Reset, total)
		for _, sd := range matches {
			idx := strings.Index(strings.ToLower(sd), q)
			if idx >= 0 && !noColor {
				highlighted := sd[:idx] + Red + sd[idx:idx+len(*query)] + Reset + sd[idx+len(*query):]
				fmt.Fprintln(writer, highlighted)
			} else {
				fmt.Fprintln(writer, sd)
			}
		}

	case "count":
		var res SubdomainResponse
		if err := makeRequest("/subdomains/all?page=1&per_page=1", &res); err != nil {
			fmt.Printf("%s[✗] %v%s\n", Red, err, Reset)
			return
		}
		fmt.Printf("%s%d%s\n", Yellow, res.Total, Reset)
	}
}

// ─── Live ─────────────────────────────────────────────────────────────────────

func handleLive() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: watchtower live [all|fresh]")
		return
	}
	defer setupOutput()()

	subCmd := os.Args[2]
	endpoint := "/lives/all"
	label := "ALL"
	if subCmd == "fresh" {
		endpoint = "/live/fresh"
		label = "FRESH (last 12h)"
	}

	// اصلاح پجینیشن برای لود کردن کامل دارایی‌های Live
	spinner("Fetching live assets")
	items, total, err := fetchAllPagesGeneric(endpoint)
	clearLine()
	if err != nil {
		fmt.Printf("%s[✗] %v%s\n", Red, err, Reset)
		return
	}

	fmt.Printf("\n%s✅ Live Assets [%s]%s — %s%d total%s\n\n", Green, label, Reset, Yellow, total, Reset)
	for _, host := range items {
		fmt.Fprintf(writer, "  %s %s\n", c(DimGreen, "▸"), host)
	}
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────

func handleHTTP() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: watchtower http [all|fresh]")
		return
	}
	defer setupOutput()()

	subCmd := os.Args[2]
	endpoint := "/http/all"
	label := "ALL"
	if subCmd == "fresh" {
		endpoint = "/http/fresh"
		label = "FRESH (last 12h)"
	}

	// اصلاح پجینیشن برای لود کردن کامل تمام وب‌سرویس‌ها
	spinner("Fetching web services")
	items, total, err := fetchAllPagesGeneric(endpoint)
	clearLine()
	if err != nil {
		fmt.Printf("%s[✗] %v%s\n", Red, err, Reset)
		return
	}

	fmt.Printf("\n%s🌐 Web Services [%s]%s — %s%d total%s\n\n", Cyan, label, Reset, Yellow, total, Reset)
	for _, url := range items {
		fmt.Fprintf(writer, "%s\n", url)
	}
}

// ─── Watch ────────────────────────────────────────────────────────────────────

func handleWatch() {
	watchCmd := flag.NewFlagSet("watch", flag.ExitOnError)
	interval := watchCmd.Int("interval", 10, "Refresh interval in seconds")
	_ = watchCmd.Parse(os.Args[2:])

	fmt.Printf("%s[*] Starting live monitor (interval: %ds) — press Ctrl+C to stop%s\n", Yellow, *interval, Reset)
	time.Sleep(800 * time.Millisecond)

	iteration := 0
	for {
		clearScreen()
		printBanner()
		fmt.Printf("%s  Iteration #%d  |  Next refresh in %ds  |  %s%s\n\n",
			DimCyan, iteration+1, *interval, time.Now().Format("Mon 15:04:05"), Reset)
		showStats()
		iteration++
		time.Sleep(time.Duration(*interval) * time.Second)
	}
}

// ─── Export ───────────────────────────────────────────────────────────────────

func handleExport() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: watchtower export [subdomains|programs] --output <file>")
		return
	}
	target := os.Args[2]

	exportCmd := flag.NewFlagSet("export", flag.ExitOnError)
	output := exportCmd.String("output", "", "Output file path")
	_ = exportCmd.Parse(os.Args[3:])

	if *output == "" {
		*output = fmt.Sprintf("watchtower_%s_%s.txt", target, time.Now().Format("20060102_150405"))
		fmt.Printf("%s[~] No --output given, using: %s%s\n", DimCyan, *output, Reset)
	}

	f, err := os.Create(*output)
	if err != nil {
		fmt.Printf("%s[✗] Cannot create file: %v%s\n", Red, err, Reset)
		return
	}
	defer f.Close()

	switch target {
	case "subdomains":
		spinner("Fetching all subdomains")
		items, total, err := fetchAllPagesGeneric("/subdomains/all")
		clearLine()
		if err != nil {
			fmt.Printf("%s[✗] %v%s\n", Red, err, Reset)
			return
		}
		bw := bufio.NewWriter(f)
		for _, sd := range items {
			fmt.Fprintln(bw, sd)
		}
		bw.Flush()
		fmt.Printf("%s[✓] Exported %d subdomains → %s%s\n", Green, total, *output, Reset)

	case "programs":
		var programs ProgramResponse
		if err := makeRequest("/programs/all", &programs); err != nil {
			fmt.Printf("%s[✗] %v%s\n", Red, err, Reset)
			return
		}
		bw := bufio.NewWriter(f)
		for name, p := range programs {
			fmt.Fprintf(bw, "# %s\n", name)
			fmt.Fprintf(bw, "## Scopes (%d)\n", len(p.Scopes))
			for _, s := range p.Scopes {
				fmt.Fprintf(bw, "  %s\n", s)
			}
			if len(p.Outofscopes) > 0 {
				fmt.Fprintf(bw, "## Out of Scope (%d)\n", len(p.Outofscopes))
				for _, s := range p.Outofscopes {
					fmt.Fprintf(bw, "  %s\n", s)
				}
			}
			fmt.Fprintf(bw, "## Created: %s\n\n", p.CreatedDate)
		}
		bw.Flush()
		fmt.Printf("%s[✓] Exported %d programs → %s%s\n", Green, len(programs), *output, Reset)

	default:
		fmt.Printf("%s[!] Unknown export target: %s%s\n", Red, target, Reset)
	}
}

// ─── Interactive Mode ─────────────────────────────────────────────────────────

func interactiveMode() {
	printBanner()
	fmt.Println(c(Bold+White, "  🕹  Interactive Mode — type 'help' or 'quit'\n"))

	scanner := bufio.NewScanner(os.Stdin)
	for {
		fmt.Printf("%s watchtower%s › %s", Cyan, DimWhite, Reset)
		if !scanner.Scan() {
			break
		}
		input := strings.TrimSpace(scanner.Text())
		if input == "" {
			continue
		}
		parts := strings.Fields(input)
		switch parts[0] {
		case "quit", "exit", "q":
			fmt.Println(c(DimCyan, "\n  Goodbye. Stay stealthy. 🔭\n"))
			return
		case "help":
			printUsage()
		case "health":
			os.Args = []string{"watchtower", "health"}
			checkHealth()
		case "stats":
			showStats()
		case "dashboard":
			showDashboard()
		case "clear", "cls":
			clearScreen()
		default:
			os.Args = append([]string{"watchtower"}, parts...)
			command := parts[0]
			switch command {
			case "programs":
				handlePrograms()
			case "subdomains":
				handleSubdomains()
			case "live":
				handleLive()
			case "http":
				handleHTTP()
			case "export":
				handleExport()
			default:
				fmt.Printf("%s[!] Unknown: %s — try 'help'%s\n", Red, input, Reset)
			}
		}
	}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func clearScreen() {
	fmt.Print("\033[H\033[2J")
}

func clearLine() {
	fmt.Print("\r\033[K")
}

func spinner(msg string) {
	frames := []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"}
	go func() {
		i := 0
		for {
			fmt.Printf("\r%s %s%s %s%s", Cyan, frames[i%len(frames)], Reset, DimWhite+msg+Reset, "  ")
			time.Sleep(80 * time.Millisecond)
			i++
		}
	}()
}
