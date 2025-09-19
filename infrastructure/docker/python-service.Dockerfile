FROM python:3.11-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
COPY pyproject.toml* poetry.lock* requirements.txt* ./ 2>/dev/null || true
RUN pip install --no-cache-dir uvicorn
COPY . .
RUN pip install --no-cache-dir .
EXPOSE 7000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7000"]
