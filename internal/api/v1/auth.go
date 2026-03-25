package v1

import (
	"Sector/internal/auth"
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"net/http"
	"reflect"

	"go.uber.org/zap"
)

// Global challenge store
var challengeStore = auth.NewChallengeStore()

// LoginRequest represents the login request structure
type LoginRequest struct {
	Username  string `json:"username"`
	Signature string `json:"signature"`
}

// GetChallenge handler for the challenge endpoint
func (s *SectorAPI) GetChallenge(w http.ResponseWriter, r *http.Request, params GetChallengeParams) {
	username := params.Username
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	// Check if user exists
	accounts, err := searchItem(s.DB.Store, reflect.TypeOf(Account{}), map[string]interface{}{
		"username": username,
	})

	if err != nil {
		s.Logger.Error("Error searching for user", zap.Error(err))
		http.Error(w, "Error searching for user", http.StatusInternalServerError)
		return
	}

	if len(accounts) == 0 {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Generate a new challenge
	challenge, err := auth.GenerateChallenge()
	if err != nil {
		s.Logger.Error("Error generating challenge", zap.Error(err))
		http.Error(w, "Error generating challenge", http.StatusInternalServerError)
		return
	}

	// Store the challenge
	challengeStore.Add(username, challenge)

	// Return the challenge to the client
	response := map[string]string{
		"challenge": challenge,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Login handler for the login endpoint
func (s *SectorAPI) Login(w http.ResponseWriter, r *http.Request) {
	var loginReq LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Retrieve the stored challenge
	challenge, found := challengeStore.Get(loginReq.Username)
	if !found {
		http.Error(w, "No active challenge found, please request a new one", http.StatusBadRequest)
		return
	}

	// Find the user
	accounts, err := searchItem(s.DB.Store, reflect.TypeOf(Account{}), map[string]interface{}{
		"username": loginReq.Username,
	})

	if err != nil || len(accounts) == 0 {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if len(accounts) > 1 {
		http.Error(w, "Multiple users found", http.StatusInternalServerError)
		return
	}

	// Get the user account
	var account Account
	err = MapToStruct(accounts[0].(map[string]interface{}), &account)
	if err != nil {
		http.Error(w, "Error parsing account data", http.StatusInternalServerError)
		return
	}

	// Check if the account has a pubkey - use a string field from the map directly
	accountMap := accounts[0].(map[string]interface{})
	pubkey, ok := accountMap["pubkey"].(string)
	if !ok {
		http.Error(w, "User has no public key", http.StatusUnauthorized)
		return
	}

	// Verify the signature
	if ok := verifySignature(challenge, loginReq.Signature, pubkey); !ok {
		http.Error(w, "Invalid signature", http.StatusUnauthorized)
		return
	}

	// Remove the challenge
	challengeStore.Remove(loginReq.Username)

	// Generate JWT token
	token, err := auth.GenerateToken(account.Id.String(), account.Username)
	if err != nil {
		s.Logger.Error("Error generating token", zap.Error(err))
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	// Return token to client
	response := map[string]string{
		"token": token,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// verifySignature verifies that the signature is valid for the given challenge and public key
func verifySignature(challenge, signatureBase64, publicKeyPEM string) bool {
	// Decode the challenge
	challengeBytes, err := base64.StdEncoding.DecodeString(challenge)
	if err != nil {
		fmt.Println("Error decoding challenge:", err)
		return false
	}

	// Decode the signature
	signatureBytes, err := base64.StdEncoding.DecodeString(signatureBase64)
	if err != nil {
		fmt.Println("Error decoding signature:", err)
		return false
	}

	// Parse the public key
	block, _ := pem.Decode([]byte(publicKeyPEM))
	if block == nil {
		fmt.Println("Error decoding PEM block")
		return false
	}

	pubKey, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		fmt.Println("Error parsing public key:", err)
		return false
	}

	rsaPublicKey, ok := pubKey.(*rsa.PublicKey)
	if !ok {
		fmt.Println("Not an RSA public key")
		return false
	}

	// Create hash of the challenge
	hashed := sha256.Sum256(challengeBytes)

	// Verify the signature
	err = rsa.VerifyPKCS1v15(rsaPublicKey, crypto.SHA256, hashed[:], signatureBytes)
	return err == nil
}
