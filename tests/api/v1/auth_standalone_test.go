package v1Test

import (
	"Sector/internal/api"
	v1 "Sector/internal/api/v1"
	"Sector/internal/config"
	"Sector/internal/database"
	"context"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/stretchr/testify/require"
)

// setupAuthSuite sets up a test environment for authentication tests
func setupAuthSuite(t *testing.T) (*httptest.Server, *v1.SectorAPI, v1.Account, *rsa.PrivateKey, func()) {
	config.LoadEnv()

	// Create a test instance of the API
	tmpDir, clean := database.TestingTempDir(t, "sectordb_auth_cache_test")

	router := mux.NewRouter().StrictSlash(true)
	testSectorAPI := v1.NewTestingSector(context.Background(), "log_test.txt", tmpDir, t)
	api.AddV1SectorAPIToRouter(router, testSectorAPI)

	server := httptest.NewServer(router)

	// Generate test key pair
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	require.NoError(t, err)

	// Encode public key to PEM format
	pubKeyBytes, err := x509.MarshalPKIXPublicKey(&privateKey.PublicKey)
	require.NoError(t, err)
	pubKeyPEM := pem.EncodeToMemory(
		&pem.Block{
			Type:  "RSA PUBLIC KEY",
			Bytes: pubKeyBytes,
		},
	)

	// Create test user with the public key
	now := time.Now()
	testUser := v1.Account{
		Id:         uuid.New(),
		CreatedAt:  &now,
		Username:   "testuser",
		ProfilePic: "",
		Pubkey:     string(pubKeyPEM),
	}

	// Add user to database
	_, err = testSectorAPI.DB.Store.Put(context.Background(), v1.StructToMap(testUser))
	require.NoError(t, err)

	return server, testSectorAPI, testUser, privateKey, func() {
		testSectorAPI.DB.Disconnect()
		server.Close()
		clean()
	}
}

// authRequestEditorStandalone adds the JWT token to the request for standalone tests
// authRequestEditorStandalone adds the JWT token to the request for standalone tests
func authRequestEditorStandalone(token string) v1.RequestEditorFn {
	return func(ctx context.Context, req *http.Request) error {
		req.Header.Set("Authorization", "Bearer "+token)
		return nil
	}
}

func TestAuthenticationStandalone(t *testing.T) {
	// Setup test environment
	server, _, testAccount, privateKey, cleanup := setupAuthSuite(t)
	defer cleanup()

	testClient, err := v1.NewClientWithResponses(server.URL, v1.WithHTTPClient(server.Client()), v1.WithBaseURL(server.URL+"/v1/api"))
	require.NoError(t, err)

	t.Run("Authentication Flow", func(t *testing.T) {
		username := testAccount.Username

		// Step 1: Get Challenge
		challengeRequestBody := v1.GetChallengeParams{
			Username: username,
		}
		challengeResponse, err := testClient.GetChallengeWithResponse(context.Background(), &challengeRequestBody)
		require.NoError(t, err)
		require.Equal(t, 200, challengeResponse.StatusCode())

		var challengeResponseJson map[string]interface{}
		err = json.Unmarshal(challengeResponse.Body, &challengeResponseJson)
		require.NoError(t, err)

		// Step 2: Sign the challenge
		decoded, err := base64.StdEncoding.DecodeString(challengeResponseJson["challenge"].(string))
		require.NoError(t, err)
		hashed := sha256.Sum256(decoded)
		signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, hashed[:])
		require.NoError(t, err, "Should sign the challenge without error")

		signatureBase64 := base64.StdEncoding.EncodeToString(signature)
		require.NotEmpty(t, signatureBase64, "Signature should not be empty")

		// Step 3: Login with signature
		loginRequestBody := v1.LoginJSONRequestBody{
			Username:  &username,
			Signature: &signatureBase64,
		}
		loginResponse, err := testClient.LoginWithResponse(context.Background(), loginRequestBody)
		require.NoError(t, err)
		require.Equal(t, 200, loginResponse.StatusCode())

		var loginResponseJson map[string]interface{}
		err = json.Unmarshal(loginResponse.Body, &loginResponseJson)
		require.NoError(t, err)
		require.NotNil(t, loginResponseJson["token"], "JWT token should be present in the response")

		// Step 4: Test accessing a protected endpoint with JWT Token
		tokenStr := loginResponseJson["token"].(string)
		authorizedReq, err := testClient.GetAccountByIDWithResponse(context.Background(), testAccount.Id, authRequestEditor(tokenStr))
		require.NoError(t, err)
		require.Equal(t, 200, authorizedReq.StatusCode())

		// Step 5: Test accessing a protected endpoint without JWT Token
		unauthorizedReq, err := testClient.GetAccountByIDWithResponse(context.Background(), testAccount.Id)
		require.NoError(t, err)
		require.Equal(t, 401, unauthorizedReq.StatusCode())

		// Step 6: Test accessing a protected endpoint with an invalid JWT Token
		maliciousReq, err := testClient.GetAccountByIDWithResponse(context.Background(), testAccount.Id, authRequestEditor("INVALID_TOKEN"))
		require.NoError(t, err)
		require.Equal(t, 401, maliciousReq.StatusCode())
	})

	t.Run("JWT Token Persistence", func(t *testing.T) {
		// This test validates that the JWT token remains valid across multiple requests
		// Step 1: Get a valid token
		username := testAccount.Username

		challengeReqParams := v1.GetChallengeParams{
			Username: username,
		}
		challengeResp, err := testClient.GetChallengeWithResponse(context.Background(), &challengeReqParams)
		require.NoError(t, err)

		var challengeData map[string]interface{}
		err = json.Unmarshal(challengeResp.Body, &challengeData)
		require.NoError(t, err)

		decoded, err := base64.StdEncoding.DecodeString(challengeData["challenge"].(string))
		require.NoError(t, err)

		hashed := sha256.Sum256(decoded)
		signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, hashed[:])
		require.NoError(t, err)

		signatureB64 := base64.StdEncoding.EncodeToString(signature)

		loginBody := v1.LoginJSONRequestBody{
			Username:  &username,
			Signature: &signatureB64,
		}

		loginResp, err := testClient.LoginWithResponse(context.Background(), loginBody)
		require.NoError(t, err)

		var loginData map[string]interface{}
		err = json.Unmarshal(loginResp.Body, &loginData)
		require.NoError(t, err)

		tokenStr := loginData["token"].(string)
		require.NotEmpty(t, tokenStr)

		// Step 2: Make multiple requests with the same token
		for i := 0; i < 3; i++ {
			resp, err := testClient.GetAccountByIDWithResponse(context.Background(), testAccount.Id, authRequestEditor(tokenStr))
			require.NoError(t, err)
			require.Equal(t, 200, resp.StatusCode(), fmt.Sprintf("Request %d failed", i+1))
		}
	})

	t.Run("Invalid Authentication Attempts", func(t *testing.T) {
		// Test 1: Invalid username
		challengeParams := v1.GetChallengeParams{
			Username: "nonexistentuser",
		}
		challengeResp, err := testClient.GetChallengeWithResponse(context.Background(), &challengeParams)
		require.NoError(t, err)
		require.Equal(t, 404, challengeResp.StatusCode())

		// Test 2: Invalid signature
		username := testAccount.Username
		validChallengeParams := v1.GetChallengeParams{
			Username: username,
		}
		validChallengeResp, err := testClient.GetChallengeWithResponse(context.Background(), &validChallengeParams)
		require.NoError(t, err)
		require.Equal(t, 200, validChallengeResp.StatusCode())

		invalidSignature := "invalidSignatureBase64Data"
		loginBody := v1.LoginJSONRequestBody{
			Username:  &username,
			Signature: &invalidSignature,
		}

		loginResp, err := testClient.LoginWithResponse(context.Background(), loginBody)
		require.NoError(t, err)
		require.Equal(t, 401, loginResp.StatusCode())
	})
}
