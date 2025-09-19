package storage

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/ai-trader/data-ingestion/internal/normalizer"
)

type RedisStore struct {
	client *redis.Client
}

func NewRedisStore(uri string) *RedisStore {
	options, err := redis.ParseURL(uri)
	if err != nil {
		panic(err)
	}

	return &RedisStore{client: redis.NewClient(options)}
}

func (s *RedisStore) StoreAggregate(ctx context.Context, payload normalizer.NormalizedEquityAggregate) error {
	bytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	key := "equity:aggregate:" + payload.Symbol
	return s.client.Set(ctx, key, bytes, 15*time.Minute).Err()
}

func (s *RedisStore) StoreQuote(ctx context.Context, payload normalizer.NormalizedOptionQuote) error {
	bytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	key := "options:quote:" + payload.Symbol
	return s.client.Set(ctx, key, bytes, 10*time.Second).Err()
}
