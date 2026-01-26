# SentinelDaemon - Engineering Explainer

**Project**: `SentinelDaemon`
**Stack**: Python 3.12+, Watchdog, Google Gemini API
**Type**: Background Service / Daemon

## 1. Executive Overview
SentinelDaemon is an automated file organizer that watches the `~/Downloads` directory. It uses the `watchdog` library to detect new files and Google's Gemini 1.5 Flash model to intelligently classify and move them into the appropriate project folders within `~/Developer`. It also has hooks for OCR processing on PDF files.

## 2. How to Run & Test
### Run Locally
```bash
# Activate virtual environment (implied)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Daemon
python src/daemon.py
```
**Daemon Logic**: It will run indefinitely. Stop with `Ctrl+C`.

### Testing
-   **Manual**: Drop a file into `~/Downloads` and watch the logs/files move.
-   **Unit Tests**: Located in `tests/` (structure exists, specific tests not reviewed).

## 3. Architecture & Data Flow

### Core Modules (`src/`)
1.  **`daemon.py`**: The Entry Point.
    -   Sets up a `watchdog.observers.Observer`.
    -   Handler: `SentinelHandler`.
    -   **Debouncing**: Implements `wait_for_file_stability` to ensure downloads are complete before processing (checks file size stability over 1.5s).
    -   **Routing**: Dispatches PDFs to `ocr.py` and everything to `sorter.py`.

2.  **`sorter.py`**: The Brain.
    -   **Context**: Scans `~/Developer` to get a list of valid project folders.
    -   **AI Logic**: Sends the filename + project list to `gemini-1.5-flash`.
    -   **Prompt**: "Based on the filename, which folder does this file belong to?" inside a rigid instruction block.
    -   **Action**: Moves the file to the determined folder using `shutil`. Handles name collisions by appending timestamps.

3.  **`ocr.py`**: (Inferred) handles Optical Character Recognition for PDFs.

### Configuration
-   **Environment**: Loads `.env` from project root (specifically looks for `GEMINI_API_KEY`).
-   **Paths**: Hardcoded watches on `~/Downloads` and targets `~/Developer`.

## 4. Key Decisions & Trade-offs
-   **AI for Sorting**: Instead of regex rules, it relies on an LLM. **Pros**: Handles messy/unpredictable filenames. **Cons**: Latency, API cost, requires internet.
-   **Stability Check**: The polling loop in `wait_for_file_stability` is a robust way to handle browser downloads (which often create temp files or grow slowly).

## 5. Security & Safety
-   **API Key**: Uses `python-dotenv` to load secrets. Logs a warning if missing (graceful degradation).
-   **File Safety**: Uses `shutil.move`. Checks for collisions but relies on timestamp appending. (Risk: potential race conditions if very high volume).

## 6. Suggested Improvements
1.  **Concurrency**: The `process` method blocks the observer thread. Large files or slow API calls will block other events. **Refactor**: Use a `queue.Queue` and a worker thread.
2.  **Config**: Move `WATCH_DIR` and `DEVELOPER_DIR` to a `config.yaml` or `.env` variable instead of hardcoding.
3.  **Observability**: Add a legitimate logger (rotating file handler) instead of just stdout `logging.basicConfig`.
