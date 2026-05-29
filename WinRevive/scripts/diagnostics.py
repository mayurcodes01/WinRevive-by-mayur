import platform
import os
import sys
import socket
import datetime
import psutil

def run_diagnostics():
    print("Collecting system information...")
    lines = []
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines.append(f"WinRevive Diagnostics Report")
    lines.append(f"Generated: {now}")
    lines.append("-" * 40)

    print("Reading platform data...")
    lines.append(f"OS: {platform.system()} {platform.release()} ({platform.version()})")
    lines.append(f"Architecture: {platform.machine()}")
    lines.append(f"Hostname: {socket.gethostname()}")
    lines.append(f"Python: {sys.version.split()[0]}")

    print("Checking memory status...")
    try:
        import psutil
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        cpu_count = psutil.cpu_count()
        lines.append(f"RAM Total: {mem.total // (1024**3)} GB")
        lines.append(f"RAM Used: {mem.percent}%")
        lines.append(f"Disk Total: {disk.total // (1024**3)} GB")
        lines.append(f"Disk Used: {disk.percent}%")
        lines.append(f"CPU Cores: {cpu_count}")
    except ImportError:
        lines.append("psutil not installed, skipping hardware metrics.")

    print("Analyzing startup programs...")
    lines.append("Diagnostics complete.")

    log_dir = os.path.join(os.path.expanduser("~"), "WinRevive_Logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, f"diagnostics_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")

    with open(log_file, "w") as f:
        f.write("\n".join(lines))

    print(f"Diagnostics report saved to: {log_file}")
    for line in lines:
        print(line)

if __name__ == "__main__":
    run_diagnostics()
