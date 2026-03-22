import logging
import sys

def setup_logger():
    logger = logging.getLogger("EdgeMind")
    logger.setLevel(logging.INFO)
    
    # Create console handler with a higher log level
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    
    # Create formatter and add it to the handler
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    
    # Add the handler to the logger
    if not logger.handlers:
        logger.addHandler(ch)
        
    return logger

logger = setup_logger()
