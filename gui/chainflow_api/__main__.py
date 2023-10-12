import logging.config

import uvicorn

from chainflow_api.config import Config
from chainflow_api.create_app import create_app


app = create_app(Config())


def main() -> None:
    """Entrypoint of the application."""
    config = Config()
    uvicorn.run(
        'chainflow_api.__main__:app',
        workers=config.WORKERS_COUNT,
        host=config.SERVER_HOST,
        port=config.SERVER_PORT,
        reload=config.RELOAD,
        log_level=config.LOGGING_LEVEL.lower(),
    )


if __name__ == "__main__":
    main()
