#!/usr/bin/env python3
import os
import sys
import json
import logging
from pathlib import Path

# اضافه کردن مسیر روت پروژه به sys.path برای ایمپورت‌های تمیزتر
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.db import upsert_program
import config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SyncProgram")

def scan_json(directory: Path):
    """اسکن دایرکتوری برای فایل‌های JSON برنامه‌ها"""
    if not directory.exists() or not directory.is_dir():
        logger.error(f"Directory not found or invalid: {directory}")
        return
    
    # استفاده از rglob برای پیدا کردن تمام فایل‌های json
    for file_path in directory.glob('*.json'):
        logger.info(f"Processing program file: {file_path.name}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                
                program_name = data.get("program_name")
                scopes = data.get("scopes", [])
                outofscopes = data.get("outofscopes", [])
                config_data = data.get("config", {})
                
                if program_name:
                    upsert_program(program_name, scopes, outofscopes, config_data)
                    logger.info(f"Successfully upserted: {program_name}")
                else:
                    logger.warning(f"File {file_path.name} is missing 'program_name' field. Skipped.")
                    
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in file {file_path.name}: {e}")
        except Exception as e:
            logger.exception(f"Unexpected error processing {file_path.name}: {e}")

if __name__ == "__main__":
    scan_dir = config.PROGRAMS_DIR
    logger.info(f"Starting sync from directory: {scan_dir}")
    scan_json(scan_dir)