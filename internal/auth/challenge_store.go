package auth

import (
	"sync"
	"time"
)

// ChallengeStore manages authentication challenges
type ChallengeStore struct {
	challenges map[string]Challenge
	mu         sync.RWMutex
}

// Challenge represents an authentication challenge
type Challenge struct {
	Value     string
	CreatedAt time.Time
}

// NewChallengeStore creates a new challenge store
func NewChallengeStore() *ChallengeStore {
	return &ChallengeStore{
		challenges: make(map[string]Challenge),
	}
}

// Add adds a challenge for a user
func (s *ChallengeStore) Add(username, challenge string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.challenges[username] = Challenge{
		Value:     challenge,
		CreatedAt: time.Now(),
	}

	// Start a cleanup goroutine to remove expired challenges
	go s.cleanupExpired(username, 5*time.Minute)
}

// Get retrieves a challenge for a user
func (s *ChallengeStore) Get(username string) (string, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	challenge, exists := s.challenges[username]
	if !exists {
		return "", false
	}

	// Check if the challenge has expired (10 minutes)
	if time.Since(challenge.CreatedAt) > 10*time.Minute {
		return "", false
	}

	return challenge.Value, true
}

// Remove removes a challenge for a user
func (s *ChallengeStore) Remove(username string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.challenges, username)
}

// cleanupExpired removes a challenge after it expires
func (s *ChallengeStore) cleanupExpired(username string, after time.Duration) {
	time.Sleep(after)
	s.Remove(username)
}
