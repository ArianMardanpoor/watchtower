#!/usr/bin/env python3
import subprocess
import logging
from typing import List, Optional
from datetime import datetime

# تنظیمات لاگر
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] - %(message)s'
)
logger = logging.getLogger(__name__)

def run_command_safe(command_args: List[str], timeout: int = 60) -> Optional[List[str]]:
    """
    اجرای امن دستورات سیستمی.
    """
    try:
        result = subprocess.run(
            command_args,
            capture_output=True,
            text=True,
            shell=False, # همیشه False برای جلوگیری از Command Injection
            timeout=timeout
        )
        
        if result.returncode != 0:
            logger.error(f"Command failed: {' '.join(command_args)} | Error: {result.stderr.strip()}")
            return None
            
        return result.stdout.splitlines()
        
    except subprocess.TimeoutExpired:
        logger.warning(f"Timeout ({timeout}s) expired for command: {' '.join(command_args)}")
        return None
    except Exception as e:
        logger.exception(f"Unexpected error running command {' '.join(command_args)}: {e}")
        return None

def run_command_with_input(command_args: List[str], input_string: str, timeout: int = 60) -> Optional[str]:
    """
    اجرای دستور با دریافت ورودی از stdin.
    """
    try:
        result = subprocess.run(
            command_args,
            input=input_string,
            capture_output=True,
            text=True,
            shell=False,
            timeout=timeout
        )
        
        if result.returncode != 0:
            logger.error(f"Command failed: {' '.join(command_args)} | Error: {result.stderr.strip()}")
            return None
            
        return result.stdout
        
    except subprocess.TimeoutExpired:
        logger.warning(f"Timeout ({timeout}s) expired for command: {' '.join(command_args)}")
        return None
    except Exception as e:
        logger.exception(f"Unexpected error running piped command: {e}")
        return None