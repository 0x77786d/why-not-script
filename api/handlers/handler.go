package handlers

import (
	"why-not-script/state"
	"why-not-script/store"
)

type Handler struct {
	Sessions   *state.SessionState
	QueueStore *store.QueueStore
	LogStore   *store.LogStore
}

func NewHandler(sessions *state.SessionState, queueStore *store.QueueStore, logStore *store.LogStore) *Handler {
	return &Handler{
		Sessions:   sessions,
		QueueStore: queueStore,
		LogStore:   logStore,
	}
}
