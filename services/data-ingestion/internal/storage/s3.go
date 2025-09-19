package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
)

type S3Sink struct {
	bucket string
}

type archivable interface {
	GetSymbol() string
}

func NewS3Sink(bucket string) *S3Sink {
	return &S3Sink{bucket: bucket}
}

func (s *S3Sink) Archive(ctx context.Context, payload any) error {
	// TODO: implement AWS SDK v2 uploader
	_, _ = json.Marshal(payload)
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}
	fmt.Printf("archiving payload to bucket %s\n", s.bucket)
	return nil
}
