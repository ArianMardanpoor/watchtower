package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"text/tabwriter"
	"time"
)

// ─── ANSI Colors & Styles ────────────────────────────────────────────────────

const (
	Reset    = "\033[0m"
	Bold     = "\033[1m"
	Cyan     = "\033[1;36m"
	Green    = "\033[1;32m"
	Yellow   = "\033[1;33m"
	Red      = "\033[1;31m"
	Magenta  = "\033[1;35m"
	Blue     = "\033[1;34m"
	White    = "\033[1;37m"
	DimWhite = "\033[2;37m"
	DimCyan  = "\033[2;36m"
	DimGreen = "\033[2;32m"
	DimRed   = "\033[2;31m"
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

type GenericPaginatedResponse struct {
	Total   int                      `json:"total"`
	Page    int                      `json:"page"`
	PerPage int                      `json:"per_page"`
	Pages   int                      `json:"pages"`
	Data    []map[string]interface{} `json:"data"`
}

// ─── HTTP Client ─────────────────────────────────────────────────────────────

func makeRequest(endpoint string, result interface{}) error {
	client := &http.Client{Timeout: 30 * time.Second}
	targetURL := apiBaseURL + endpoint

	if verbose {
		fmt.Printf("%s→ GET %s%s\n", DimCyan, targetURL, Reset)
	}

	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return fmt.Errorf("failed to build request: %w", err)
	}
	req.Header.Set("X-API-Token", apiToken)

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("connection failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API error [%d]: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	return json.NewDecoder(resp.Body).Decode(result)
}

func fetchPlainText(endpoint string) ([]byte, error) {
	client := &http.Client{Timeout: 60 * time.Second}
	targetURL := apiBaseURL + endpoint

	req, _ := http.NewRequest("GET", targetURL, nil)
	req.Header.Set("X-API-Token", apiToken)

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error [%d]", resp.StatusCode)
	}
	return io.ReadAll(resp.Body)
}

func fetchAllPagesGeneric(endpoint string, targetKey string) ([]string, int, error) {
	var all []string
	page := 1
	perPage := 500
	total := 0

	for {
		sep := "?"
		if strings.Contains(endpoint, "?") {
			sep = "&"
		}
		fullEndpoint := fmt.Sprintf("%s%spage=%d&per_page=%d", endpoint, sep, page, perPage)

		var res GenericPaginatedResponse
		if err := makeRequest(fullEndpoint, &res); err != nil {
			return nil, 0, err
		}

		total = res.Total
		for _, item := range res.Data {
			if val, ok := item[targetKey].(string); ok && val != "" {
				all = append(all, val)
			} else if targetKey == "url" {
				if sub, ok := item["subdomain"].(string); ok {
					all = append(all, sub)
				}
			}
		}

		if len(all) >= total || len(res.Data) == 0 {
			break
		}
		page++
	}
	return all, total, nil
}

// ─── Banner & Usage ──────────────────────────────────────────────────────────

func printBanner() {
	if noColor {
		fmt.Println("=== WATCHTOWER CLI v2.0 ===")
		return
	}
	fmt.Println(Cyan + `  ██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗████████╗ ██████╗ ██╗    ██╗███████╗██████╗ ` + Reset)
	fmt.Println(Cyan + `  ██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║╚══██╔══╝██╔═══██╗██║    ██║██╔════╝██╔══██╗` + Reset)
	fmt.Println(Cyan + `  ██║ █╗ ██║███████║   ██║   ██║     ███████║   ██║   ██║   ██║██║ █╗ ██║█████╗  ██████╔╝` + Reset)
	fmt.Println(Yellow + `  ██║███╗██║██╔══██║   ██║   ██║     ██╔══██║   ██║   ██║   ██║██║███╗██║██╔══╝  ██╔══██╗` + Reset)
	fmt.Println(Red + `  ╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║   ██║   ╚██████╔╝╚███╔███╔╝███████╗██║  ██║` + Reset)
	fmt.Printf("  %s Recon Automation & Asset Intelligence Platform  %s  v2.0\n\n", DimWhite, Reset)
}

func printUsage() {
	printBanner()

	fmt.Println(c(Bold+White, "USAGE:"))
	fmt.Printf("  watchtower %s [flags]\n\n", c(Cyan, "<command>"))

	// ─── Global Flags ───
	fmt.Println(c(Bold+White, "GLOBAL FLAGS:"))
	fmt.Printf("  %-30s %s\n", c(Yellow, "--verbose, -v"), c(DimWhite, "Show detailed HTTP requests"))
	fmt.Printf("  %-30s %s\n", c(Yellow, "--no-color"), c(DimWhite, "Disable terminal colors"))
	fmt.Printf("  %-30s %s\n\n", c(Yellow, "--output <file>"), c(DimWhite, "Save output to a specific file"))

	// ─── Commands ───
	fmt.Println(c(Bold+White, "COMMANDS:"))
	w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)

	// Core
	fmt.Fprintln(w, c(Cyan, "  [ Core ]"))
	fmt.Fprintf(w, "  %s\t%s\n", c(Green, "health"), c(DimWhite, "Check API server health & latency"))
	fmt.Fprintf(w, "  %s\t%s\n", c(Green, "stats [program <name> | timeline]"), c(DimWhite, "Global or specific program statistics"))
	fmt.Fprintf(w, "  %s\t%s\n\n", c(Green, "programs [list | show --name <p>]"), c(DimWhite, "Manage bug bounty programs"))

	// Assets
	fmt.Fprintln(w, c(Cyan, "  [ Assets ] (Supports Filters)"))
	fmt.Fprintf(w, "  %s\t%s\n", c(Green, "subdomains list"), c(DimWhite, "List subdomains with rich filtering"))
	fmt.Fprintf(w, "  %s\t%s\n", c(Green, "live list"), c(DimWhite, "List live assets (HTTP/Ping)"))
	fmt.Fprintf(w, "  %s\t%s\n", c(Green, "http list"), c(DimWhite, "List probed web services"))
	fmt.Fprintf(w, "  %s\t%s\n\n", c(Green, "assets list"), c(DimWhite, "Combined view (Subdomain + Live + HTTP)"))

	// Utilities
	fmt.Fprintln(w, c(Cyan, "  [ Utilities ]"))
	fmt.Fprintf(w, "  %s\t%s\n", c(Green, "search --q <query>"), c(DimWhite, "Global search across all tables"))
	fmt.Fprintf(w, "  %s\t%s\n", c(Green, "meta <target>"), c(DimWhite, "List metadata: providers|techs|cdns|scopes|ips"))
	fmt.Fprintf(w, "  %s\t%s\n", c(Green, "export <target>"), c(DimWhite, "Export pure text: subdomains|urls"))
	fmt.Fprintf(w, "  %s\t%s\n", c(Green, "interactive, i"), c(DimWhite, "Start interactive shell"))

	w.Flush()
	fmt.Println()

	// ─── Filters ───
	fmt.Println(c(Bold+White, "AVAILABLE FILTERS (For Asset Commands):"))
	fmt.Printf("  %-25s %s\n", c(Cyan, "--program <name>"), c(DimWhite, "Filter by program name"))
	fmt.Printf("  %-25s %s\n", c(Cyan, "--scope <domain>"), c(DimWhite, "Filter by root domain scope"))
	fmt.Printf("  %-25s %s\n", c(Cyan, "--provider <name>"), c(DimWhite, "Filter by discovery tool (e.g., subfinder)"))
	fmt.Printf("  %-25s %s\n", c(Cyan, "--has-http / --has-live"), c(DimWhite, "Boolean status filters (true/false)"))
	fmt.Printf("  %-25s %s\n", c(Cyan, "--status-code <code>"), c(DimWhite, "Filter HTTP status code (e.g., 200, 403)"))
	fmt.Printf("  %-25s %s\n", c(Cyan, "--tech <name>"), c(DimWhite, "Filter by technology (e.g., nginx, react)"))
	fmt.Printf("  %-25s %s\n", c(Cyan, "--has-cdn / --cdn <name>"), c(DimWhite, "Filter by CDN presence or name"))
	fmt.Printf("  %-25s %s\n", c(Cyan, "--only-new true"), c(DimWhite, "Show only assets discovered in the last 24h"))
	fmt.Println()

	// ─── Examples ───
	fmt.Println(c(Bold+White, "EXAMPLES:"))
	fmt.Printf("  %s %s\n", c(DimCyan, "1."), c(White, "watchtower subdomains list --program \"yahoo\" --has-http true"))
	fmt.Printf("  %s %s\n", c(DimCyan, "2."), c(White, "watchtower http list --status-code 403 --output forbidden.txt"))
	fmt.Printf("  %s %s\n", c(DimCyan, "3."), c(White, "watchtower live list --has-cdn true --cdn cloudflare"))
	fmt.Printf("  %s %s\n", c(DimCyan, "4."), c(White, "watchtower search --q admin --program \"hackerone\""))
	fmt.Println()
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
	return func() {
		f.Close()
		fmt.Printf("\n%s[✓] Saved to %s%s\n", Green, outputFile, Reset)
	}
}

// ─── Query Builder Helper ────────────────────────────────────────────────────

func appendIfSet(q url.Values, key string, val *string) {
	if val != nil && *val != "" {
		q.Add(key, *val)
	}
}

func appendBoolIfSet(q url.Values, key string, val *string) {
	if val != nil && (*val == "true" || *val == "false") {
		q.Add(key, *val)
	}
}

// ─── Main Logic ──────────────────────────────────────────────────────────────

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
			if strings.HasPrefix(args[i], "--output=") {
				outputFile = strings.TrimPrefix(args[i], "--output=")
			} else if args[i] == "--output" && i+1 < len(args) {
				outputFile = args[i+1]
				i++
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
		var res map[string]interface{}
		if err := makeRequest("/health", &res); err != nil {
			fmt.Printf("%s[✗] OFFLINE%s — %v\n", Red, Reset, err)
		} else {
			fmt.Printf("%s[✓] ONLINE%s — %v\n", Green, Reset, res["timestamp"])
		}
	case "stats":
		handleStats()
	case "programs":
		handlePrograms()
	case "subdomains":
		handleSubdomains()
	case "live":
		handleLive()
	case "http":
		handleHTTP()
	case "assets":
		handleAssets()
	case "search":
		handleSearch()
	case "meta":
		handleMeta()
	case "export":
		handleExport()
	case "interactive", "i":
		interactiveMode()
	default:
		printUsage()
	}
}

// ─── Command Handlers ────────────────────────────────────────────────────────

func handleStats() {
	if len(os.Args) < 2 {
		return
	}
	sub := "global"
	if len(os.Args) >= 3 {
		sub = os.Args[2]
	}

	switch sub {
	case "global":
		var res map[string]interface{}
		if err := makeRequest("/stats", &res); err == nil {
			b, _ := json.MarshalIndent(res, "", "  ")
			fmt.Println(string(b))
		}
	case "program":
		if len(os.Args) < 4 {
			fmt.Println("Usage: watchtower stats program <name>")
			return
		}
		var res map[string]interface{}
		if err := makeRequest("/stats/program/"+os.Args[3], &res); err == nil {
			b, _ := json.MarshalIndent(res, "", "  ")
			fmt.Println(string(b))
		}
	case "timeline":
		var res map[string]interface{}
		if err := makeRequest("/stats/timeline", &res); err == nil {
			b, _ := json.MarshalIndent(res, "", "  ")
			fmt.Println(string(b))
		}
	}
}

func handlePrograms() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: watchtower programs [list|show]")
		return
	}
	if os.Args[2] == "list" {
		cmd := flag.NewFlagSet("programs list", flag.ExitOnError)
		search := cmd.String("search", "", "Search program name")
		_ = cmd.Parse(os.Args[3:])

		endpoint := "/programs"
		if *search != "" {
			endpoint += "?search=" + url.QueryEscape(*search)
		}
		var res map[string]interface{}
		if err := makeRequest(endpoint, &res); err == nil {
			b, _ := json.MarshalIndent(res, "", "  ")
			fmt.Println(string(b))
		}
	} else if os.Args[2] == "show" {
		cmd := flag.NewFlagSet("programs show", flag.ExitOnError)
		name := cmd.String("name", "", "Program name")
		_ = cmd.Parse(os.Args[3:])
		if *name == "" {
			return
		}
		var res map[string]interface{}
		if err := makeRequest("/programs/"+url.PathEscape(*name), &res); err == nil {
			b, _ := json.MarshalIndent(res, "", "  ")
			fmt.Println(string(b))
		}
	}
}

func handleSubdomains() {
	cmd := flag.NewFlagSet("subdomains list", flag.ExitOnError)
	prog := cmd.String("program", "", "Filter by program")
	scope := cmd.String("scope", "", "Filter by scope")
	prov := cmd.String("provider", "", "Filter by provider")
	search := cmd.String("search", "", "Search subdomain")
	hasHttp := cmd.String("has-http", "", "true/false")
	hasLive := cmd.String("has-live", "", "true/false")
	onlyNew := cmd.String("only-new", "", "true/false")
	_ = cmd.Parse(os.Args[3:])
	defer setupOutput()()

	q := url.Values{}
	appendIfSet(q, "program", prog)
	appendIfSet(q, "scope", scope)
	appendIfSet(q, "provider", prov)
	appendIfSet(q, "search", search)
	appendBoolIfSet(q, "has_http", hasHttp)
	appendBoolIfSet(q, "has_live", hasLive)
	appendBoolIfSet(q, "only_new", onlyNew)

	endpoint := "/subdomains?" + q.Encode()
	items, total, err := fetchAllPagesGeneric(endpoint, "subdomain")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Printf("\n%s[✓] Total Subdomains: %d%s\n\n", Green, total, Reset)
	for _, i := range items {
		fmt.Fprintln(writer, i)
	}
}

func handleLive() {
	cmd := flag.NewFlagSet("live list", flag.ExitOnError)
	prog := cmd.String("program", "", "Filter by program")
	ip := cmd.String("ip", "", "Filter by IP")
	hasCdn := cmd.String("has-cdn", "", "true/false")
	cdn := cmd.String("cdn", "", "CDN Name")
	onlyNew := cmd.String("only-new", "", "true/false")
	_ = cmd.Parse(os.Args[3:])
	defer setupOutput()()

	q := url.Values{}
	appendIfSet(q, "program", prog)
	appendIfSet(q, "ip", ip)
	appendBoolIfSet(q, "has_cdn", hasCdn)
	appendIfSet(q, "cdn", cdn)
	appendBoolIfSet(q, "only_new", onlyNew)

	endpoint := "/lives?" + q.Encode()
	items, total, err := fetchAllPagesGeneric(endpoint, "subdomain")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Printf("\n%s[✓] Total Live Assets: %d%s\n\n", Green, total, Reset)
	for _, i := range items {
		fmt.Fprintln(writer, i)
	}
}

func handleHTTP() {
	cmd := flag.NewFlagSet("http list", flag.ExitOnError)
	prog := cmd.String("program", "", "Filter by program")
	status := cmd.String("status-code", "", "Filter by status code")
	tech := cmd.String("tech", "", "Filter by technology")
	title := cmd.String("title", "", "Search in title")
	onlyNew := cmd.String("only-new", "", "true/false")
	_ = cmd.Parse(os.Args[3:])
	defer setupOutput()()

	q := url.Values{}
	appendIfSet(q, "program", prog)
	appendIfSet(q, "status_code", status)
	appendIfSet(q, "tech", tech)
	appendIfSet(q, "title", title)
	appendBoolIfSet(q, "only_new", onlyNew)

	endpoint := "/http?" + q.Encode()
	items, total, err := fetchAllPagesGeneric(endpoint, "url")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Printf("\n%s[✓] Total HTTP Services: %d%s\n\n", Green, total, Reset)
	for _, i := range items {
		fmt.Fprintln(writer, i)
	}
}

func handleAssets() {
	cmd := flag.NewFlagSet("assets list", flag.ExitOnError)
	prog := cmd.String("program", "", "Filter by program")
	status := cmd.String("status", "all", "all | live_only | http_only | both | none")
	_ = cmd.Parse(os.Args[3:])

	q := url.Values{}
	appendIfSet(q, "program", prog)
	appendIfSet(q, "status", status)

	var res GenericPaginatedResponse
	if err := makeRequest("/assets?"+q.Encode(), &res); err == nil {
		b, _ := json.MarshalIndent(res.Data, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println("Error:", err)
	}
}

func handleSearch() {
	cmd := flag.NewFlagSet("search", flag.ExitOnError)
	query := cmd.String("q", "", "Search string (min 3 chars)")
	prog := cmd.String("program", "", "Limit to program")
	_ = cmd.Parse(os.Args[2:])

	if *query == "" {
		fmt.Println("Usage: watchtower search --q <query>")
		return
	}

	q := url.Values{}
	q.Add("q", *query)
	appendIfSet(q, "program", prog)

	var res map[string]interface{}
	if err := makeRequest("/search?"+q.Encode(), &res); err == nil {
		b, _ := json.MarshalIndent(res, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println("Error:", err)
	}
}

func handleMeta() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: watchtower meta [providers|techs|cdns|scopes|ips]")
		return
	}
	target := os.Args[2]
	var res interface{}
	if err := makeRequest("/meta/"+target, &res); err == nil {
		b, _ := json.MarshalIndent(res, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println("Error:", err)
	}
}

func handleExport() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: watchtower export [subdomains|urls]")
		return
	}
	target := os.Args[2]
	cmd := flag.NewFlagSet("export", flag.ExitOnError)
	prog := cmd.String("program", "", "Filter by program")
	scope := cmd.String("scope", "", "Filter by scope")
	hasHttp := cmd.String("has-http", "", "true/false (subdomains only)")
	status := cmd.String("status-code", "", "Status code (urls only)")
	_ = cmd.Parse(os.Args[3:])
	defer setupOutput()()

	q := url.Values{}
	appendIfSet(q, "program", prog)
	appendIfSet(q, "scope", scope)
	appendIfSet(q, "has_http", hasHttp)
	appendIfSet(q, "status_code", status)

	endpoint := fmt.Sprintf("/export/%s?%s", target, q.Encode())
	data, err := fetchPlainText(endpoint)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	writer.Write(data)
}

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
		if input == "quit" || input == "exit" {
			break
		}
		if input != "" {
			fmt.Println("Run commands directly in normal terminal mode for rich flags.")
		}
	}
}
