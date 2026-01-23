package state

import (
	"sync"

	"why-not-script/service"
)

type SessionState struct {
	mu      sync.RWMutex
	session *service.StudentSession
}

func NewSessionState() *SessionState {
	return &SessionState{}
}

func (s *SessionState) Set(session *service.StudentSession) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.session = session
}

func (s *SessionState) Get() (*service.StudentSession, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.session == nil {
		return nil, false
	}
	return s.session, true
}

func (s *SessionState) Clear() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.session = nil
}
