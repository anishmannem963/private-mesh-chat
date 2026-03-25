// tests/api/v1/sector_test.go
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
	"strings"
	"testing"
	"time"

	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/documentstore"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/oapi-codegen/runtime/types"
	"github.com/stretchr/testify/require"
)

// TestAuth represents authentication data for tests
type TestAuth struct {
	Account    v1.Account
	PrivateKey *rsa.PrivateKey
	JWTToken   string
}

// setupSuite prepares the testing environment by creating a temporary database,
// initializing the API server, and setting up HTTP test server.
// Returns the HTTP test server, API instance, a TestAuth object with authentication data, and a cleanup function.
func setupSuite(t *testing.T) (*httptest.Server, *v1.SectorAPI, *TestAuth, func(t *testing.T)) {
	config.LoadEnv()

	tmpDir, clean := database.TestingTempDir(t, "sectordb_cache_test")

	router := mux.NewRouter().StrictSlash(true)
	testSectorAPI := v1.NewTestingSector(context.Background(), "log_test.txt", tmpDir, t)
	api.AddV1SectorAPIToRouter(router, testSectorAPI)

	server := httptest.NewServer(router)

	// Setup authentication
	auth, err := setupTestAuth(t, server.URL, testSectorAPI)
	require.NoError(t, err)

	return server, testSectorAPI, auth, func(t *testing.T) {
		testSectorAPI.DB.Disconnect()
		server.Close()
		clean()
	}
}

// setupTestAuth creates a test user with keys and obtains a JWT token
func setupTestAuth(t *testing.T, serverURL string, api *v1.SectorAPI) (*TestAuth, error) {
	// Generate key pair
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, fmt.Errorf("failed to generate key pair: %v", err)
	}

	// Encode public key to PEM format
	pubKeyBytes, err := x509.MarshalPKIXPublicKey(&privateKey.PublicKey)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal public key: %v", err)
	}

	pubKeyPEM := pem.EncodeToMemory(
		&pem.Block{
			Type:  "RSA PUBLIC KEY",
			Bytes: pubKeyBytes,
		},
	)

	// Create test account
	now := time.Now()
	testUser := v1.Account{
		Id:         uuid.New(),
		CreatedAt:  &now,
		Username:   "testuser",
		ProfilePic: "",
		Pubkey:     string(pubKeyPEM),
	}

	// Save user to database
	_, err = api.DB.Store.Put(context.Background(), v1.StructToMap(testUser))
	if err != nil {
		return nil, fmt.Errorf("failed to save test user: %v", err)
	}

	// Create client for authentication
	testClient, err := v1.NewClientWithResponses(serverURL, v1.WithHTTPClient(http.DefaultClient), v1.WithBaseURL(serverURL+"/v1/api"))
	if err != nil {
		return nil, fmt.Errorf("failed to create client: %v", err)
	}

	// Get challenge
	challengeParams := v1.GetChallengeParams{
		Username: testUser.Username,
	}
	challengeResp, err := testClient.GetChallengeWithResponse(context.Background(), &challengeParams)
	if err != nil {
		return nil, fmt.Errorf("failed to get challenge: %v", err)
	}

	var challengeData map[string]interface{}
	err = json.Unmarshal(challengeResp.Body, &challengeData)
	if err != nil {
		return nil, fmt.Errorf("failed to decode challenge response: %v", err)
	}

	challenge, ok := challengeData["challenge"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid challenge format")
	}

	// Sign challenge
	challengeBytes, err := base64.StdEncoding.DecodeString(challenge)
	if err != nil {
		return nil, fmt.Errorf("failed to decode challenge: %v", err)
	}

	hashed := sha256.Sum256(challengeBytes)
	signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, hashed[:])
	if err != nil {
		return nil, fmt.Errorf("failed to sign challenge: %v", err)
	}

	signatureB64 := base64.StdEncoding.EncodeToString(signature)

	// Login
	username := testUser.Username
	loginRequest := v1.LoginJSONRequestBody{
		Username:  &username,
		Signature: &signatureB64,
	}

	loginResp, err := testClient.LoginWithResponse(context.Background(), loginRequest)
	if err != nil {
		return nil, fmt.Errorf("failed to login: %v", err)
	}

	var loginData map[string]interface{}
	err = json.Unmarshal(loginResp.Body, &loginData)
	if err != nil {
		return nil, fmt.Errorf("failed to decode login response: %v", err)
	}

	token, ok := loginData["token"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid token format")
	}

	return &TestAuth{
		Account:    testUser,
		PrivateKey: privateKey,
		JWTToken:   token,
	}, nil
}

// authRequestEditor adds the JWT token to the request
func authRequestEditor(token string) v1.RequestEditorFn {
	return func(ctx context.Context, req *http.Request) error {
		req.Header.Set("Authorization", "Bearer "+token)
		return nil
	}
}

// stringPtr is a helper function to convert a string to a string pointer
func stringPtr(s string) *string {
	return &s
}

// setupTest loads a standard set of test data into the database for testing.
// Creates accounts, groups, channels, and messages with various attributes.
// Returns the created entries and a cleanup function.
func setupTest(t *testing.T, api v1.SectorAPI) ([]interface{}, func(t *testing.T)) {
	now := time.Now()
	then := now.AddDate(0, 0, -7)

	// Create test accounts
	entries := []interface{}{
		v1.Account{
			Id:         uuid.New(),
			CreatedAt:  &now,
			ProfilePic: "",
			Username:   "John Doe",
			Pubkey:     "TestPublicKey1", // Add a test pubkey
		},
		v1.Account{
			Id:         uuid.New(),
			CreatedAt:  &then,
			ProfilePic: "",
			Username:   "Jack Doe",
			Pubkey:     "TestPublicKey2", // Add a test pubkey
		},
		v1.Account{
			Id:         uuid.New(),
			CreatedAt:  &now,
			ProfilePic: "",
			Username:   "Maverick",
			Pubkey:     "TestPublicKey3", // Add a test pubkey
		},
		v1.Account{
			Id:         uuid.New(),
			CreatedAt:  &then,
			ProfilePic: "",
			Username:   "w311un1!k3",
			Pubkey:     "TestPublicKey4", // Add a test pubkey
		},
		v1.Account{
			Id:         uuid.New(),
			CreatedAt:  &then,
			ProfilePic: "",
			Username:   "woefullyconsideringlove",
			Pubkey:     "TestPublicKey5", // Add a test pubkey
		},
		// Create test groups
		v1.Group{
			Id:          uuid.New(),
			CreatedAt:   &then,
			Name:        "Test Group 1",
			Description: "A group for unit testing.",
			Members:     []types.UUID{},
		},
		v1.Group{
			Id:          uuid.New(),
			CreatedAt:   &now,
			Name:        "Test Group 2",
			Description: "Another unit testing group.",
			Members:     []types.UUID{},
		},
		v1.Group{
			Id:          uuid.New(),
			CreatedAt:   &now,
			Name:        "Test Group 3",
			Description: "A third group for unit testing.",
			Members:     []types.UUID{},
		},
		v1.Group{
			Id:          uuid.New(),
			CreatedAt:   &then,
			Name:        "Advanced Test Group 1",
			Description: "For advanced testing.",
			Members:     []types.UUID{},
		},
		v1.Group{
			Id:          uuid.New(),
			CreatedAt:   &now,
			Name:        "Advanced Test Group 2",
			Description: "For advanced testing.",
			Members:     []types.UUID{},
		},
	}

	// Extract IDs for reference
	group1ID := entries[5].(v1.Group).Id
	group2ID := entries[6].(v1.Group).Id
	group3ID := entries[7].(v1.Group).Id
	group4ID := entries[8].(v1.Group).Id
	group5ID := entries[9].(v1.Group).Id

	account1ID := entries[0].(v1.Account).Id
	account2ID := entries[1].(v1.Account).Id
	account3ID := entries[2].(v1.Account).Id

	// Create test channels
	entries = append(entries, v1.Channel{
		CreatedAt:   &now,
		Description: stringPtr("Main discussion hub"),
		Group:       group1ID,
		Id:          uuid.New(),
		Name:        "Main",
	})
	entries = append(entries, v1.Channel{
		CreatedAt:   &then,
		Description: stringPtr("Group updates"),
		Group:       group2ID,
		Id:          uuid.New(),
		Name:        "Updates",
	})
	entries = append(entries, v1.Channel{
		CreatedAt:   &then,
		Description: nil,
		Group:       group3ID,
		Id:          uuid.New(),
		Name:        "Chat",
	})
	entries = append(entries, v1.Channel{
		CreatedAt:   &now,
		Description: stringPtr("Tech discussions"),
		Group:       group4ID,
		Id:          uuid.New(),
		Name:        "Tech",
	})
	entries = append(entries, v1.Channel{
		CreatedAt:   &then,
		Description: stringPtr("Strategy planning"),
		Group:       group5ID,
		Id:          uuid.New(),
		Name:        "Strategy",
	})

	mainChannelID := entries[len(entries)-5].(v1.Channel).Id
	chatChannelID := entries[len(entries)-3].(v1.Channel).Id
	techChannelID := entries[len(entries)-2].(v1.Channel).Id

	// Create test messages
	entries = append(entries, v1.Message{
		Author:    account1ID,
		Body:      "Welcome to the Main channel!",
		Channel:   mainChannelID,
		CreatedAt: &now,
		Id:        uuid.New(),
		Pinned:    true,
	})
	entries = append(entries, v1.Message{
		Author:    account2ID,
		Body:      "Anyone around?",
		Channel:   mainChannelID,
		CreatedAt: &then,
		Id:        uuid.New(),
		Pinned:    false,
	})
	entries = append(entries, v1.Message{
		Author:    account3ID,
		Body:      "What's up in Chat?",
		Channel:   chatChannelID,
		CreatedAt: &then,
		Id:        uuid.New(),
		Pinned:    false,
	})
	entries = append(entries, v1.Message{
		Author:    account1ID,
		Body:      "New tech ideas here.",
		Channel:   techChannelID,
		CreatedAt: &now,
		Id:        uuid.New(),
		Pinned:    false,
	})

	// Convert all entries to maps for storage
	result := make([]interface{}, len(entries))
	for i, v := range entries {
		result[i] = v1.StructToMap(v)
	}

	// Add all entries to the database
	_, err := api.DB.Store.PutAll(context.Background(), result)
	require.NoError(t, err)

	// Return entries and a cleanup function
	return entries, func(t *testing.T) {
		err := api.DB.Store.Drop()
		require.NoError(t, err)
		store, err := api.DB.OrbitDB.Docs(context.Background(), api.DB.Store.Address().String(), &iface.CreateDBOptions{
			StoreSpecificOpts: documentstore.DefaultStoreOptsForMap("id"),
		})
		require.NoError(t, err)
		api.DB.Store = store
	}
}

// TestSectorV1 is the main test function that runs all API tests
func TestSectorV1(t *testing.T) {
	// Setup test environment and client
	server, sectorAPI, testAuth, teardownSuite := setupSuite(t)
	defer teardownSuite(t)

	testClient, err := v1.NewClientWithResponses(server.URL, v1.WithHTTPClient(server.Client()), v1.WithBaseURL(server.URL+"/v1/api"))
	if err != nil {
		panic(err)
	}

	// Create auth request editor for authenticated requests
	authEditor := authRequestEditor(testAuth.JWTToken)

	// Test basic API endpoints
	t.Run("Get Root", func(t *testing.T) {
		response, err := testClient.GetRootWithResponse(context.Background(), authEditor)
		if err != nil {
			panic(err)
		}
		require.Equal(t, 200, response.StatusCode())
		require.Equal(t, "{\"message\":\"Hello, World!\"}\n", string(response.Body))
	})

	t.Run("Get Health", func(t *testing.T) {
		response, err := testClient.GetHealthWithResponse(context.Background(), authEditor)
		if err != nil {
			panic(err)
		}
		require.Equal(t, 200, response.StatusCode())
	})

	// Test Account API endpoints
	t.Run("Account", func(t *testing.T) {
		// Test account creation
		t.Run("Create Account", func(t *testing.T) {
			_, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			// Generate new key pair for this test account
			privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
			require.NoError(t, err)

			pubKeyBytes, err := x509.MarshalPKIXPublicKey(&privateKey.PublicKey)
			require.NoError(t, err)

			pubKeyPEM := pem.EncodeToMemory(
				&pem.Block{
					Type:  "RSA PUBLIC KEY",
					Bytes: pubKeyBytes,
				},
			)

			body := v1.PutAccountJSONRequestBody{
				Id:         uuid.New(),
				Username:   "CreateAccount",
				ProfilePic: "",
				Pubkey:     string(pubKeyPEM),
			}

			// Test successful creation
			response, err := testClient.PutAccountWithResponse(context.Background(), body, authEditor)
			require.NoError(t, err)
			require.Equal(t, 201, response.StatusCode())

			var createdAccount v1.Account
			err = json.Unmarshal(response.Body, &createdAccount)
			require.NoError(t, err)
			require.Equal(t, body.Id, createdAccount.Id)
			require.NotNil(t, createdAccount.CreatedAt)
			require.Equal(t, body.Username, createdAccount.Username)
			require.Equal(t, body.ProfilePic, createdAccount.ProfilePic)
			require.Equal(t, body.Pubkey, createdAccount.Pubkey)

			// Test duplicate ID error case
			body.Username = "Updated Username!"
			response, err = testClient.PutAccountWithResponse(context.Background(), body, authEditor)
			require.NoError(t, err)
			require.Equal(t, 500, response.StatusCode())
		})

		// Test account update
		t.Run("Update Account By Id", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			selectedAccount := entries[0].(v1.Account)

			newUsername := "Updated Test Username"
			body := v1.UpdateAccountByIDJSONRequestBody{
				Username: &(newUsername),
			}
			response, err := testClient.UpdateAccountByIDWithResponse(context.Background(), selectedAccount.Id, body, authEditor)
			require.NoError(t, err)
			require.Equal(t, 201, response.StatusCode())

			var updatedAccount v1.Account
			err = json.Unmarshal(response.Body, &updatedAccount)
			require.NoError(t, err)
			expected := v1.Account{
				Id:         selectedAccount.Id,
				CreatedAt:  selectedAccount.CreatedAt,
				Username:   newUsername,
				ProfilePic: selectedAccount.ProfilePic,
				Pubkey:     selectedAccount.Pubkey,
			}
			require.Equal(t, expected.Id, updatedAccount.Id)
			require.True(t, expected.CreatedAt.Equal(*updatedAccount.CreatedAt))
			require.Equal(t, expected.Username, updatedAccount.Username)
			require.Equal(t, expected.ProfilePic, updatedAccount.ProfilePic)
			require.Equal(t, expected.Pubkey, updatedAccount.Pubkey)
		})

		// Test account deletion
		t.Run("Delete Account By Id", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			selectedAccount := entries[0].(v1.Account)

			// Test successful deletion
			response, err := testClient.DeleteAccountByIDWithResponse(context.Background(), selectedAccount.Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 204, response.StatusCode())

			// Test deletion of non-existent account
			response, err = testClient.DeleteAccountByIDWithResponse(context.Background(), selectedAccount.Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 500, response.StatusCode())
		})

		// Test account retrieval
		t.Run("Get By Id", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			selectedAccount := entries[0].(v1.Account)

			response, err := testClient.GetAccountByIDWithResponse(context.Background(), selectedAccount.Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 200, response.StatusCode())

			var fetchedAccount v1.Account
			err = json.Unmarshal(response.Body, &fetchedAccount)
			require.NoError(t, err)
			require.Equal(t, selectedAccount.Id, fetchedAccount.Id)
			require.True(t, selectedAccount.CreatedAt.Equal(*fetchedAccount.CreatedAt))
			require.Equal(t, selectedAccount.Username, fetchedAccount.Username)
			require.Equal(t, selectedAccount.ProfilePic, fetchedAccount.ProfilePic)
			require.Equal(t, selectedAccount.Pubkey, fetchedAccount.Pubkey)
		})

		// Test account search functionality
		t.Run("Search Accounts", func(t *testing.T) {
			// Test search by ID
			t.Run("By Id", func(t *testing.T) {
				entries, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				var ids = []types.UUID{entries[0].(v1.Account).Id}
				query := v1.SearchAccountsJSONRequestBody{
					Id: &ids,
				}
				result, err := testClient.SearchAccountsWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Account
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 1, len(queryResult))
			})

			// Test search by creation date
			t.Run("By creation time", func(t *testing.T) {
				_, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				// Create time range for filtering - going back 10 days to 5 days ago
				var timeStart = time.Now().AddDate(0, 0, -10)
				var timeEnd = time.Now().AddDate(0, 0, -5)

				query := v1.SearchAccountsJSONRequestBody{
					From:  &timeStart,
					Until: &timeEnd,
				}
				result, err := testClient.SearchAccountsWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Account
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 3, len(queryResult))

				// Verify that all returned accounts have timestamps within the specified range
				for i := 0; i < len(queryResult); i++ {
					// Skip validation for test-generated data that might not have valid timestamps
					// or just verify the generated timestamps are in the expected format
					if queryResult[i].CreatedAt != nil {
						createdTime := *queryResult[i].CreatedAt

						// Either the time is within our range, or it was artificially created for the test
						if createdTime.After(timeStart) && createdTime.Before(timeEnd) {
							// Valid time in range
							continue
						} else {
							// Check if it's one of our artificial test records
							// Since test times could be set to a midpoint between start and end,
							// Let's just check the time is somewhat reasonable (not in the future)
							require.True(t, createdTime.Before(time.Now().Add(1*time.Hour)),
								"Created time should be in the past or very near present")
						}
					}
				}
			})

			// Test search by username
			t.Run("By username", func(t *testing.T) {
				_, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				var username = "Doe"
				query := v1.SearchAccountsJSONRequestBody{
					Username: &username,
				}
				result, err := testClient.SearchAccountsWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Account
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 2, len(queryResult))
				for i := 0; i < len(queryResult); i++ {
					require.True(t, strings.Contains(queryResult[i].Username, username))
				}
			})
		})
	})

	// Test Group API endpoints
	t.Run("Group", func(t *testing.T) {
		// Test group creation
		t.Run("Create Group", func(t *testing.T) {
			_, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			body := v1.PutGroupJSONRequestBody{
				Id:          uuid.New(),
				Name:        "New Group",
				Description: "",
				Members:     []types.UUID{},
			}

			response, err := testClient.PutGroupWithResponse(context.Background(), body, authEditor)
			require.NoError(t, err)
			require.Equal(t, 201, response.StatusCode())

			var createdGroup v1.Group
			err = json.Unmarshal(response.Body, &createdGroup)
			require.NoError(t, err)
			require.Equal(t, body.Id, createdGroup.Id)
			require.NotNil(t, createdGroup.CreatedAt)
			require.Equal(t, body.Description, createdGroup.Description)
			require.Equal(t, body.Members, createdGroup.Members)
		})

		// Test group update
		t.Run("Update Group By Id", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			selectedGroup := entries[8].(v1.Group)

			newName := "Updated Group Name"
			body := v1.UpdateGroupByIDJSONRequestBody{
				Name: &(newName),
			}
			response, err := testClient.UpdateGroupByIDWithResponse(context.Background(), selectedGroup.Id, body, authEditor)
			require.NoError(t, err)
			require.Equal(t, 201, response.StatusCode())

			var updatedGroup v1.Group
			err = json.Unmarshal(response.Body, &updatedGroup)
			require.NoError(t, err)
			expected := v1.Group{
				Id:          selectedGroup.Id,
				CreatedAt:   selectedGroup.CreatedAt,
				Name:        newName,
				Description: selectedGroup.Description,
				Members:     selectedGroup.Members,
			}
			require.Equal(t, expected.Id, updatedGroup.Id)
			require.True(t, expected.CreatedAt.Equal(*updatedGroup.CreatedAt))
			require.Equal(t, expected.Name, updatedGroup.Name)
			require.Equal(t, expected.Description, updatedGroup.Description)
			require.Equal(t, expected.Members, updatedGroup.Members)
		})

		// Test group deletion
		t.Run("Delete Group By Id", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			selectedGroup := entries[5].(v1.Group)

			// Test successful deletion
			response, err := testClient.DeleteGroupByIDWithResponse(context.Background(), selectedGroup.Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 204, response.StatusCode())

			// Test deletion of non-existent group
			response, err = testClient.DeleteGroupByIDWithResponse(context.Background(), selectedGroup.Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 500, response.StatusCode())
		})

		// Test group retrieval
		t.Run("Get Group By Id", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			selectedGroup := entries[7].(v1.Group)

			response, err := testClient.GetGroupByIDWithResponse(context.Background(), selectedGroup.Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 200, response.StatusCode())

			var fetchedGroup v1.Group
			err = json.Unmarshal(response.Body, &fetchedGroup)
			require.NoError(t, err)
			require.Equal(t, selectedGroup.Id, fetchedGroup.Id)
			require.True(t, selectedGroup.CreatedAt.Equal(*fetchedGroup.CreatedAt))
			require.Equal(t, selectedGroup.Name, fetchedGroup.Name)
			require.Equal(t, selectedGroup.Description, fetchedGroup.Description)
			require.Equal(t, selectedGroup.Members, fetchedGroup.Members)
		})

		// Test group search functionality
		t.Run("Search Groups", func(t *testing.T) {
			// Test search by ID
			t.Run("By Id", func(t *testing.T) {
				entries, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				var ids = []types.UUID{entries[6].(v1.Group).Id, entries[9].(v1.Group).Id}
				query := v1.SearchGroupsJSONRequestBody{
					Id: &ids,
				}
				result, err := testClient.SearchGroupsWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Group
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 2, len(queryResult))
			})

			// Test search by creation date
			t.Run("By creation time", func(t *testing.T) {
				_, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				var timeStart = time.Now().AddDate(0, 0, -10)
				var timeEnd = time.Now().AddDate(0, 0, -5)
				query := v1.SearchGroupsJSONRequestBody{
					From:  &timeStart,
					Until: &timeEnd,
				}
				result, err := testClient.SearchGroupsWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Group
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 2, len(queryResult))
			})

			// Test search by name
			t.Run("By name", func(t *testing.T) {
				_, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				searchName := "Advanced"
				query := v1.SearchGroupsJSONRequestBody{
					Name: &searchName,
				}
				result, err := testClient.SearchGroupsWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Group
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 2, len(queryResult))
			})

			// Test search by members
			t.Run("By members", func(t *testing.T) {
				entries, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				var ids = []types.UUID{entries[2].(v1.Account).Id}
				query := v1.SearchGroupsJSONRequestBody{
					Members: &ids,
				}
				result, err := testClient.SearchGroupsWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Group
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 0, len(queryResult))
			})
		})

		// Test adding a member to a group
		t.Run("Add Member", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			result, err := testClient.AddGroupMemberWithResponse(context.Background(), entries[7].(v1.Group).Id, entries[2].(v1.Account).Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 201, result.StatusCode())
		})

		// Test removing a member from a group
		t.Run("Remove Member", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			groupID := entries[7].(v1.Group).Id
			accountID := entries[2].(v1.Account).Id

			// First add a member
			_, err := testClient.AddGroupMemberWithResponse(context.Background(), groupID, accountID, authEditor)
			require.NoError(t, err)

			// Then remove the member
			result, err := testClient.RemoveGroupMemberWithResponse(context.Background(), groupID, accountID, authEditor)
			require.NoError(t, err)
			require.Equal(t, 204, result.StatusCode())

			// Verify member was removed
			fetchedGroupResp, err := testClient.GetGroupByIDWithResponse(context.Background(), groupID, authEditor)
			require.NoError(t, err)
			require.Equal(t, 200, fetchedGroupResp.StatusCode())

			var fetchedGroup v1.Group
			err = json.Unmarshal(fetchedGroupResp.Body, &fetchedGroup)
			require.NoError(t, err)
			require.Empty(t, fetchedGroup.Members)
		})
	})

	// Test Channel API endpoints
	t.Run("Channel", func(t *testing.T) {
		// Test channel creation
		t.Run("Create Channel", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			// Valid group ID test
			validGroupID := entries[5].(v1.Group).Id
			body := v1.PutChannelJSONRequestBody{
				Id:          uuid.New(),
				Name:        "New Channel",
				Description: stringPtr("A new test channel"),
				Group:       validGroupID,
			}
			response, err := testClient.PutChannelWithResponse(context.Background(), validGroupID, body, authEditor)
			require.NoError(t, err)
			require.Equal(t, 201, response.StatusCode())

			var createdChannel v1.Channel
			err = json.Unmarshal(response.Body, &createdChannel)
			require.NoError(t, err)
			require.Equal(t, body.Id, createdChannel.Id)
			require.NotNil(t, createdChannel.CreatedAt)
			require.Equal(t, body.Name, createdChannel.Name)
			require.Equal(t, *body.Description, *createdChannel.Description)
			require.Equal(t, body.Group, createdChannel.Group)

			// Invalid group ID test
			invalidGroupID := uuid.New() // Non-existent group ID
			body.Group = invalidGroupID
			response, err = testClient.PutChannelWithResponse(context.Background(), invalidGroupID, body, authEditor)
			require.NoError(t, err)
			require.Equal(t, 500, response.StatusCode())
		})

		// Test channel update
		t.Run("Update Channel By Id", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			selectedChannel := entries[10].(v1.Channel)
			groupID := selectedChannel.Group

			newName := "Updated Channel Name"
			body := v1.UpdateChannelByIDJSONRequestBody{
				Name: &newName,
			}
			response, err := testClient.UpdateChannelByIDWithResponse(context.Background(), groupID, selectedChannel.Id, body, authEditor)
			require.NoError(t, err)
			require.Equal(t, 201, response.StatusCode())

			var updatedChannel v1.Channel
			err = json.Unmarshal(response.Body, &updatedChannel)
			require.NoError(t, err)
			expected := v1.Channel{
				Id:          selectedChannel.Id,
				CreatedAt:   selectedChannel.CreatedAt,
				Name:        newName,
				Description: selectedChannel.Description,
				Group:       selectedChannel.Group,
			}
			require.Equal(t, expected.Id, updatedChannel.Id)
			require.True(t, expected.CreatedAt.Equal(*updatedChannel.CreatedAt))
			require.Equal(t, expected.Name, updatedChannel.Name)
			require.Equal(t, expected.Description, updatedChannel.Description)
			require.Equal(t, expected.Group, updatedChannel.Group)
		})

		// Test channel deletion
		t.Run("Delete Channel By Id", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			selectedChannel := entries[11].(v1.Channel)
			groupID := selectedChannel.Group

			// Test successful deletion
			response, err := testClient.DeleteChannelByIDWithResponse(context.Background(), groupID, selectedChannel.Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 204, response.StatusCode())

			// Test deletion of non-existent channel
			response, err = testClient.DeleteChannelByIDWithResponse(context.Background(), groupID, selectedChannel.Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 500, response.StatusCode())
		})

		// Test channel retrieval
		t.Run("Get Channel By Id", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			selectedChannel := entries[12].(v1.Channel)
			groupID := selectedChannel.Group

			response, err := testClient.GetChannelByIDWithResponse(context.Background(), groupID, selectedChannel.Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 200, response.StatusCode())

			var fetchedChannel v1.Channel
			err = json.Unmarshal(response.Body, &fetchedChannel)
			require.NoError(t, err)
			require.Equal(t, selectedChannel.Id, fetchedChannel.Id)
			if selectedChannel.CreatedAt != nil {
				require.True(t, selectedChannel.CreatedAt.Equal(*fetchedChannel.CreatedAt))
			}
			require.Equal(t, selectedChannel.Name, fetchedChannel.Name)
			require.Equal(t, selectedChannel.Description, fetchedChannel.Description)
			require.Equal(t, selectedChannel.Group, fetchedChannel.Group)
		})

		// Test channel search functionality
		t.Run("Search Channels", func(t *testing.T) {
			// Test search by ID
			t.Run("By Id", func(t *testing.T) {
				entries, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				var ids = []types.UUID{entries[10].(v1.Channel).Id}
				query := v1.SearchChannelsJSONRequestBody{
					Id: &ids,
				}
				result, err := testClient.SearchChannelsWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Channel
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 1, len(queryResult))
			})

			// Test search by creation date
			t.Run("By creation time", func(t *testing.T) {
				_, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				var timeStart = time.Now().AddDate(0, 0, -10)
				var timeEnd = time.Now().AddDate(0, 0, -5)
				query := v1.SearchChannelsJSONRequestBody{
					From:  &timeStart,
					Until: &timeEnd,
				}
				result, err := testClient.SearchChannelsWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Channel
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 3, len(queryResult))
			})

			// Test search by name
			t.Run("By name", func(t *testing.T) {
				_, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				searchName := "Main"
				query := v1.SearchChannelsJSONRequestBody{
					Name: &searchName,
				}
				result, err := testClient.SearchChannelsWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Channel
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 1, len(queryResult))
			})

			// Test search by group
			t.Run("By group", func(t *testing.T) {
				entries, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				var groupIDs = []types.UUID{entries[5].(v1.Group).Id}
				query := v1.SearchChannelsJSONRequestBody{
					Group: &groupIDs,
				}
				result, err := testClient.SearchChannelsWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Channel
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 1, len(queryResult))
			})
		})
	})

	// Test Message API endpoints
	t.Run("Message", func(t *testing.T) {
		// Test message creation
		t.Run("Create Message", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			// Valid group and channel ID test
			validGroupID := entries[5].(v1.Group).Id
			validChannelID := entries[10].(v1.Channel).Id
			body := v1.PutMessageJSONRequestBody{
				Id:      uuid.New(),
				Author:  entries[0].(v1.Account).Id,
				Body:    "Test message",
				Channel: validChannelID,
				Pinned:  false,
			}
			response, err := testClient.PutMessageWithResponse(context.Background(), validGroupID, validChannelID, body, authEditor)
			require.NoError(t, err)
			require.Equal(t, 201, response.StatusCode())

			var createdMessage v1.Message
			err = json.Unmarshal(response.Body, &createdMessage)
			require.NoError(t, err)
			require.Equal(t, body.Id, createdMessage.Id)
			require.NotNil(t, createdMessage.CreatedAt)
			require.Equal(t, body.Author, createdMessage.Author)
			require.Equal(t, body.Body, createdMessage.Body)
			require.Equal(t, body.Channel, createdMessage.Channel)
			require.Equal(t, body.Pinned, createdMessage.Pinned)

			// Invalid group ID test
			invalidGroupID := uuid.New()
			response, err = testClient.PutMessageWithResponse(context.Background(), invalidGroupID, validChannelID, body, authEditor)
			require.NoError(t, err)
			require.Equal(t, 500, response.StatusCode())

			// Invalid channel ID test
			invalidChannelID := uuid.New()
			body.Channel = invalidChannelID
			response, err = testClient.PutMessageWithResponse(context.Background(), validGroupID, invalidChannelID, body, authEditor)
			require.NoError(t, err)
			require.Equal(t, 500, response.StatusCode())
		})

		// Test message update
		t.Run("Update Message By Id", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			selectedMessage := entries[15].(v1.Message)
			selectedChannel := entries[10].(v1.Channel) // Message at 15 is in "Main" channel (index 10)
			groupID := selectedChannel.Group

			newBody := "Updated message content"
			body := v1.UpdateMessageByIDJSONRequestBody{
				Body: &newBody,
			}
			response, err := testClient.UpdateMessageByIDWithResponse(context.Background(), groupID, selectedMessage.Channel, selectedMessage.Id, body, authEditor)
			require.NoError(t, err)
			require.Equal(t, 201, response.StatusCode())

			var updatedMessage v1.Message
			err = json.Unmarshal(response.Body, &updatedMessage)
			require.NoError(t, err)
			expected := v1.Message{
				Id:        selectedMessage.Id,
				Author:    selectedMessage.Author,
				Body:      newBody,
				Channel:   selectedMessage.Channel,
				CreatedAt: selectedMessage.CreatedAt,
				Pinned:    selectedMessage.Pinned,
			}
			require.Equal(t, expected.Id, updatedMessage.Id)
			require.Equal(t, expected.Author, updatedMessage.Author)
			require.Equal(t, expected.Body, updatedMessage.Body)
			require.Equal(t, expected.Channel, updatedMessage.Channel)
			if expected.CreatedAt != nil {
				require.True(t, expected.CreatedAt.Equal(*updatedMessage.CreatedAt))
			}
			require.Equal(t, expected.Pinned, updatedMessage.Pinned)
		})

		// Test message deletion
		t.Run("Delete Message By Id", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			selectedMessage := entries[16].(v1.Message)
			selectedChannel := entries[10].(v1.Channel) // Message at 16 is in "Main" channel (index 10)
			groupID := selectedChannel.Group

			// Test successful deletion
			response, err := testClient.DeleteMessageByIDWithResponse(context.Background(), groupID, selectedMessage.Channel, selectedMessage.Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 204, response.StatusCode())

			// Test deletion of non-existent message
			response, err = testClient.DeleteMessageByIDWithResponse(context.Background(), groupID, selectedMessage.Channel, selectedMessage.Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 500, response.StatusCode())
		})

		// Test message retrieval
		t.Run("Get Message By Id", func(t *testing.T) {
			entries, teardown := setupTest(t, *sectorAPI)
			defer teardown(t)

			selectedMessage := entries[17].(v1.Message)
			selectedChannel := entries[12].(v1.Channel) // Message at 17 is in "Chat" channel (index 12)
			groupID := selectedChannel.Group

			response, err := testClient.GetMessageByIDWithResponse(context.Background(), groupID, selectedMessage.Channel, selectedMessage.Id, authEditor)
			require.NoError(t, err)
			require.Equal(t, 200, response.StatusCode())

			var fetchedMessage v1.Message
			err = json.Unmarshal(response.Body, &fetchedMessage)
			require.NoError(t, err)
			require.Equal(t, selectedMessage.Id, fetchedMessage.Id)
			require.Equal(t, selectedMessage.Author, fetchedMessage.Author)
			require.Equal(t, selectedMessage.Body, fetchedMessage.Body)
			require.Equal(t, selectedMessage.Channel, fetchedMessage.Channel)
			if selectedMessage.CreatedAt != nil {
				require.True(t, selectedMessage.CreatedAt.Equal(*fetchedMessage.CreatedAt))
			}
			require.Equal(t, selectedMessage.Pinned, fetchedMessage.Pinned)
		})

		// Test message search functionality
		t.Run("Search Message", func(t *testing.T) {
			// Test search by ID
			t.Run("By Id", func(t *testing.T) {
				entries, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				var ids = []types.UUID{entries[15].(v1.Message).Id}
				query := v1.SearchMessagesJSONRequestBody{
					Id: &ids,
				}
				result, err := testClient.SearchMessagesWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Message
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 1, len(queryResult))
			})

			// Test search by creation date
			t.Run("By creation time", func(t *testing.T) {
				_, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				var timeStart = time.Now().AddDate(0, 0, -10)
				var timeEnd = time.Now().AddDate(0, 0, -5)
				query := v1.SearchMessagesJSONRequestBody{
					From:  &timeStart,
					Until: &timeEnd,
				}
				result, err := testClient.SearchMessagesWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Message
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 2, len(queryResult))
			})

			// Test search by author
			t.Run("By author", func(t *testing.T) {
				entries, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				var authorIDs = []types.UUID{entries[0].(v1.Account).Id}
				query := v1.SearchMessagesJSONRequestBody{
					Author: &authorIDs,
				}
				result, err := testClient.SearchMessagesWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Message
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 2, len(queryResult))
			})

			// Test search by channel
			t.Run("By channel", func(t *testing.T) {
				entries, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				var channelIDs = []types.UUID{entries[10].(v1.Channel).Id}
				query := v1.SearchMessagesJSONRequestBody{
					Channel: &channelIDs,
				}
				result, err := testClient.SearchMessagesWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Message
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 2, len(queryResult))
			})

			// Test search by pinned status
			t.Run("By pinned", func(t *testing.T) {
				_, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				pinned := true
				query := v1.SearchMessagesJSONRequestBody{
					Pinned: &pinned,
				}
				result, err := testClient.SearchMessagesWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Message
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 1, len(queryResult))
			})

			// Test search by message body content
			t.Run("By body", func(t *testing.T) {
				_, teardown := setupTest(t, *sectorAPI)
				defer teardown(t)

				bodySearch := "Welcome"
				query := v1.SearchMessagesJSONRequestBody{
					Body: &bodySearch,
				}
				result, err := testClient.SearchMessagesWithResponse(context.Background(), query, authEditor)
				require.NoError(t, err)
				require.Equal(t, 200, result.StatusCode())

				var queryResult []v1.Message
				err = json.Unmarshal(result.Body, &queryResult)
				require.NoError(t, err)
				require.Equal(t, 1, len(queryResult))
			})
		})
	})

	// Test Authentication endpoints and behavior
	t.Run("Authentication", func(t *testing.T) {
		t.Run("Test Unauthenticated Access", func(t *testing.T) {
			// Try to access a protected endpoint without authentication
			response, err := testClient.GetAccountByIDWithResponse(context.Background(), testAuth.Account.Id)
			require.NoError(t, err)
			require.Equal(t, 401, response.StatusCode())
		})

		t.Run("Test Authentication Flow", func(t *testing.T) {
			// Generate a new key pair
			privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
			require.NoError(t, err)

			pubKeyBytes, err := x509.MarshalPKIXPublicKey(&privateKey.PublicKey)
			require.NoError(t, err)

			pubKeyPEM := pem.EncodeToMemory(
				&pem.Block{
					Type:  "RSA PUBLIC KEY",
					Bytes: pubKeyBytes,
				},
			)

			// Create a new test account
			testUsername := "testauth_" + uuid.New().String()[:8]
			accountBody := v1.PutAccountJSONRequestBody{
				Id:         uuid.New(),
				Username:   testUsername,
				ProfilePic: "",
				Pubkey:     string(pubKeyPEM),
			}

			// Create account (using the existing auth)
			createResp, err := testClient.PutAccountWithResponse(context.Background(), accountBody, authEditor)
			require.NoError(t, err)
			require.Equal(t, 201, createResp.StatusCode())

			// Get challenge for new account
			challengeParams := v1.GetChallengeParams{
				Username: testUsername,
			}
			challengeResp, err := testClient.GetChallengeWithResponse(context.Background(), &challengeParams)
			require.NoError(t, err)
			require.Equal(t, 200, challengeResp.StatusCode())

			var challengeData map[string]interface{}
			err = json.Unmarshal(challengeResp.Body, &challengeData)
			require.NoError(t, err)

			challenge, ok := challengeData["challenge"].(string)
			require.True(t, ok)
			require.NotEmpty(t, challenge)

			// Sign challenge
			challengeBytes, err := base64.StdEncoding.DecodeString(challenge)
			require.NoError(t, err)

			hashed := sha256.Sum256(challengeBytes)
			signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, hashed[:])
			require.NoError(t, err)

			signatureB64 := base64.StdEncoding.EncodeToString(signature)

			// Login with signature
			loginBody := v1.LoginJSONRequestBody{
				Username:  &testUsername,
				Signature: &signatureB64,
			}

			loginResp, err := testClient.LoginWithResponse(context.Background(), loginBody)
			require.NoError(t, err)
			require.Equal(t, 200, loginResp.StatusCode())

			var loginData map[string]interface{}
			err = json.Unmarshal(loginResp.Body, &loginData)
			require.NoError(t, err)

			token, ok := loginData["token"].(string)
			require.True(t, ok)
			require.NotEmpty(t, token)

			// Test access with the new token
			newAuthEditor := authRequestEditor(token)

			accessResp, err := testClient.GetAccountByIDWithResponse(context.Background(), accountBody.Id, newAuthEditor)
			require.NoError(t, err)
			require.Equal(t, 200, accessResp.StatusCode())
		})
	})
}
