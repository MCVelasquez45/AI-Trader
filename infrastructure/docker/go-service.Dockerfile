FROM golang:1.23 as builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/ingestor ./cmd/ingestor

FROM gcr.io/distroless/base-debian12
COPY --from=builder /app/ingestor /app/ingestor
ENTRYPOINT ["/app/ingestor"]
