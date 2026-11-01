use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::collections::HashMap;
use std::path::Path;
use ignore::WalkBuilder;
use regex::Regex;

#[napi(object)]
pub struct FileIndexResult {
  pub files_indexed: u32,
  pub symbols_extracted: u32,
  pub duration_ms: f64,
}

#[derive(Clone)]
#[napi(object)]
pub struct CodeGraphNode {
  pub id: String,
  pub name: String,
  pub node_type: String,
  pub file: String,
  pub line: u32,
  pub column: u32,
}

#[napi(object)]
pub struct CodeGraphEdge {
  pub from: String,
  pub to: String,
  pub edge_type: String,
}

#[napi(object)]
pub struct CodeGraphResult {
  pub nodes: Vec<CodeGraphNode>,
  pub edges: Vec<CodeGraphEdge>,
}

#[napi(object)]
pub struct ScreenCaptureResult {
  pub width: u32,
  pub height: u32,
  pub data: String,
}

#[napi(object)]
pub struct SandboxConfig {
  pub sandbox_type: String,
  pub cpu_ms: Option<f64>,
  pub memory_mb: Option<f64>,
  pub disk_mb: Option<f64>,
}

#[napi(object)]
pub struct SandboxResult {
  pub sandbox_id: String,
  pub pid: u32,
}

#[napi(object)]
pub struct SandboxExecResult {
  pub stdout: String,
  pub stderr: String,
  pub exit_code: i32,
  pub duration_ms: f64,
}

struct SymbolExtractor {
  patterns: HashMap<String, Vec<Regex>>,
}

impl SymbolExtractor {
  fn new() -> Self {
    let mut patterns = HashMap::new();

    patterns.insert(
      "javascript".to_string(),
      vec![
        Regex::new(r"(?:export\s+)?(?:async\s+)?function\s+(\w+)").unwrap(),
        Regex::new(r"(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(.*?\)\s*=>").unwrap(),
        Regex::new(r"(?:export\s+)?class\s+(\w+)").unwrap(),
        Regex::new(r#"import\s+(?:\w+|\{[\w\s,]+\})\s+from\s+['\"]([^'\"]+)['\"]"#).unwrap(),
        Regex::new(r"export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)").unwrap(),
      ],
    );

    patterns.insert(
      "typescript".to_string(),
      vec![
        Regex::new(r"(?:export\s+)?(?:async\s+)?function\s+(\w+)").unwrap(),
        Regex::new(r"(?:export\s+)?(?:const|let|var)\s+(\w+)\s*:\s*\w+\s*=\s*(?:async\s+)?\(.*?\)\s*=>").unwrap(),
        Regex::new(r"(?:export\s+)?class\s+(\w+)").unwrap(),
        Regex::new(r"interface\s+(\w+)").unwrap(),
        Regex::new(r"type\s+(\w+)\s*=").unwrap(),
        Regex::new(r#"import\s+(?:\w+|\{[\w\s,]+\})\s+from\s+['\"]([^'\"]+)['\"]"#).unwrap(),
        Regex::new(r"export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type)\s+(\w+)").unwrap(),
      ],
    );

    patterns.insert(
      "rust".to_string(),
      vec![
        Regex::new(r"(?:pub\s+)?fn\s+(\w+)").unwrap(),
        Regex::new(r"(?:pub\s+)?struct\s+(\w+)").unwrap(),
        Regex::new(r"(?:pub\s+)?enum\s+(\w+)").unwrap(),
        Regex::new(r"(?:pub\s+)?trait\s+(\w+)").unwrap(),
        Regex::new(r"impl\s+(?:<.*?>)?\s*(\w+)").unwrap(),
        Regex::new(r"use\s+([\w:]+)").unwrap(),
        Regex::new(r"mod\s+(\w+)").unwrap(),
      ],
    );

    patterns.insert(
      "python".to_string(),
      vec![
        Regex::new(r"^def\s+(\w+)").unwrap(),
        Regex::new(r"^class\s+(\w+)").unwrap(),
        Regex::new(r"^import\s+(\w+)").unwrap(),
        Regex::new(r"^from\s+(\w+)\s+import").unwrap(),
        Regex::new(r"^async\s+def\s+(\w+)").unwrap(),
      ],
    );

    patterns.insert(
      "go".to_string(),
      vec![
        Regex::new(r"func\s+(?:\(\w+\s+\w+\)\s+)?(\w+)").unwrap(),
        Regex::new(r"type\s+(\w+)\s+struct").unwrap(),
        Regex::new(r"type\s+(\w+)\s+interface").unwrap(),
        Regex::new(r#"import\s+(?:\"([^\"]+)\"|`([^`]+)`)"#).unwrap(),
      ],
    );

    Self { patterns }
  }

  fn get_language(&self, path: &Path) -> Option<String> {
    match path.extension()?.to_str()? {
      "js" | "jsx" | "mjs" | "cjs" => Some("javascript".to_string()),
      "ts" | "tsx" | "mts" | "cts" => Some("typescript".to_string()),
      "rs" => Some("rust".to_string()),
      "py" => Some("python".to_string()),
      "go" => Some("go".to_string()),
      _ => None,
    }
  }

  fn extract(&self, content: &str, file_path: &Path, language: &str) -> Vec<CodeGraphNode> {
    let mut nodes = Vec::new();
    let empty: Vec<Regex> = Vec::new();
    let patterns = self.patterns.get(language).unwrap_or(&empty);
    let lines: Vec<&str> = content.lines().collect();

    for (line_idx, line) in lines.iter().enumerate() {
      for pattern in patterns {
        for captures in pattern.captures_iter(line) {
          if let Some(name_match) = captures.get(1) {
            let name = name_match.as_str().to_string();
            let id = format!("{}:{}:{}", file_path.display(), line_idx + 1, name_match.start());
            let node_type = self.classify_symbol(line, &name);

            nodes.push(CodeGraphNode {
              id,
              name,
              node_type,
              file: file_path.to_string_lossy().to_string(),
              line: (line_idx + 1) as u32,
              column: (name_match.start() + 1) as u32,
            });
          }
        }
      }
    }

    nodes
  }

  fn classify_symbol(&self, line: &str, _name: &str) -> String {
    if line.contains("fn ") || line.contains("function ") || line.contains("def ") || line.contains("func ") {
      "function".to_string()
    } else if line.contains("class ") || line.contains("struct ") || line.contains("enum ") {
      "class".to_string()
    } else if line.contains("import ") || line.contains("use ") || line.contains("from ") {
      "import".to_string()
    } else if line.contains("export ") {
      "export".to_string()
    } else {
      "variable".to_string()
    }
  }
}

#[napi]
pub fn index_directory(path: String) -> Result<FileIndexResult> {
  let start = std::time::Instant::now();
  let root_path = Path::new(&path);

  if !root_path.exists() {
    return Err(Error::new(Status::InvalidArg, "Path does not exist"));
  }

  let extractor = SymbolExtractor::new();
  let mut files_indexed = 0u32;
  let mut symbols_extracted = 0u32;

  let walker = WalkBuilder::new(root_path)
    .hidden(false)
    .git_ignore(true)
    .build();

  for entry in walker {
    let entry = entry.map_err(|e| Error::new(Status::GenericFailure, format!("walk error: {}", e)))?;
    let path = entry.path();

    if !path.is_file() {
      continue;
    }

    if let Some(language) = extractor.get_language(path) {
      if let Ok(content) = std::fs::read_to_string(path) {
        let nodes = extractor.extract(&content, path, &language);
        symbols_extracted += nodes.len() as u32;
        files_indexed += 1;
      }
    }
  }

  Ok(FileIndexResult {
    files_indexed,
    symbols_extracted,
    duration_ms: start.elapsed().as_millis() as f64,
  })
}

#[napi]
pub fn search_code_graph(query: String, project_path: String) -> Result<CodeGraphResult> {
  let root_path = Path::new(&project_path);

  if !root_path.exists() {
    return Err(Error::new(Status::InvalidArg, "Project path does not exist"));
  }

  let extractor = SymbolExtractor::new();
  let mut nodes = Vec::new();
  let mut edges = Vec::new();

  let query_lower = query.to_lowercase();
  let query_regex = Regex::new(&regex::escape(&query)).ok();

  let walker = WalkBuilder::new(root_path)
    .hidden(false)
    .git_ignore(true)
    .build();

  for entry in walker {
    let entry = entry.map_err(|e| Error::new(Status::GenericFailure, format!("walk error: {}", e)))?;
    let path = entry.path();

    if !path.is_file() {
      continue;
    }

    if let Some(language) = extractor.get_language(path) {
      if let Ok(content) = std::fs::read_to_string(path) {
        let file_nodes = extractor.extract(&content, path, &language);

        for node in &file_nodes {
          let matches = query_regex.as_ref().map_or(
            node.name.to_lowercase().contains(&query_lower),
            |re| re.is_match(&node.name)
          );

          if matches {
            nodes.push(node.clone());
          }
        }

        for node in &file_nodes {
          if node.node_type == "import" {
            let import_path = &node.name;
            edges.push(CodeGraphEdge {
              from: node.id.clone(),
              to: import_path.clone(),
              edge_type: "imports".to_string(),
            });
          }
        }
      }
    }
  }

  Ok(CodeGraphResult { nodes, edges })
}

#[napi]
pub fn capture_screen() -> Result<ScreenCaptureResult> {
  Err(Error::new(Status::GenericFailure, "Screen capture not implemented in Rust module - use C++ module"))
}

#[napi]
pub fn input_click(_x: i32, _y: i32) -> Result<()> {
  Err(Error::new(Status::GenericFailure, "Input click not implemented in Rust module - use C++ module"))
}

#[napi]
pub fn input_type(_text: String) -> Result<()> {
  Err(Error::new(Status::GenericFailure, "Input type not implemented in Rust module - use C++ module"))
}

#[napi]
pub fn input_key(_key: String, _modifiers: Option<Vec<String>>) -> Result<()> {
  Err(Error::new(Status::GenericFailure, "Input key not implemented in Rust module - use C++ module"))
}

#[napi]
pub fn input_drag(_from_x: i32, _from_y: i32, _to_x: i32, _to_y: i32) -> Result<()> {
  Err(Error::new(Status::GenericFailure, "Input drag not implemented in Rust module - use C++ module"))
}

#[napi]
pub fn sandbox_create(config: SandboxConfig) -> Result<SandboxResult> {
  use std::process::Command;
  use uuid::Uuid;

  let sandbox_id = Uuid::new_v4().to_string();
  let mut cmd = Command::new("bwrap");

  cmd.arg("--die-with-parent")
    .arg("--new-session")
    .arg("--unshare-all")
    .arg("--proc")
    .arg("/proc")
    .arg("--dev")
    .arg("/dev")
    .arg("--ro-bind")
    .arg("/usr")
    .arg("/usr")
    .arg("--ro-bind")
    .arg("/lib")
    .arg("/lib")
    .arg("--ro-bind")
    .arg("/lib64")
    .arg("/lib64")
    .arg("--tmpfs")
    .arg("/tmp");

  if let Some(mem_mb) = config.memory_mb {
    cmd.arg("--rlimit-as").arg(format!("{}", (mem_mb * 1024.0 * 1024.0) as u64));
  }

  cmd.arg("--").arg("/bin/sh").arg("-c").arg("sleep infinity");

  let child = cmd.spawn().map_err(|e| Error::new(Status::GenericFailure, format!("Failed to create sandbox: {}", e)))?;

  Ok(SandboxResult {
    sandbox_id,
    pid: child.id(),
  })
}

#[napi]
pub fn sandbox_execute(_sandbox_id: String, command: String) -> Result<SandboxExecResult> {
  use std::process::Command;
  use std::time::Instant;

  let start = Instant::now();
  let output = Command::new("bwrap")
    .arg("--die-with-parent")
    .arg("--new-session")
    .arg("--unshare-all")
    .arg("--proc")
    .arg("/proc")
    .arg("--dev")
    .arg("/dev")
    .arg("--ro-bind")
    .arg("/usr")
    .arg("/usr")
    .arg("--ro-bind")
    .arg("/lib")
    .arg("/lib")
    .arg("--ro-bind")
    .arg("/lib64")
    .arg("/lib64")
    .arg("--tmpfs")
    .arg("/tmp")
    .arg("--")
    .arg("/bin/sh")
    .arg("-c")
    .arg(&command)
    .output()
    .map_err(|e| Error::new(Status::GenericFailure, format!("Failed to execute in sandbox: {}", e)))?;

  Ok(SandboxExecResult {
    stdout: String::from_utf8_lossy(&output.stdout).to_string(),
    stderr: String::from_utf8_lossy(&output.stderr).to_string(),
    exit_code: output.status.code().unwrap_or(-1),
    duration_ms: start.elapsed().as_millis() as f64,
  })
}

#[napi]
pub fn sandbox_destroy(_sandbox_id: String) -> Result<()> {
  Ok(())
}