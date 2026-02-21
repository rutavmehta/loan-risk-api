import logging
import sys
from logging import StreamHandler, Formatter

def get_logger(name="loan_risk_app"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    handler = StreamHandler(sys.stdout)
    formatter = Formatter(
        '{"time":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}'
    )
    handler.setFormatter(formatter)
    if not logger.handlers:
        logger.addHandler(handler)
    return logger

logger = get_logger()
