from logging import LoggerAdapter, getLogger
from typing import Optional

from chainflow_api.config import Config


def config(config: Config):
    return dict(
        # See: <https://docs.python.org/3.7/library/logging.config.html#logging.config.fileConfig>
        # and find `disable_existing_loggers`, it's same configuration parameter as for dictConfig function.
        disable_existing_loggers=False,
        version=1,
        formatters={
            'simple': {
                'format': '%(asctime)s - %(filename)s:%(lineno)s:%(funcName)s - %(levelname)s - %(message)s'
            },
            'logstash': {'()': 'logstash_formatter.LogstashFormatterV1'},
        },
        handlers={
            'console': {
                'class': 'logging.StreamHandler',
                'level': config.LOGGING_LEVEL,
                'formatter': 'simple',
                'stream': 'ext://sys.stdout',
            },
            'logstash': {
                'level': config.LOGSTASH_LOGGING_LEVEL,
                'class': 'logstash_async.handler.AsynchronousLogstashHandler',
                'transport': 'logstash_async.transport.TcpTransport',
                'formatter': 'logstash',
                'host': config.LOGSTASH,
                'port': config.PORT,
                'database_path': None,
                'event_ttl': 30,  # sec
            },
        },
        root={
            'handlers': config.LOG_HANDLERS,
            'level': config.LOGGING_LEVEL,
        },
    )


def get_logger(
    name: str, extra: Optional[dict] = None) -> LoggerAdapter:
    extra = extra or {}
    return LoggerAdapter(getLogger(name), extra)
