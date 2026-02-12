FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock* /app/

RUN uv sync --frozen --no-dev

COPY . /app

EXPOSE 8000

CMD ["uv", "run", "fastapi", "run", "src/focusdive_api/main.py"]
