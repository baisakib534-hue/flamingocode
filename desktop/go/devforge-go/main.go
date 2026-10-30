package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

type Config struct {
	Port        int    `json:"port"`
	ProjectDir  string `json:"projectDir"`
	EnableMCP   bool   `json:"enableMCP"`
	LogLevel    string `json:"logLevel"`
}

type MCPRequest struct {
	Method string                 `json:"method"`
	Params map[string]interface{} `json:"params"`
	ID     interface{}            `json:"id"`
}

type MCPResponse struct {
	Result interface{} `json:"result,omitempty"`
	Error  *MCPError   `json:"error,omitempty"`
	ID     interface{} `json:"id"`
}

type MCPError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

var (
	config Config
)

func main() {
	configPath := flag.String("config", "", "Path to config file")
	port := flag.Int("port", 20128, "Port to listen on")
	projectDir := flag.String("project-dir", ".", "Project directory")
	enableMCP := flag.Bool("mcp", false, "Enable MCP server")
	logLevel := flag.String("log", "info", "Log level (debug, info, warn, error)")
	command := flag.String("cmd", "", "Command to execute (index, search, serve, mcp)")
	query := flag.String("query", "", "Search query for code graph")
	flag.Parse()

	config = Config{
		Port:       *port,
		ProjectDir: *projectDir,
		EnableMCP:  *enableMCP,
		LogLevel:   *logLevel,
	}

	if *configPath != "" {
		loadConfig(*configPath)
	}

	switch *command {
	case "index":
		runIndexer()
	case "search":
		if *query == "" {
			fmt.Fprintln(os.Stderr, "Error: --query required for search")
			os.Exit(1)
		}
		runSearch(*query)
	case "serve":
		runServer()
	case "mcp":
		runMCPServer()
	default:
		printUsage()
		os.Exit(1)
	}
}

func loadConfig(path string) {
	data, err := os.ReadFile(path)
	if err != nil {
		logError("Failed to read config: %v", err)
		return
	}
	if err := json.Unmarshal(data, &config); err != nil {
		logError("Failed to parse config: %v", err)
	}
}

func printUsage() {
	fmt.Println(`DevForge Go Helper - Fast CLI/Server utility

Usage:
  devforge-go [flags] <command>

Commands:
  index              Index project files for code graph
  search --query Q   Search code graph
  serve              Start HTTP server for file operations
  mcp                Start MCP stdio server

Flags:
  --config string       Config file path
  --port int            Server port (default 20128)
  --project-dir string  Project directory (default ".")
  --mcp                 Enable MCP server
  --log string          Log level (default "info")
  --cmd string          Command to execute
  --query string        Search query
`)
}

func logDebug(format string, args ...interface{}) {
	if config.LogLevel == "debug" {
		fmt.Fprintf(os.Stderr, "[DEBUG] "+format+"\n", args...)
	}
}

func logInfo(format string, args ...interface{}) {
	if config.LogLevel == "debug" || config.LogLevel == "info" {
		fmt.Fprintf(os.Stderr, "[INFO] "+format+"\n", args...)
	}
}

func logWarn(format string, args ...interface{}) {
	if config.LogLevel != "error" {
		fmt.Fprintf(os.Stderr, "[WARN] "+format+"\n", args...)
	}
}

func logError(format string, args ...interface{}) {
	fmt.Fprintf(os.Stderr, "[ERROR] "+format+"\n", args...)
}

func runIndexer() {
	logInfo("Starting file indexer for %s", config.ProjectDir)

	start := time.Now()
	filesIndexed := 0
	symbolsExtracted := 0

	err := filepath.WalkDir(config.ProjectDir, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			if strings.HasPrefix(d.Name(), ".") || d.Name() == "node_modules" || d.Name() == "target" || d.Name() == "build" || d.Name() == "dist" {
				return filepath.SkipDir
			}
			return nil
		}

		ext := strings.ToLower(filepath.Ext(path))
		if !isCodeFile(ext) {
			return nil
		}

		content, err := os.ReadFile(path)
		if err != nil {
			logWarn("Failed to read %s: %v", path, err)
			return nil
		}

		symbols := extractSymbols(string(content), ext)
		symbolsExtracted += len(symbols)
		filesIndexed++

		if filesIndexed%100 == 0 {
			logDebug("Indexed %d files, %d symbols", filesIndexed, symbolsExtracted)
		}

		return nil
	})

	if err != nil {
		logError("Indexing failed: %v", err)
		os.Exit(1)
	}

	logInfo("Indexed %d files, %d symbols in %v", filesIndexed, symbolsExtracted, time.Since(start))
}

func isCodeFile(ext string) bool {
	codeExts := map[string]bool{
		".js": true, ".jsx": true, ".ts": true, ".tsx": true,
		".rs": true, ".py": true, ".go": true, ".java": true,
		".cpp": true, ".cc": true, ".cxx": true, ".h": true, ".hpp": true,
		".cs": true, ".php": true, ".rb": true, ".swift": true,
		".kt": true, ".scala": true, ".clj": true, ".hs": true,
	}
	return codeExts[ext]
}

func extractSymbols(content, ext string) []string {
	var symbols []string
	lines := strings.Split(content, "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "//") || strings.HasPrefix(line, "#") || strings.HasPrefix(line, "/*") {
			continue
		}

		switch ext {
		case ".js", ".jsx", ".ts", ".tsx":
			if matches := extractJSFunction(line); matches != "" {
				symbols = append(symbols, matches)
			}
			if matches := extractJSClass(line); matches != "" {
				symbols = append(symbols, matches)
			}
		case ".rs":
			if matches := extractRustFn(line); matches != "" {
				symbols = append(symbols, matches)
			}
		case ".py":
			if matches := extractPyDef(line); matches != "" {
				symbols = append(symbols, matches)
			}
		case ".go":
			if matches := extractGoFunc(line); matches != "" {
				symbols = append(symbols, matches)
			}
		}
	}

	return symbols
}

func extractJSFunction(line string) string {
	if strings.Contains(line, "function ") {
		parts := strings.Split(line, "function ")
		if len(parts) > 1 {
			name := strings.Split(parts[1], "(")[0]
			return strings.TrimSpace(name)
		}
	}
	if strings.Contains(line, "=>") {
		parts := strings.Split(line, "=")
		if len(parts) > 1 {
			name := strings.TrimSpace(parts[0])
			name = strings.TrimPrefix(name, "const ")
			name = strings.TrimPrefix(name, "let ")
			name = strings.TrimPrefix(name, "var ")
			name = strings.TrimPrefix(name, "export ")
			name = strings.TrimPrefix(name, "default ")
			name = strings.TrimSpace(name)
			if name != "" && !strings.Contains(name, " ") {
				return name
			}
		}
	}
	return ""
}

func extractJSClass(line string) string {
	if strings.Contains(line, "class ") {
		parts := strings.Split(line, "class ")
		if len(parts) > 1 {
			name := strings.Split(parts[1], " ")[0]
			name = strings.Split(name, "{")[0]
			name = strings.Split(name, "extends")[0]
			return strings.TrimSpace(name)
		}
	}
	return ""
}

func extractRustFn(line string) string {
	if strings.HasPrefix(line, "fn ") || strings.HasPrefix(line, "pub fn ") || strings.HasPrefix(line, "async fn ") {
		parts := strings.Split(line, "fn ")
		if len(parts) > 1 {
			name := strings.Split(parts[1], "(")[0]
			return strings.TrimSpace(name)
		}
	}
	return ""
}

func extractPyDef(line string) string {
	if strings.HasPrefix(line, "def ") || strings.HasPrefix(line, "async def ") {
		parts := strings.Split(line, "def ")
		if len(parts) > 1 {
			name := strings.Split(parts[1], "(")[0]
			return strings.TrimSpace(name)
		}
	}
	if strings.HasPrefix(line, "class ") {
		parts := strings.Split(line, "class ")
		if len(parts) > 1 {
			name := strings.Split(parts[1], "(")[0]
			name = strings.Split(name, ":")[0]
			return strings.TrimSpace(name)
		}
	}
	return ""
}

func extractGoFunc(line string) string {
	if strings.HasPrefix(line, "func ") {
		parts := strings.Split(line, "func ")
		if len(parts) > 1 {
			rest := parts[1]
			if strings.Contains(rest, "(") {
				name := strings.Split(rest, "(")[0]
				name = strings.TrimSpace(name)
				if strings.Contains(name, ")") {
					name = strings.Split(name, ")")[1]
				}
				return strings.TrimSpace(name)
			}
		}
	}
	return ""
}

func runSearch(query string) {
	logInfo("Searching for: %s", query)

	matches := []string{}
	filepath.WalkDir(config.ProjectDir, func(path string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}

		ext := strings.ToLower(filepath.Ext(path))
		if !isCodeFile(ext) {
			return nil
		}

		content, err := os.ReadFile(path)
		if err != nil {
			return nil
		}

		lines := strings.Split(string(content), "\n")
		for i, line := range lines {
			if strings.Contains(strings.ToLower(line), strings.ToLower(query)) {
				matches = append(matches, fmt.Sprintf("%s:%d: %s", path, i+1, strings.TrimSpace(line)))
				if len(matches) >= 50 {
					return filepath.SkipDir
				}
			}
		}
		return nil
	})

	output, _ := json.MarshalIndent(matches, "", "  ")
	fmt.Println(string(output))
}

func runServer() {
	logInfo("Starting HTTP server on port %d", config.Port)

	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	http.HandleFunc("/api/files", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		path := r.URL.Query().Get("path")
		if path == "" {
			path = config.ProjectDir
		}
		fullPath := filepath.Join(config.ProjectDir, path)
		entries, err := os.ReadDir(fullPath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var files []map[string]interface{}
		for _, e := range entries {
			info, _ := e.Info()
			files = append(files, map[string]interface{}{
				"name":    e.Name(),
				"path":    filepath.Join(path, e.Name()),
				"isDir":   e.IsDir(),
				"size":    info.Size(),
				"modTime": info.ModTime().UnixMilli(),
			})
		}
		json.NewEncoder(w).Encode(files)
	})

	http.HandleFunc("/api/file/read", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		path := r.URL.Query().Get("path")
		if path == "" {
			http.Error(w, "path required", http.StatusBadRequest)
			return
		}
		fullPath := filepath.Join(config.ProjectDir, path)
		content, err := os.ReadFile(fullPath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"content": string(content)})
	})

	http.HandleFunc("/api/file/write", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.Method != http.MethodPost {
			http.Error(w, "POST required", http.StatusMethodNotAllowed)
			return
		}
		var req struct {
			Path    string `json:"path"`
			Content string `json:"content"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		fullPath := filepath.Join(config.ProjectDir, req.Path)
		if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if err := os.WriteFile(fullPath, []byte(req.Content), 0644); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	addr := fmt.Sprintf(":%d", config.Port)
	if err := http.ListenAndServe(addr, nil); err != nil {
		logError("Server failed: %v", err)
		os.Exit(1)
	}
}

func runMCPServer() {
	logInfo("Starting MCP stdio server")

	decoder := json.NewDecoder(os.Stdin)
	encoder := json.NewEncoder(os.Stdout)

	for {
		var req MCPRequest
		if err := decoder.Decode(&req); err != nil {
			if err == io.EOF {
				break
			}
			logError("MCP decode error: %v", err)
			continue
		}

		var resp MCPResponse
		resp.ID = req.ID

		switch req.Method {
		case "initialize":
			resp.Result = map[string]interface{}{
				"protocolVersion": "2024-11-05",
				"capabilities": map[string]interface{}{
					"tools": map[string]interface{}{},
				},
				"serverInfo": map[string]string{
					"name":    "devforge-go",
					"version": "1.0.0",
				},
			}
		case "tools/list":
			resp.Result = map[string]interface{}{
				"tools": []map[string]interface{}{
					{
						"name":        "search_code",
						"description": "Search code in project",
						"inputSchema": map[string]interface{}{
							"type": "object",
							"properties": map[string]interface{}{
								"query": map[string]interface{}{
									"type": "string",
								},
							},
							"required": []string{"query"},
						},
					},
					{
						"name":        "read_file",
						"description": "Read a file from project",
						"inputSchema": map[string]interface{}{
							"type": "object",
							"properties": map[string]interface{}{
								"path": map[string]interface{}{
									"type": "string",
								},
							},
							"required": []string{"path"},
						},
					},
					{
						"name":        "write_file",
						"description": "Write a file to project",
						"inputSchema": map[string]interface{}{
							"type": "object",
							"properties": map[string]interface{}{
								"path":    map[string]interface{}{"type": "string"},
								"content": map[string]interface{}{"type": "string"},
							},
							"required": []string{"path", "content"},
						},
					},
				},
			}
		case "tools/call":
			toolName, _ := req.Params["name"].(string)
			args, _ := req.Params["arguments"].(map[string]interface{})

			switch toolName {
			case "search_code":
				query, _ := args["query"].(string)
				matches := searchMCP(query)
				resp.Result = map[string]interface{}{
					"content": []map[string]interface{}{
						{"type": "text", "text": strings.Join(matches, "\n")},
					},
				}
			case "read_file":
				path, _ := args["path"].(string)
				fullPath := filepath.Join(config.ProjectDir, path)
				content, err := os.ReadFile(fullPath)
				if err != nil {
					resp.Error = &MCPError{Code: -32603, Message: err.Error()}
				} else {
					resp.Result = map[string]interface{}{
						"content": []map[string]interface{}{
							{"type": "text", "text": string(content)},
						},
					}
				}
			case "write_file":
				path, _ := args["path"].(string)
				content, _ := args["content"].(string)
				fullPath := filepath.Join(config.ProjectDir, path)
				if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
					resp.Error = &MCPError{Code: -32603, Message: err.Error()}
				} else if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
					resp.Error = &MCPError{Code: -32603, Message: err.Error()}
				} else {
					resp.Result = map[string]interface{}{
						"content": []map[string]interface{}{
							{"type": "text", "text": "File written successfully"},
						},
					}
				}
			default:
				resp.Error = &MCPError{Code: -32601, Message: "Tool not found: " + toolName}
			}
		default:
			resp.Error = &MCPError{Code: -32601, Message: "Method not found: " + req.Method}
		}

		if err := encoder.Encode(resp); err != nil {
			logError("MCP encode error: %v", err)
		}
	}
}

func searchMCP(query string) []string {
	var matches []string
	filepath.WalkDir(config.ProjectDir, func(path string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}

		ext := strings.ToLower(filepath.Ext(path))
		if !isCodeFile(ext) {
			return nil
		}

		content, err := os.ReadFile(path)
		if err != nil {
			return nil
		}

		lines := strings.Split(string(content), "\n")
		for i, line := range lines {
			if strings.Contains(strings.ToLower(line), strings.ToLower(query)) {
				matches = append(matches, fmt.Sprintf("%s:%d: %s", path, i+1, strings.TrimSpace(line)))
				if len(matches) >= 20 {
					return filepath.SkipDir
				}
			}
		}
		return nil
	})
	return matches
}