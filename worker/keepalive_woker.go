package worker

import (
	"context"
	"time"
	"why-not-script/state"
)

func StartKeepaliveWorker(ctx context.Context, sessions *state.SessionState) {
	if sessions == nil {
		return
	}

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		session, ok := sessions.Get()
		if ok {
			session.Keepalive()
		}

		time.Sleep(60 * time.Second)
	}
}
