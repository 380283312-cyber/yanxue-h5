#!/usr/bin/env python3
"""Deploy yanxue-h5 static files to Tencent Cloud via SFTP"""
import paramiko
import os
import sys
from pathlib import Path

# Server config
HOST = "119.45.45.102"
PORT = 22
USER = "root"
PASSWORD = "Lvjiangpan1421"
REMOTE_DIR = "/www/yanxue-h5"
LOCAL_DIR = Path(__file__).parent / "out"

def deploy():
    print(f"Connecting to {HOST}...")
    transport = paramiko.Transport((HOST, PORT))
    transport.connect(username=USER, password=PASSWORD)
    sftp = paramiko.SFTPClient.from_transport(transport)
    print("Connected.")

    # Upload all files recursively
    uploaded = 0
    skipped = 0

    for root, dirs, files in os.walk(LOCAL_DIR):
        rel_root = Path(root).relative_to(LOCAL_DIR)
        remote_root = REMOTE_DIR if str(rel_root) == "." else f"{REMOTE_DIR}/{rel_root}"

        # Create remote directories
        for d in dirs:
            remote_path = f"{remote_root}/{d}"
            try:
                sftp.stat(remote_path)
            except FileNotFoundError:
                sftp.mkdir(remote_path)
                print(f"  [DIR] {remote_path}")

        # Upload files
        for f in files:
            local_path = Path(root) / f
            remote_path = f"{remote_root}/{f}"
            try:
                # Check if same size to avoid re-upload
                local_size = local_path.stat().st_size
                try:
                    remote_size = sftp.stat(remote_path).st_size
                    if local_size == remote_size:
                        skipped += 1
                        continue
                except FileNotFoundError:
                    pass

                sftp.put(str(local_path), remote_path)
                uploaded += 1
                print(f"  [PUT] {remote_path}")
            except Exception as e:
                print(f"  [ERR] {remote_path}: {e}")

    print(f"\nDone: {uploaded} files uploaded, {skipped} skipped.")
    sftp.close()
    transport.close()

if __name__ == "__main__":
    deploy()
