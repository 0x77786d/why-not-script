package worker

import (
	"context"
	"time"

	"why-not-script/state"
	"why-not-script/store"
)

func StartQueueWorker(ctx context.Context, sessions *state.SessionState, queueStore *store.QueueStore) {
	if queueStore == nil || sessions == nil {
		return
	}

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		status := "active"
		items, err := queueStore.GetQueueItems(&status)
		if err == nil && len(items) > 0 {
			session, ok := sessions.Get()
			if ok {
				for _, item := range items {
					session.ApplyCourse(item)
					time.Sleep(500 * time.Millisecond)
				}
			}
		}

		time.Sleep(2500 * time.Millisecond)
	}
}
